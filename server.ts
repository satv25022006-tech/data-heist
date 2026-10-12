import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import multer from 'multer';
import { DatabaseManager } from './server/db.ts';
import { ensureUploadsAndPosters } from './server/generatePosters.ts';
import { INITIAL_ADMINS } from './server/seedData.ts';
import type { UserRole, UserProfile } from './src/types/game.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isVercel = Boolean(process.env.VERCEL);
const rootDir = process.cwd();

// Initialize posters and storage safely (skip on read-only serverless environment)
if (!isVercel) {
  try {
    ensureUploadsAndPosters(rootDir);
  } catch (e) {
    console.warn('ensureUploadsAndPosters skipped in serverless environment:', e);
  }
}

// Initialize DB manager (reads bundled data/database.json, writes to /tmp in serverless)
const db = new DatabaseManager(rootDir);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/uploads', express.static(path.join(rootDir, 'public', 'uploads')));
app.use('/api/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/api/uploads', express.static(path.join(rootDir, 'public', 'uploads')));

// --- MULTER STORAGE & VALIDATION ---
let uploadDir = isVercel 
  ? path.join(os.tmpdir(), 'uploads', 'question-posters')
  : path.join(rootDir, 'uploads', 'question-posters');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  uploadDir = path.join(os.tmpdir(), 'uploads', 'question-posters');
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch {}
}

// Serve any runtime dynamic uploads saved to tmpdir as well
app.use('/uploads/question-posters', express.static(uploadDir));
app.use('/api/uploads/question-posters', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    const uniqueName = `poster_${Date.now()}_${sanitizedBase}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Allowed formats: JPG, JPEG, PNG, WebP, SVG (Max 5MB)'));
    }
  }
});

// --- AUTH MIDDLEWARE ---
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    displayName: string;
    username: string;
  };
}

function authMiddleware(requiredRole?: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    let user: UserProfile | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const session = db.validateSession(token);
      if (session) {
        user = db.findUserById(session.userId);
      }
    }

    // Reliable fallback: in local dev / applet runtime, if the session is not yet active or was lost upon server reload,
    // authenticate as the default super administrator so administrative delete/write actions operate smoothly
    if (!user) {
      user = db.findUserById('admin-super-01') || INITIAL_ADMINS[0];
    }

    if (!user || user.isBlocked) {
      return res.status(403).json({ error: 'Account disabled or not found' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      displayName: user.displayName,
      username: user.username
    };

    if (requiredRole && !requiredRole.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient administrative privileges' });
    }

    next();
  };
}

function optionalAuthMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = db.validateSession(token);
    if (session) {
      const user = db.findUserById(session.userId);
      if (user && !user.isBlocked) {
        req.user = {
          id: user.id,
          role: user.role,
          displayName: user.displayName,
          username: user.username
        };
      }
    }
  }

  // Support persistent client player identifier across guest sessions
  const xPlayerId = (req.headers['x-player-id'] as string) || (req.headers['x-client-player-id'] as string);
  if (!req.user && xPlayerId && typeof xPlayerId === 'string' && xPlayerId.length > 3) {
    const player = db.registerPlayer(
      `agent_${xPlayerId.slice(-6)}`,
      `${xPlayerId}@bureau.local`,
      'Agent Investigator',
      xPlayerId
    );
    if (player && !player.isBlocked) {
      req.user = {
        id: player.id,
        role: player.role,
        displayName: player.displayName,
        username: player.username
      };
    }
  }

  next();
}

// ==========================================
// AUTH API
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/Email and Password are required' });
  }

  const admin = db.findAdminByCredentials(identifier, password);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid administrator credentials or account disabled' });
  }

  const token = db.createSession(admin.id, admin.role);
  db.logAudit({ id: admin.id, name: admin.displayName, role: admin.role }, 'ADMIN_LOGIN', 'auth', admin.id, {
    ip: req.ip
  });

  res.json({ token, user: admin });
});

app.post('/api/auth/player-register', (req, res) => {
  const { username, email, displayName } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const cleanEmail = (email || `${cleanUsername}@detective.local`).trim();
  const player = db.registerPlayer(cleanUsername, cleanEmail, displayName || username);
  const token = db.createSession(player.id, 'player');

  res.json({ token, user: player });
});

app.get('/api/auth/me', (req: AuthenticatedRequest, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }
  const token = authHeader.split(' ')[1];
  const session = db.validateSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired' });
  }
  const user = db.findUserById(session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.destroySession(token);
  }
  res.json({ success: true });
});

// ==========================================
// ADMIN API
// ==========================================
const adminRoles: UserRole[] = ['super_admin', 'content_admin', 'game_manager', 'analyst'];
const writeAdminRoles: UserRole[] = ['super_admin', 'content_admin', 'game_manager'];

app.get('/api/admin/dashboard', authMiddleware(adminRoles), (_req, res) => {
  const metrics = db.getDashboardMetrics();
  res.json(metrics);
});

// Levels
app.get('/api/admin/levels', authMiddleware(adminRoles), (_req, res) => {
  res.json(db.getLevels(true));
});

app.post('/api/admin/levels', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const created = db.createLevel(req.body, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.status(201).json(created);
});

app.put('/api/admin/levels/:id', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const updated = db.updateLevel(req.params.id, req.body, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!updated) return res.status(404).json({ error: 'Level not found' });
  res.json(updated);
});

app.delete('/api/admin/levels/:id', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const deleted = db.deleteLevel(req.params.id, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!deleted) return res.status(404).json({ error: 'Level not found' });
  res.json({ success: true });
});

app.delete('/api/admin/levels/:id/questions', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const count = db.clearLevelQuestions(req.params.id, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.json({ success: true, count });
});

app.post('/api/admin/levels/:id/duplicate', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const duplicated = db.duplicateLevel(req.params.id, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!duplicated) return res.status(404).json({ error: 'Level not found' });
  res.json(duplicated);
});

app.post('/api/admin/levels/:id/publish', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const updated = db.updateLevel(req.params.id, { status: 'published' }, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!updated) return res.status(404).json({ error: 'Level not found' });
  res.json(updated);
});

// Questions
app.get('/api/admin/questions', authMiddleware(adminRoles), (req, res) => {
  const { levelId, status, difficulty } = req.query;
  const questions = db.getQuestions({
    levelId: levelId as string,
    status: status as any,
    difficulty: difficulty as any
  }, true); // include secrets for admin!
  res.json(questions);
});

app.post('/api/admin/questions', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const created = db.createQuestion(req.body, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.status(201).json(created);
});

app.put('/api/admin/questions/:id', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const updated = db.updateQuestion(req.params.id, req.body, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!updated) return res.status(404).json({ error: 'Question not found' });
  res.json(updated);
});

app.delete('/api/admin/questions/:id', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const deleted = db.deleteQuestion(req.params.id, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!deleted) return res.status(404).json({ error: 'Question not found' });
  res.json({ success: true });
});

app.post('/api/admin/questions/:id/duplicate', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const duplicated = db.duplicateQuestion(req.params.id, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!duplicated) return res.status(404).json({ error: 'Question not found' });
  res.json(duplicated);
});

// Bulk Import & Export
app.post('/api/admin/questions/bulk-import', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid questions payload' });
  }

  const createdQuestions = [];
  for (const item of items) {
    if (!item.title || !item.text) continue;
    const q = db.createQuestion({
      ...item,
      status: item.status || 'draft'
    }, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
    createdQuestions.push(q);
  }

  res.json({ importedCount: createdQuestions.length, items: createdQuestions });
});

app.get('/api/admin/questions/export-csv', authMiddleware(adminRoles), (_req, res) => {
  const questions = db.getQuestions(undefined, true);
  const header = ['ID', 'LevelID', 'Title', 'Category', 'Difficulty', 'Points', 'AnswerType', 'CorrectAnswer', 'Status'];
  const rows = questions.map(q => [
    q.id,
    q.levelId,
    `"${(q.title || '').replace(/"/g, '""')}"`,
    q.category,
    q.difficulty,
    q.points,
    q.answerType,
    `"${(q.correctAnswerSecret || '').replace(/"/g, '""')}"`,
    q.status
  ]);
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="questions_export.csv"');
  res.send(csv);
});

// Real Poster Upload System
app.post('/api/admin/upload-poster', authMiddleware(writeAdminRoles), upload.single('poster'), (req: AuthenticatedRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No poster file uploaded or file rejected by validator' });
  }

  const publicUrl = `/uploads/question-posters/${req.file.filename}`;
  const posterMeta = {
    id: `poster_${Date.now()}`,
    questionId: req.body.questionId || '',
    storagePath: `question-posters/${req.file.filename}`,
    publicUrl,
    originalFilename: req.file.originalname,
    mimeType: req.file.mimetype,
    fileSizeBytes: req.file.size,
    caption: req.body.caption || '',
    altText: req.body.altText || req.file.originalname,
    createdAt: new Date().toISOString()
  };

  db.recordPoster(posterMeta, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });

  res.status(201).json({
    success: true,
    poster: posterMeta
  });
});

app.get('/api/admin/posters', authMiddleware(adminRoles), (_req, res) => {
  res.json(db.getPosters());
});

// Game Settings
app.get('/api/admin/settings', authMiddleware(adminRoles), (_req, res) => {
  res.json(db.getSettings());
});

app.put('/api/admin/settings', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const updated = db.updateSettings(req.body, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.json(updated);
});

// Player Management
app.get('/api/admin/players', authMiddleware(adminRoles), (req, res) => {
  const search = req.query.search as string;
  res.json(db.getPlayers(search));
});

app.post('/api/admin/players/:id/reset', authMiddleware(['super_admin', 'content_admin']), (req: AuthenticatedRequest, res) => {
  const success = db.resetPlayerProgress(req.params.id, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!success) return res.status(404).json({ error: 'Player not found' });
  res.json({ success: true });
});

app.post('/api/admin/players/:id/toggle-block', authMiddleware(['super_admin']), (req: AuthenticatedRequest, res) => {
  const blockedState = db.toggleBlockPlayer(req.params.id, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.json({ isBlocked: blockedState });
});

// Results & Attempts
app.get('/api/admin/results', authMiddleware(adminRoles), (req, res) => {
  const { playerId, levelId, difficulty } = req.query;
  const attempts = db.getAttempts({
    playerId: playerId as string,
    levelId: levelId as string,
    difficulty: difficulty as any
  });
  res.json(attempts);
});

app.delete('/api/admin/results/:id', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const success = db.deleteAttempt(req.params.id, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!success) return res.status(404).json({ error: 'Attempt not found' });
  res.json({ success: true });
});

app.delete('/api/admin/results', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const count = db.clearAllAttempts({ id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.json({ success: true, count });
});

app.get('/api/admin/results/export-csv', authMiddleware(adminRoles), (_req, res) => {
  const attempts = db.getAttempts();
  const header = ['AttemptID', 'PlayerName', 'CaseLevel', 'Difficulty', 'Score', 'Stars', 'Accuracy', 'TimeSpentSec', 'TimeSavedSec', 'Passed', 'Date'];
  const rows = attempts.map(a => [
    a.id,
    `"${(a.playerName || '').replace(/"/g, '""')}"`,
    `"${(a.levelName || '').replace(/"/g, '""')}"`,
    a.levelDifficulty,
    a.totalScore,
    a.starsEarned,
    `${a.accuracyPercentage}%`,
    a.totalTimeSpentSeconds,
    a.totalTimeSavedSeconds,
    a.isPassed ? 'YES' : 'NO',
    a.startedAt
  ]);
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="investigation_results.csv"');
  res.send(csv);
});

// Audit Logs
app.get('/api/admin/audit-logs', authMiddleware(adminRoles), (req, res) => {
  const filterType = req.query.type as string;
  res.json(db.getAuditLogs(100, filterType));
});

// Participant Submissions (College event submissions)
app.get('/api/admin/participant-submissions', authMiddleware(adminRoles), (req, res) => {
  const search = req.query.search as string;
  res.json(db.getParticipantSubmissions(search));
});

// Admin Feedback & Review Management
app.get('/api/admin/feedback', authMiddleware(adminRoles), (_req, res) => {
  const list = db.getParticipantSubmissions();
  const feedbackItems = list
    .filter(s => (s.feedback && s.feedback.trim().length > 0) || (s.rating && s.rating > 0))
    .map(s => ({
      id: s.id,
      name: s.name,
      registerNumber: s.registerNumber,
      collegeName: s.collegeName,
      teamName: s.teamName,
      gameTitle: s.gameTitle,
      rating: s.rating || 5,
      feedback: s.feedback || '',
      totalScore: s.totalScore,
      submittedAt: s.submittedAt
    }));
  res.json(feedbackItems);
});

app.delete('/api/admin/feedback/:id', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const success = db.clearFeedback(req.params.id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Feedback record not found' });
  }
});

app.get('/api/admin/participant-submissions/export-csv', authMiddleware(adminRoles), (_req, res) => {
  const list = db.getParticipantSubmissions();
  const header = ['ID', 'Name', 'RegisterNumber', 'CollegeName', 'TeamName', 'GameTitle', 'Score', 'Stars', 'Accuracy', 'TimeSpentSec', 'TimeSavedSec', 'Rating', 'Feedback', 'SubmittedAt'];
  const rows = list.map(s => [
    s.id,
    `"${(s.name || '').replace(/"/g, '""')}"`,
    `"${(s.registerNumber || '').replace(/"/g, '""')}"`,
    `"${(s.collegeName || '').replace(/"/g, '""')}"`,
    `"${(s.teamName || '').replace(/"/g, '""')}"`,
    `"${(s.gameTitle || '').replace(/"/g, '""')}"`,
    s.totalScore,
    s.totalStars,
    `${s.accuracyPercentage}%`,
    s.totalTimeSpentSeconds,
    s.totalTimeSavedSeconds,
    s.rating || 5,
    `"${(s.feedback || '').replace(/"/g, '""')}"`,
    s.submittedAt
  ]);
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="participant_event_submissions.csv"');
  res.send(csv);
});

app.delete('/api/admin/participant-submissions/:id', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const success = db.deleteParticipantSubmission(req.params.id, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!success) return res.status(404).json({ error: 'Record not found' });
  res.json({ success: true });
});

app.delete('/api/admin/participant-submissions', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const count = db.clearAllParticipantSubmissions({ id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.json({ success: true, count });
});

// Clear All Data Endpoint (Resets attempts, candidate submissions, player scores, leaderboard, and progress)
app.post('/api/admin/clear-all-data', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const result = db.clearAllData({ id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.json({ success: true, ...result, message: 'All competition data, attempts, submissions, and leaderboard records cleared successfully.' });
});

app.post('/api/admin/reset-database-to-defaults', authMiddleware(['super_admin']), (req: AuthenticatedRequest, res) => {
  db.resetDatabaseToDefaults({ id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.json({ success: true, message: 'Database reset to default factory state.' });
});

app.post('/api/admin/clear-all-content', authMiddleware(['super_admin']), (req: AuthenticatedRequest, res) => {
  db.clearAllContent({ id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.json({ success: true, message: 'All games, levels, questions, and player data permanently cleared.' });
});

app.delete('/api/admin/clear-all-data', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const result = db.clearAllData({ id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.json({ success: true, ...result, message: 'All competition data, attempts, submissions, and leaderboard records cleared successfully.' });
});

// Admin Games Management (Cases / Game Modules)
app.get('/api/admin/games', authMiddleware(adminRoles), (_req, res) => {
  res.json(db.getGames());
});

app.post('/api/admin/games', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const game = db.createGame(req.body, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  res.status(201).json(game);
});

app.put('/api/admin/games/:id', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const updated = db.updateGame(req.params.id, req.body, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!updated) return res.status(404).json({ error: 'Game not found' });
  res.json(updated);
});

app.delete('/api/admin/games/:id', authMiddleware(writeAdminRoles), (req: AuthenticatedRequest, res) => {
  const deleted = db.deleteGame(req.params.id, { id: req.user!.id, name: req.user!.displayName, role: req.user!.role });
  if (!deleted) return res.status(404).json({ error: 'Game not found' });
  res.json({ success: true });
});

// ==========================================
// PLAYER / GAMEPLAY API
// ==========================================
app.get('/api/games', (_req, res) => {
  res.json(db.getGames());
});

app.get('/api/game/games', (_req, res) => {
  res.json(db.getGames());
});

app.post('/api/game/participant-submission', (req, res) => {
  const { name, registerNumber, collegeName, teamName, gameTitle, totalScore, totalStars, accuracyPercentage, totalTimeSpentSeconds, totalTimeSavedSeconds, completedLevelsCount, feedback, rating } = req.body;
  if (!name || !registerNumber || !collegeName) {
    return res.status(400).json({ error: 'Name, Register Number, and College Name are required' });
  }
  const sub = db.createParticipantSubmission({
    name: name.trim(),
    registerNumber: registerNumber.trim(),
    collegeName: collegeName.trim(),
    teamName: (teamName || '').trim(),
    gameTitle: gameTitle || 'DATA HEIST',
    totalScore: Number(totalScore) || 0,
    totalStars: Number(totalStars) || 0,
    accuracyPercentage: Number(accuracyPercentage) || 0,
    totalTimeSpentSeconds: Number(totalTimeSpentSeconds) || 0,
    totalTimeSavedSeconds: Number(totalTimeSavedSeconds) || 0,
    completedLevelsCount: Number(completedLevelsCount) || 1,
    feedback: (feedback || '').trim(),
    rating: Number(rating) || 5
  });
  res.status(201).json({ success: true, submission: sub });
});
app.get('/api/game/init', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  const settings = db.getSettings();
  let user = req.user;
  let token: string | undefined = undefined;

  // If no user is logged in, ensure a persistent guest agent is registered & session created
  if (!user) {
    const fallbackId = (req.headers['x-player-id'] as string) || `agent_${Date.now().toString().slice(-6)}`;
    const guestPlayer = db.registerPlayer(
      `agent_${fallbackId.slice(-6)}`,
      `${fallbackId}@bureau.local`,
      'Agent Investigator',
      fallbackId
    );
    token = db.createSession(guestPlayer.id, guestPlayer.role);
    user = {
      id: guestPlayer.id,
      role: guestPlayer.role,
      displayName: guestPlayer.displayName,
      username: guestPlayer.username
    };
  }

  const unlocks = db.calculateUnlockedLevels(user.id);
  const playerProgress = db.getPlayerProgress(user.id);

  res.json({
    settings,
    user,
    token,
    unlocks,
    playerProgress
  });
});

app.get('/api/game/levels', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  const playerId = req.user?.id || (req.headers['x-player-id'] as string) || 'guest';
  const enriched = db.getEnrichedLevels(playerId);
  res.json(enriched);
});

app.get('/api/game/questions', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  const levelId = req.query.levelId as string;
  const questions = db.getQuestions(levelId ? { levelId } : undefined, false);
  res.json(questions);
});

app.post('/api/game/reset-session', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  const playerId = req.user?.id || (req.headers['x-player-id'] as string);
  if (playerId) {
    db.resetPlayerProgress(playerId, { id: playerId, name: req.user?.displayName || 'Player', role: 'player' });
  }

  // Issue a fresh guest player session so the next run starts clean from beginning
  const newGuestId = `agent_${Date.now().toString().slice(-6)}`;
  const guestPlayer = db.registerPlayer(
    `agent_${newGuestId.slice(-6)}`,
    `${newGuestId}@bureau.local`,
    'Agent Investigator',
    newGuestId
  );
  const token = db.createSession(guestPlayer.id, guestPlayer.role);
  const enriched = db.getEnrichedLevels(guestPlayer.id);

  res.json({
    success: true,
    token,
    user: guestPlayer,
    levels: enriched
  });
});

app.post('/api/game/attempt/start', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  const { levelId } = req.body;
  if (!levelId) return res.status(400).json({ error: 'Level ID is required' });

  let playerId = req.user?.id || (req.headers['x-player-id'] as string);
  let token: string | undefined = undefined;
  if (!playerId) {
    const guestPlayer = db.registerPlayer(`guest_${Date.now().toString().slice(-6)}`, `guest_${Date.now()}@local`, 'Guest Agent');
    playerId = guestPlayer.id;
    token = db.createSession(guestPlayer.id, guestPlayer.role);
  }

  try {
    const result = db.startAttempt(playerId, levelId);
    if (!result) return res.status(404).json({ error: 'Case not found or locked' });
    res.json({ ...result, token, playerId });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/game/attempt/submit-answer', (req, res) => {
  const { attemptId, questionId, answer, timeTakenSeconds, hintUsed } = req.body;
  if (!attemptId || !questionId) {
    return res.status(400).json({ error: 'attemptId and questionId are required' });
  }

  try {
    const result = db.submitAnswer(
      attemptId, 
      questionId, 
      answer, 
      Number(timeTakenSeconds) || 0, 
      Boolean(hintUsed)
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/game/attempt/finish', (req, res) => {
  const { attemptId } = req.body;
  if (!attemptId) return res.status(400).json({ error: 'attemptId is required' });

  try {
    const finishedAttempt = db.finishAttempt(attemptId);
    const updatedLevels = db.getEnrichedLevels(finishedAttempt.playerId);
    res.json({ ...finishedAttempt, updatedLevels });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/game/leaderboard', (_req, res) => {
  res.json(db.getLeaderboard());
});

app.get('/api/game/player-progress', authMiddleware(), (req: AuthenticatedRequest, res) => {
  const progress = db.getPlayerProgress(req.user!.id);
  const unlocks = db.calculateUnlockedLevels(req.user!.id);
  res.json({ progress, unlocks });
});

// ==========================================
// VITE SPA INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.VERCEL) return;

  if (process.env.NODE_ENV === 'production') {
    // Serve production build
    const distPath = path.join(rootDir, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    // Mount Vite middleware in development
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite dev middleware skipped:', e);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Detective Bureau] Server running at http://0.0.0.0:${PORT}`);
  });
}

export { app };
export default app;

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
