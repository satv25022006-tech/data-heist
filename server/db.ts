import fs from 'fs';
import path from 'path';
import os from 'os';
import type { 
  GameSettings, 
  Level, 
  Question, 
  UserProfile, 
  PlayerAttempt, 
  PlayerProgress, 
  AuditLog, 
  QuestionPoster,
  LeaderboardEntry,
  ContentStatus,
  LevelDifficulty,
  UserRole,
  ParticipantSubmission,
  GameCard
} from '../src/types/game.ts';
import { 
  DEFAULT_SETTINGS, 
  INITIAL_ADMINS, 
  INITIAL_LEVELS, 
  INITIAL_QUESTIONS, 
  INITIAL_PLAYERS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_POSTERS 
} from './seedData.ts';

export const INITIAL_GAMES: GameCard[] = [
  {
    id: 'game-data-heist',
    slug: 'data-heist',
    title: 'SMIT CENTRAK FORENSIC CRIME BUREAU: Cyber Forensic Intrusion',
    tagline: 'Quantum Server Perimeter Breach & Malware Analysis',
    description: 'An intrusion alarm was triggered at 02:41 AM inside the Apex Quantum Reserve server bank. Intercept rogue packet logs, detect cloned NFC access badges, and decrypt Trojan memory payloads.',
    category: 'Cyber Forensics',
    icon: 'fingerprint',
    badge: 'Featured Event',
    totalLevels: 3,
    estimatedTime: '15-20 Mins',
    rules: [
      'Each team must clear exhibits one by one under strict countdown timers.',
      'Easy is open immediately. Medium requires 2 stars on Easy. Hard requires 2 stars on Medium.',
      'Speed bonus awarded for unused time; wrong answers and hints incur point penalties.',
      'Upon clearing levels, enter your Name, Register Number, College Name, and Team Name to submit final official records.'
    ],
    translations: {
      ta: {
        title: 'டேட்டா ஹெயிஸ்ட்: சைபர் கிரைம் ஊடுருவல்',
        tagline: 'குவாண்டம் சர்வர் எல்லை மீறல் & மால்வேர் பகுப்பாய்வு',
        description: 'அபெக்ஸ் குவாண்டம் ரிசர்வ் சர்வர் வங்கியில் அதிகாலை 02:41 மணிக்கு ஊடுருவல் எச்சரிக்கை ஒலித்தது. தவறான பாக்கெட் பதிவுகளை இடைமறிக்கவும், நகல் எடுக்கப்பட்ட NFC அணுகல் பேட்ஜ்களைக் கண்டறியவும் மற்றும் ட்ரோஜன் மெமரி பேலோடை டிகோட் செய்யவும்.',
        category: 'சைபர் தடயவியல்',
        rules: [
          'ஒவ்வொரு குழுவும் கடுமையான கவுண்ட்டவுன் டைமரின் கீழ் ஆதாரங்களை ஒவ்வொன்றாக ஆராய்ந்து முடிக்க வேண்டும்.',
          'எளிதான நிலை (Easy) உடனடியாக திறக்கப்பட்டுள்ளது. நடுத்தர நிலைக்கு (Medium) Easy-ல் 2 நட்சத்திரங்கள் தேவை. கடின நிலைக்கு (Hard) Medium-ல் 2 நட்சத்திரங்கள் தேவை.',
          'மீதமுள்ள நேரத்திற்கு வேக போனஸ் புள்ளிகள் வழங்கப்படும்; தவறான பதில்களுக்கும் குறிப்புகளுக்கும் புள்ளிகள் குறைக்கப்படும்.',
          'விசாரணை அமர்வை முடித்த பிறகு, அதிகாரப்பூர்வ போட்டி நிலையைப் பெற பெயர், பதிவு எண், கல்லூரி பெயர் மற்றும் குழுப் பெயரைச் சமர்ப்பிக்கவும்.'
        ]
      }
    }
  },
  {
    id: 'game-blackwood-manor',
    slug: 'blackwood-manor',
    title: 'THE BLACKWOOD MANOR CIPHER',
    tagline: 'Locked Study Crime Dynamics & Chronometer Discrepancy',
    description: 'Lord Blackwood was found paralyzed in his locked study with his cryptographic safe emptied. Investigate French door shatter ballistics, tea toxicology, and pendulum clock gear jams.',
    category: 'Forensics & Ballistics',
    icon: 'shield',
    badge: 'Victorian Cryptography',
    totalLevels: 3,
    estimatedTime: '15 Mins',
    rules: [
      'Examine physical evidence diagrams, chemical spectra, and time logs.',
      'Decisions are finalized per exhibit submission.',
      'Complete all levels to finalize college symposium ranking.'
    ],
    translations: {
      ta: {
        title: 'பிளாக்வுட் மேனர் மர்ம சங்கேதம்',
        tagline: 'பூட்டிய அறை குற்ற இயக்கவியல் & கடிகார முரண்பாடு',
        description: 'லார்ட் பிளாக்வுட் பூட்டப்பட்ட அவரது அறையில் மயக்கமுற்ற நிலையில் கண்டெடுக்கப்பட்டார், அவரது ரகசிய சேஃப் பெட்டகம் காலியாக இருந்தது. பிரெஞ்சு கதவு கண்ணாடி உடைப்பு பாலிஸ்டிக்ஸ், தேநீர் நச்சுத்தன்மை மற்றும் கடிகார முள் நெரிசலை ஆராயுங்கள்.',
        category: 'தடயவியல் & பாலிஸ்டிக்ஸ்',
        rules: [
          'உடற்கூறு சான்றுகள், வேதியியல் நிறமாலை மற்றும் நேரப் பதிவுகளை கவனமாக ஆய்வு செய்யவும்.',
          'ஒவ்வொரு ஆதாரத்திற்கும் உங்கள் துப்பறியும் முடிவை உறுதிப்படுத்திய பின் மாற்ற முடியாது.',
          'கல்லூரி சிம்போசியம் தரவரிசையை உறுதிப்படுத்த அனைத்து நிலைகளையும் முடிக்கவும்.'
        ]
      }
    }
  },
  {
    id: 'game-obsidian-syndicate',
    slug: 'obsidian-vault',
    title: 'THE OBSIDIAN SYNDICATE VAULT',
    tagline: 'Biometric Laser Grid Bypass & Maritime Extraction',
    description: 'The international syndicate Obsidian 7 breached the deep subterranean reserve. Disarm optical laser grids, identify getaway vessel exhaust heat plumes on satellite, and decode Caesar shift telegrams.',
    category: 'High Infiltration',
    icon: 'vault',
    badge: 'Syndicate Threat',
    totalLevels: 3,
    estimatedTime: '20 Mins',
    rules: [
      'Ground bypass nodes according to optical frequency wavelengths.',
      'Satellite infrared signatures distinguish idling getaway crafts.',
      'Final submission registers official symposium standing.'
    ],
    translations: {
      ta: {
        title: 'அப்சிடியன் சிண்டிகேட் சுரங்கப் பெட்டகம்',
        tagline: 'பயோமெட்ரிக் லேசர் கிரிட் புறக்கணிப்பு & கடல் தப்பித்தல்',
        description: 'சர்வதேச குற்றக் கும்பல் அப்சிடியன் 7 ஆழமான நிலத்தடி சேமிப்பகத்தை ஊடுருவியது. ஆப்டிகல் லேசர் கிரிட்களை செயலிழக்கச் செய்யவும், செயற்கைக்கோளில் தப்பியோடும் படகின் என்ஜின் வெப்பப் புகையை அடையாளம் காணவும் மற்றும் சீசர் ஷிப்ட் செய்திகளை டிகோட் செய்யவும்.',
        category: 'உயர் ஊடுருவல்',
        rules: [
          'லேசர் அதிர்வெண் அலைநீளங்களின் அடிப்படையில் சரியான பைபாஸ் முனைகளை தரையிறக்கவும்.',
          'செயற்கைக்கோள் அகச்சிவப்பு கையொப்பங்கள் தப்பிக்கும் படகுகளை துல்லியமாக வேறுபடுத்துகின்றன.',
          'இறுதி சமர்ப்பிப்பு அதிகாரப்பூர்வ போட்டித் தரவரிசையில் உங்கள் இடத்தை பதிவு செய்யும்.'
        ]
      }
    }
  }
];

export const INITIAL_PARTICIPANTS: ParticipantSubmission[] = [];

interface DatabaseSchema {
  settings: GameSettings;
  admins: (UserProfile & { passwordHash: string })[];
  players: UserProfile[];
  games: GameCard[];
  levels: Level[];
  questions: Question[];
  posters: QuestionPoster[];
  attempts: PlayerAttempt[];
  progress: Record<string, PlayerProgress[]>; // playerId -> progress list
  participantSubmissions: ParticipantSubmission[];
  auditLogs: AuditLog[];
}

export class DatabaseManager {
  private dbPath: string;
  private data: DatabaseSchema;
  private sessionTokens: Map<string, { userId: string; role: UserRole; expiresAt: number }> = new Map();

  constructor(rootDir: string = process.cwd()) {
    const bundledPath = path.join(rootDir, 'data', 'database.json');
    const tmpDataDir = path.join(os.tmpdir(), 'detective_data');
    const tmpDbPath = path.join(tmpDataDir, 'database.json');

    if (process.env.VERCEL) {
      this.dbPath = tmpDbPath;
      try {
        if (!fs.existsSync(tmpDataDir)) {
          fs.mkdirSync(tmpDataDir, { recursive: true });
        }
        if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledPath)) {
          fs.copyFileSync(bundledPath, tmpDbPath);
        }
      } catch (err) {
        console.warn('Vercel tmp DB init notice:', err);
      }
    } else {
      let dataDir = path.join(rootDir, 'data');
      try {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
      } catch {}
      this.dbPath = path.join(dataDir, 'database.json');
    }
    this.data = this.loadOrSeedDatabase(bundledPath);
  }

  private getInitialDatabase(): DatabaseSchema {
    return {
      settings: DEFAULT_SETTINGS,
      admins: INITIAL_ADMINS,
      players: INITIAL_PLAYERS,
      games: [...INITIAL_GAMES],
      levels: [...INITIAL_LEVELS],
      questions: [...INITIAL_QUESTIONS],
      participantSubmissions: INITIAL_PARTICIPANTS,
      posters: [...INITIAL_POSTERS],
      attempts: [],
      progress: {},
      auditLogs: INITIAL_AUDIT_LOGS
    };
  }

  private loadOrSeedDatabase(bundledPath?: string): DatabaseSchema {
    const candidatePath = fs.existsSync(this.dbPath) ? this.dbPath : (bundledPath && fs.existsSync(bundledPath) ? bundledPath : null);

    if (candidatePath) {
      try {
        const fileContent = fs.readFileSync(candidatePath, 'utf8');
        const parsed = JSON.parse(fileContent);
        // Ensure all required collections exist
        const levelsList = (parsed.levels || INITIAL_LEVELS).map((lvl: any, index: number) => {
          if (!lvl.gameId) {
            if (lvl.id?.includes('heist') || index === 0) lvl.gameId = 'game-data-heist';
            else if (lvl.id?.includes('manor') || index === 1) lvl.gameId = 'game-blackwood-manor';
            else if (lvl.id?.includes('syndicate') || index === 2) lvl.gameId = 'game-obsidian-syndicate';
            else lvl.gameId = 'game-data-heist';
          }
          return lvl;
        });

        const loaded: DatabaseSchema = {
          settings: parsed.settings || DEFAULT_SETTINGS,
          admins: parsed.admins || INITIAL_ADMINS,
          players: Array.isArray(parsed.players) ? parsed.players : [],
          games: parsed.games || INITIAL_GAMES,
          levels: levelsList,
          questions: parsed.questions || INITIAL_QUESTIONS,
          posters: parsed.posters || [],
          attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
          progress: parsed.progress || {},
          participantSubmissions: Array.isArray(parsed.participantSubmissions) ? parsed.participantSubmissions : [],
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : []
        };

        // If we loaded from bundledPath instead of tmp, attempt to cache into this.dbPath
        if (candidatePath !== this.dbPath) {
          this.saveData(loaded);
        }

        return loaded;
      } catch (err) {
        console.error('Failed to parse database.json, reseeding default dataset.', err);
      }
    }

    const initialDb = this.getInitialDatabase();

    this.saveData(initialDb);
    return initialDb;
  }

  resetDatabaseToDefaults(actor: { id: string; name: string; role: UserRole }): void {
    this.data = this.getInitialDatabase();
    this.saveData();
    this.logAudit(actor, 'DATABASE_RESET_TO_DEFAULTS', 'system', 'database', {});
  }

  clearAllContent(actor: { id: string; name: string; role: UserRole }): void {
    this.data = {
      ...this.data,
      games: [],
      levels: [],
      questions: [],
      posters: [],
      attempts: [],
      participantSubmissions: [],
      players: [],
      progress: {},
      auditLogs: []
    };
    this.logAudit(actor, 'CONTENT_CLEARED_ALL', 'system', 'database', {});
    this.saveData();
  }

  clearGameData(gameId: string, actor: { id: string; name: string; role: UserRole }): void {
    const levelIds = this.data.levels.filter(l => l.gameId === gameId).map(l => l.id);
    const questionIds = this.data.questions.filter(q => levelIds.includes(q.levelId)).map(q => q.id);

    this.data.levels = this.data.levels.filter(l => l.gameId !== gameId);
    this.data.questions = this.data.questions.filter(q => !levelIds.includes(q.levelId));
    this.data.posters = this.data.posters.filter(p => !questionIds.includes(p.questionId));
    this.data.attempts = this.data.attempts.filter(a => !levelIds.includes(a.levelId));
    
    // Clear progress for levels of this game
    Object.keys(this.data.progress).forEach(playerId => {
      this.data.progress[playerId] = this.data.progress[playerId].filter(p => !levelIds.includes(p.levelId));
    });

    this.logAudit(actor, 'GAME_DATA_CLEARED', 'game', gameId, {});
    this.saveData();
  }

  resetGameToDefaults(gameId: string, actor: { id: string; name: string; role: UserRole }): void {
    this.clearGameData(gameId, actor);
    
    const gameLevels = INITIAL_LEVELS.filter(l => l.gameId === gameId);
    const gameQuestionIds = gameLevels.map(l => l.id);
    const gameQuestions = INITIAL_QUESTIONS.filter(q => gameQuestionIds.includes(q.levelId));
    const gamePosters = INITIAL_POSTERS.filter(p => gameQuestions.map(q => q.id).includes(p.questionId));

    this.data.levels.push(...gameLevels);
    this.data.questions.push(...gameQuestions);
    this.data.posters.push(...gamePosters);

    this.logAudit(actor, 'GAME_RESET_TO_DEFAULTS', 'game', gameId, {});
    this.saveData();
  }

  clearUserDataOnly(actor: { id: string; name: string; role: UserRole }): void {
    this.data = {
      ...this.data,
      attempts: [],
      participantSubmissions: [],
      players: [],
      progress: {},
      auditLogs: []
    };
    this.logAudit(actor, 'USER_DATA_CLEARED', 'system', 'database', {});
    this.saveData();
  }

  private saveData(dataToSave: DatabaseSchema = this.data) {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempPath = `${this.dbPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf8');
      fs.renameSync(tempPath, this.dbPath);
    } catch (err) {
      console.warn('Notice: Could not persist database to disk in this environment:', err);
    }
  }

  // --- SESSIONS & AUTH ---
  createSession(userId: string, role: UserRole): string {
    const token = `sess_${Buffer.from(`${userId}_${Date.now()}_${Math.random()}`).toString('base64url')}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    this.sessionTokens.set(token, { userId, role, expiresAt });
    return token;
  }

  validateSession(token: string): { userId: string; role: UserRole } | null {
    if (!token) return null;
    const session = this.sessionTokens.get(token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      this.sessionTokens.delete(token);
      return null;
    }
    return { userId: session.userId, role: session.role };
  }

  destroySession(token: string) {
    this.sessionTokens.delete(token);
  }

  findAdminByCredentials(identifier: string, passwordPlain: string) {
    const admin = this.data.admins.find(
      a => (a.username.toLowerCase() === identifier.toLowerCase() || a.email.toLowerCase() === identifier.toLowerCase()) &&
           a.passwordHash === passwordPlain &&
           !a.isBlocked
    );
    if (!admin) return null;
    const { passwordHash, ...safeProfile } = admin;
    return safeProfile;
  }

  findUserById(id: string): UserProfile | null {
    const admin = this.data.admins.find(a => a.id === id);
    if (admin) {
      const { passwordHash, ...safe } = admin;
      return safe;
    }
    const player = this.data.players.find(p => p.id === id);
    return player || null;
  }

  registerPlayer(username: string, email: string, displayName?: string, explicitId?: string): UserProfile {
    if (explicitId) {
      const byId = this.data.players.find(p => p.id === explicitId);
      if (byId) return byId;
    }
    const existing = this.data.players.find(p => p.username.toLowerCase() === username.toLowerCase() || p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return existing;
    }
    const newPlayer: UserProfile = {
      id: explicitId || `player_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      username: username.trim(),
      email: email.trim(),
      role: 'player',
      displayName: (displayName || username).trim(),
      isBlocked: false,
      createdAt: new Date().toISOString()
    };
    this.data.players.push(newPlayer);
    this.saveData();
    return newPlayer;
  }

  getEnrichedLevels(playerId: string) {
    const publishedLevels = this.getLevels(false);
    const unlocks = this.calculateUnlockedLevels(playerId);
    const progressList = this.getPlayerProgress(playerId);

    return publishedLevels.map(lvl => {
      const prog = progressList.find(p => p.levelId === lvl.id);
      const unlockInfo = unlocks[lvl.id] || { isUnlocked: false };
      return {
        ...lvl,
        isUnlocked: unlockInfo.isUnlocked,
        lockReason: unlockInfo.lockReason,
        isCompleted: prog?.isCompleted || false,
        highestScore: prog?.highestScore || 0,
        highestStars: prog?.highestStars || 0
      };
    });
  }

  // --- AUDIT LOGS ---
  logAudit(actor: { id: string; name: string; role: UserRole }, action: string, targetType: string, targetId: string = '', details: Record<string, any> = {}) {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      targetType,
      targetId,
      details,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    // keep max 1000 logs
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.saveData();
    return log;
  }

  getAuditLogs(limit: number = 100, filterType?: string): AuditLog[] {
    let logs = this.data.auditLogs;
    if (filterType) {
      logs = logs.filter(l => l.targetType === filterType || l.action.includes(filterType.toUpperCase()));
    }
    return logs.slice(0, limit);
  }

  // --- SETTINGS ---
  getSettings(): GameSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<GameSettings>, actor: { id: string; name: string; role: UserRole }): GameSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.logAudit(actor, 'SETTINGS_UPDATED', 'settings', 'global_settings', { updatedFields: Object.keys(updates) });
    this.saveData();
    return this.data.settings;
  }

  // --- LEVELS ---
  getLevels(includeAll: boolean = true): Level[] {
    if (includeAll) {
      return [...this.data.levels].sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return this.data.levels
      .filter(l => l.status === 'published')
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getLevelById(id: string): Level | null {
    return this.data.levels.find(l => l.id === id) || null;
  }

  createLevel(levelData: Partial<Level>, actor: { id: string; name: string; role: UserRole }): Level {
    const newLevel: Level = {
      id: `level_${Date.now()}`,
      gameId: levelData.gameId || 'game-data-heist',
      slug: (levelData.slug || levelData.name || `level-${this.data.levels.length + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      levelNumber: levelData.levelNumber || this.data.levels.length + 1,
      displayOrder: levelData.displayOrder || this.data.levels.length + 1,
      name: levelData.name || 'Untitled Case',
      description: levelData.description || '',
      difficulty: levelData.difficulty || 'easy',
      timeLimitSeconds: levelData.timeLimitSeconds ?? 60,
      pointsPerQuestion: levelData.pointsPerQuestion ?? 100,
      passingScore: levelData.passingScore ?? 200,
      minStarsRequiredToPass: levelData.minStarsRequiredToPass ?? 1,
      hintAvailable: levelData.hintAvailable ?? true,
      hintPenalty: levelData.hintPenalty ?? 15,
      incorrectPenalty: levelData.incorrectPenalty ?? 25,
      speedBonusEnabled: levelData.speedBonusEnabled ?? true,
      speedBonusMax: levelData.speedBonusMax ?? 50,
      status: levelData.status || 'draft',
      backgroundImageUrl: levelData.backgroundImageUrl || '',
      unlockRequirements: levelData.unlockRequirements || {
        minStarsFromEasy: 0,
        minStarsFromMedium: 0,
        minTotalStars: 0,
        minTotalScore: 0
      },
      translations: levelData.translations || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.levels.push(newLevel);
    this.logAudit(actor, 'LEVEL_CREATED', 'level', newLevel.id, { name: newLevel.name, difficulty: newLevel.difficulty });
    this.saveData();
    return newLevel;
  }

  updateLevel(id: string, updates: Partial<Level>, actor: { id: string; name: string; role: UserRole }): Level | null {
    const index = this.data.levels.findIndex(l => l.id === id);
    if (index === -1) return null;

    this.data.levels[index] = {
      ...this.data.levels[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.logAudit(actor, 'LEVEL_UPDATED', 'level', id, { updatedFields: Object.keys(updates) });
    this.saveData();
    return this.data.levels[index];
  }

  duplicateLevel(id: string, actor: { id: string; name: string; role: UserRole }): Level | null {
    const original = this.getLevelById(id);
    if (!original) return null;

    const copy: Partial<Level> = {
      ...original,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      displayOrder: original.displayOrder + 1,
      status: 'draft'
    };
    const created = this.createLevel(copy, actor);

    // Duplicate questions belonging to this level
    const questions = this.data.questions.filter(q => q.levelId === id);
    for (const q of questions) {
      this.duplicateQuestion(q.id, actor, created.id);
    }

    return created;
  }

  deleteLevel(id: string, actor: { id: string; name: string; role: UserRole }): boolean {
    const index = this.data.levels.findIndex(l => l.id === id);
    if (index === -1) return false;

    const level = this.data.levels[index];
    // Check if there are player attempts referencing this level
    const hasAttempts = this.data.attempts.some(a => a.levelId === id);
    if (hasAttempts) {
      // Soft-delete / archive instead of destructive delete to protect historical integrity
      this.data.levels[index].status = 'archived';
      this.logAudit(actor, 'LEVEL_ARCHIVED', 'level', id, { name: level.name, reason: 'Archived due to existing player history' });
    } else {
      this.data.levels.splice(index, 1);
      // Orphan questions or mark them
      this.data.questions.forEach(q => {
        if (q.levelId === id) q.levelId = '';
      });
      this.logAudit(actor, 'LEVEL_DELETED', 'level', id, { name: level.name });
    }
    this.saveData();
    return true;
  }

  // --- QUESTIONS ---
  getQuestions(filters?: { levelId?: string; status?: ContentStatus; difficulty?: LevelDifficulty }, includeSecrets: boolean = false): Question[] {
    let list = this.data.questions;
    if (filters?.levelId) {
      list = list.filter(q => q.levelId === filters.levelId);
    }
    if (filters?.status) {
      list = list.filter(q => q.status === filters.status);
    }
    if (filters?.difficulty) {
      list = list.filter(q => q.difficulty === filters.difficulty);
    }

    list = [...list].sort((a, b) => a.displayOrder - b.displayOrder);

    if (includeSecrets) {
      return list;
    }

    // Strip out answer key secrets for player responses!
    return list.map(q => ({
      ...q,
      correctAnswerSecret: '', // HIDDEN
      options: q.options.map(o => ({
        id: o.id,
        optionKey: o.optionKey,
        text: o.text
        // isCorrect omitted
      }))
    }));
  }

  getQuestionById(id: string, includeSecrets: boolean = false): Question | null {
    const q = this.data.questions.find(item => item.id === id);
    if (!q) return null;
    if (includeSecrets) return q;

    return {
      ...q,
      correctAnswerSecret: '',
      options: q.options.map(o => ({
        id: o.id,
        optionKey: o.optionKey,
        text: o.text
      }))
    };
  }

  createQuestion(questionData: Partial<Question>, actor: { id: string; name: string; role: UserRole }): Question {
    const newQuestion: Question = {
      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      levelId: questionData.levelId || '',
      title: questionData.title || 'Untitled Forensic Exhibit',
      text: questionData.text || '',
      imagePosterUrl: questionData.imagePosterUrl || '',
      imageCaption: questionData.imageCaption || '',
      imageStoragePath: questionData.imageStoragePath || '',
      answerType: questionData.answerType || 'multiple_choice',
      options: questionData.options || [],
      correctAnswerSecret: questionData.correctAnswerSecret || '',
      explanation: questionData.explanation || '',
      hint: questionData.hint || '',
      difficulty: questionData.difficulty || 'easy',
      category: questionData.category || 'Forensics',
      points: questionData.points ?? 100,
      incorrectPenalty: questionData.incorrectPenalty ?? 25,
      timerOverrideSeconds: questionData.timerOverrideSeconds ?? null,
      autoClosedOnTimeout: questionData.autoClosedOnTimeout ?? true,
      displayOrder: questionData.displayOrder || this.data.questions.length + 1,
      status: questionData.status || 'draft',
      translations: questionData.translations || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.questions.push(newQuestion);
    this.logAudit(actor, 'QUESTION_CREATED', 'question', newQuestion.id, { title: newQuestion.title, levelId: newQuestion.levelId });
    this.saveData();
    return newQuestion;
  }

  updateQuestion(id: string, updates: Partial<Question>, actor: { id: string; name: string; role: UserRole }): Question | null {
    const index = this.data.questions.findIndex(q => q.id === id);
    if (index === -1) return null;

    this.data.questions[index] = {
      ...this.data.questions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.logAudit(actor, 'QUESTION_UPDATED', 'question', id, { updatedFields: Object.keys(updates) });
    this.saveData();
    return this.data.questions[index];
  }

  duplicateQuestion(id: string, actor: { id: string; name: string; role: UserRole }, targetLevelId?: string): Question | null {
    const original = this.data.questions.find(q => q.id === id);
    if (!original) return null;

    const copyData: Partial<Question> = {
      ...original,
      title: `${original.title} (Copy)`,
      levelId: targetLevelId || original.levelId,
      displayOrder: original.displayOrder + 1,
      status: 'draft'
    };

    return this.createQuestion(copyData, actor);
  }

  deleteQuestion(id: string, actor: { id: string; name: string; role: UserRole }): boolean {
    const index = this.data.questions.findIndex(q => q.id === id);
    if (index === -1) return false;

    const q = this.data.questions[index];
    this.data.questions.splice(index, 1);
    this.logAudit(actor, 'QUESTION_DELETED', 'question', id, { title: q.title });
    this.saveData();
    return true;
  }

  clearLevelQuestions(levelId: string, actor: { id: string; name: string; role: UserRole }): number {
    const beforeCount = this.data.questions.length;
    this.data.questions = this.data.questions.filter(q => q.levelId !== levelId);
    const removedCount = beforeCount - this.data.questions.length;
    this.logAudit(actor, 'LEVEL_QUESTIONS_CLEARED', 'level', levelId, { count: removedCount });
    this.saveData();
    return removedCount;
  }

  // --- POSTERS & UPLOADS ---
  recordPoster(poster: QuestionPoster, actor: { id: string; name: string; role: UserRole }) {
    this.data.posters.push(poster);
    this.logAudit(actor, 'POSTER_UPLOADED', 'poster', poster.id, {
      filename: poster.originalFilename,
      sizeBytes: poster.fileSizeBytes,
      publicUrl: poster.publicUrl
    });
    this.saveData();
  }

  getPosters(): QuestionPoster[] {
    return this.data.posters;
  }

  // --- PLAYER PROGRESSION & UNLOCK LOGIC ---
  getPlayerProgress(playerId: string): PlayerProgress[] {
    return this.data.progress[playerId] || [];
  }

  calculateUnlockedLevels(playerId: string): Record<string, { isUnlocked: boolean; lockReason?: string }> {
    const progressList = this.getPlayerProgress(playerId);
    const progressMap = new Map<string, PlayerProgress>();
    progressList.forEach(p => progressMap.set(p.levelId, p));

    // Calculate stars earned per difficulty tier
    let easyStars = 0;
    let mediumStars = 0;
    let totalStars = 0;
    let totalScore = 0;

    for (const prog of progressList) {
      const lvl = this.getLevelById(prog.levelId);
      if (!lvl) continue;
      totalStars += prog.highestStars;
      totalScore += prog.highestScore;
      if (lvl.difficulty === 'easy') easyStars += prog.highestStars;
      if (lvl.difficulty === 'medium') mediumStars += prog.highestStars;
    }

    const unlockStatus: Record<string, { isUnlocked: boolean; lockReason?: string }> = {};

    const levels = this.getLevels(true);
    for (const lvl of levels) {
      if (lvl.status !== 'published') {
        unlockStatus[lvl.id] = { isUnlocked: false, lockReason: 'Level is currently in draft or maintenance.' };
        continue;
      }

      const req = lvl.unlockRequirements || {};
      let unlocked = true;
      let reason = '';

      // Level unlock logic based on user requirement:
      // Easy level got 2 stars -> opens Medium level
      // Medium level got 2 stars -> opens Hard level
      if (lvl.difficulty === 'easy') {
        unlockStatus[lvl.id] = { isUnlocked: true };
        continue;
      }

      if (lvl.difficulty === 'medium') {
        const isMedUnlocked = easyStars >= 2;
        unlockStatus[lvl.id] = {
          isUnlocked: isMedUnlocked,
          lockReason: isMedUnlocked ? '' : 'Requires at least 2 Stars on Easy stage to unlock.'
        };
        continue;
      }

      if (lvl.difficulty === 'hard') {
        const isHrdUnlocked = mediumStars >= 2;
        unlockStatus[lvl.id] = {
          isUnlocked: isHrdUnlocked,
          lockReason: isHrdUnlocked ? '' : 'Requires at least 2 Stars on Medium stage to unlock.'
        };
        continue;
      }

      unlockStatus[lvl.id] = { isUnlocked: unlocked, lockReason: reason };
    }

    return unlockStatus;
  }

  // --- ATTEMPTS & AUTHORITATIVE SCORING ---
  startAttempt(playerId: string, levelId: string): { attempt: PlayerAttempt; questions: Question[] } | null {
    const player = this.findUserById(playerId);
    if (!player) return null;

    const level = this.getLevelById(levelId);
    if (!level || level.status !== 'published') return null;

    // Check unlocks
    const unlocks = this.calculateUnlockedLevels(playerId);
    if (!unlocks[levelId]?.isUnlocked) {
      throw new Error(`Level is locked: ${unlocks[levelId]?.lockReason || 'Requirements not met'}`);
    }

    const questions = this.getQuestions({ levelId, status: 'published' }, false);
    if (questions.length === 0) {
      throw new Error('This case has no published questions available.');
    }

    const attempt: PlayerAttempt = {
      id: `attempt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      playerId: player.id,
      playerName: player.displayName || player.username,
      levelId: level.id,
      levelName: level.name,
      levelDifficulty: level.difficulty,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      totalScore: 0,
      starsEarned: 0,
      totalTimeSpentSeconds: 0,
      totalTimeSavedSeconds: 0,
      accuracyPercentage: 0,
      hintsUsedCount: 0,
      isPassed: false,
      answers: []
    };

    this.data.attempts.push(attempt);
    this.saveData();
    return { attempt, questions };
  }

  submitAnswer(
    attemptId: string, 
    questionId: string, 
    submittedAnswer: string, 
    timeTakenSeconds: number, 
    hintUsed: boolean = false
  ) {
    const attempt = this.data.attempts.find(a => a.id === attemptId);
    if (!attempt || attempt.status !== 'in_progress') {
      throw new Error('Attempt not active or already finalized.');
    }

    // Prevent duplicate answer submission for same question
    if (attempt.answers.some(ans => ans.questionId === questionId)) {
      throw new Error('Question answer already submitted for this attempt.');
    }

    const question = this.data.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Question not found.');
    }

    const level = this.getLevelById(attempt.levelId);
    const globalSettings = this.getSettings();

    // Determine correct answer
    const cleanedSubmission = (submittedAnswer || '').trim().toUpperCase();
    const cleanedSecret = (question.correctAnswerSecret || '').trim().toUpperCase();

    const isCorrect = cleanedSubmission === cleanedSecret;

    // Calculate time saved for this question
    const effectiveTimeLimit = question.timerOverrideSeconds || level?.timeLimitSeconds || globalSettings.defaultTimerSeconds;
    const timeSaved = Math.max(0, effectiveTimeLimit - timeTakenSeconds);

    let pointsAwarded = 0;
    let penaltyDeducted = 0;

    if (isCorrect) {
      // Base question points
      pointsAwarded = question.points || level?.pointsPerQuestion || globalSettings.baseCorrectPoints;

      // Speed bonus
      if (level?.speedBonusEnabled && timeSaved > 0) {
        const speedBonus = Math.min(
          level.speedBonusMax || 50,
          Math.floor((timeSaved / effectiveTimeLimit) * (level.speedBonusMax || 50))
        );
        pointsAwarded += speedBonus;
      }
    } else {
      penaltyDeducted = question.incorrectPenalty || level?.incorrectPenalty || globalSettings.incorrectPenaltyPoints;
    }

    // Hint penalty
    if (hintUsed) {
      const hintCost = level?.hintPenalty || globalSettings.hintPenaltyPoints;
      penaltyDeducted += hintCost;
    }

    const finalQuestionScore = Math.max(0, pointsAwarded - penaltyDeducted);

    attempt.answers.push({
      questionId,
      submittedAnswer,
      isCorrect,
      pointsAwarded,
      penaltyDeducted,
      hintUsed,
      timeTakenSeconds,
      timeSavedSeconds: timeSaved,
      correctAnswer: question.correctAnswerSecret, // will be shown in final recap
      explanation: question.explanation
    });

    this.saveData();
    return {
      isCorrect,
      pointsAwarded,
      penaltyDeducted,
      netScore: finalQuestionScore,
      timeSaved
    };
  }

  finishAttempt(attemptId: string): PlayerAttempt {
    const attempt = this.data.attempts.find(a => a.id === attemptId);
    if (!attempt) throw new Error('Attempt not found.');

    const level = this.getLevelById(attempt.levelId);
    const totalQuestions = this.data.questions.filter(q => q.levelId === attempt.levelId && q.status === 'published').length;

    let totalScore = 0;
    let correctCount = 0;
    let totalTimeSpent = 0;
    let totalTimeSaved = 0;
    let hintsUsed = 0;

    for (const ans of attempt.answers) {
      totalScore += Math.max(0, ans.pointsAwarded - ans.penaltyDeducted);
      if (ans.isCorrect) correctCount++;
      totalTimeSpent += ans.timeTakenSeconds;
      totalTimeSaved += ans.timeSavedSeconds;
      if (ans.hintUsed) hintsUsed++;
    }

    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Star calculation:
    // 1 star: 1 correct answer or passing threshold
    // 2 stars: At least 2 correct answers (out of 3) or >= 60% accuracy / score
    // 3 stars: All questions answered correctly (100% accuracy)
    let stars = 0;
    const passingScore = level?.passingScore || 180;
    const maxScore = totalQuestions * (level?.pointsPerQuestion || 100);

    if (correctCount >= 1 || totalScore >= (passingScore * 0.5)) {
      stars = 1;
      if (correctCount >= 2 || accuracy >= 60 || totalScore >= maxScore * 0.6) {
        stars = 2; // 2 stars earned - unlocks next difficulty tier
      }
      if (correctCount >= totalQuestions && totalQuestions > 0) {
        stars = 3; // 3 stars for all correct
      }
    }

    const isPassed = stars >= 1;

    attempt.completedAt = new Date().toISOString();
    attempt.status = 'completed';
    attempt.totalScore = totalScore;
    attempt.starsEarned = stars;
    attempt.totalTimeSpentSeconds = totalTimeSpent;
    attempt.totalTimeSavedSeconds = totalTimeSaved;
    attempt.accuracyPercentage = Math.round(accuracy * 10) / 10;
    attempt.hintsUsedCount = hintsUsed;
    attempt.isPassed = isPassed;

    // Update player progression
    if (!this.data.progress[attempt.playerId]) {
      this.data.progress[attempt.playerId] = [];
    }

    const existingProgressIndex = this.data.progress[attempt.playerId].findIndex(p => p.levelId === attempt.levelId);
    if (existingProgressIndex !== -1) {
      const existing = this.data.progress[attempt.playerId][existingProgressIndex];
      this.data.progress[attempt.playerId][existingProgressIndex] = {
        ...existing,
        isCompleted: existing.isCompleted || isPassed,
        highestScore: Math.max(existing.highestScore, totalScore),
        highestStars: Math.max(existing.highestStars, stars),
        fastestTimeSeconds: existing.fastestTimeSeconds ? Math.min(existing.fastestTimeSeconds, totalTimeSpent) : totalTimeSpent,
        attemptsCount: existing.attemptsCount + 1,
        lastAttemptAt: new Date().toISOString()
      };
    } else {
      this.data.progress[attempt.playerId].push({
        levelId: attempt.levelId,
        isUnlocked: true,
        isCompleted: isPassed,
        highestScore: totalScore,
        highestStars: stars,
        fastestTimeSeconds: totalTimeSpent,
        attemptsCount: 1,
        firstCompletedAt: isPassed ? new Date().toISOString() : undefined,
        lastAttemptAt: new Date().toISOString()
      });
    }

    this.saveData();
    return attempt;
  }

  // --- LEADERBOARD & PLAYERS ---
  getLeaderboard(): LeaderboardEntry[] {
    const playerStatsMap = new Map<string, { totalStars: number; totalScore: number; completedCount: number; timeSaved: number }>();

    for (const [playerId, progList] of Object.entries(this.data.progress)) {
      let stars = 0;
      let score = 0;
      let count = 0;
      for (const p of progList) {
        stars += p.highestStars;
        score += p.highestScore;
        if (p.isCompleted) count++;
      }
      playerStatsMap.set(playerId, { totalStars: stars, totalScore: score, completedCount: count, timeSaved: 0 });
    }

    // Add time saved from attempts
    for (const att of this.data.attempts) {
      if (att.status === 'completed' && playerStatsMap.has(att.playerId)) {
        playerStatsMap.get(att.playerId)!.timeSaved += att.totalTimeSavedSeconds;
      }
    }

    const entries: LeaderboardEntry[] = [];
    for (const player of this.data.players) {
      const stats = playerStatsMap.get(player.id) || { totalStars: 0, totalScore: 0, completedCount: 0, timeSaved: 0 };
      entries.push({
        playerId: player.id,
        playerName: player.displayName || player.username,
        totalStars: stats.totalStars,
        totalScore: stats.totalScore,
        completedLevelsCount: stats.completedCount,
        totalTimeSaved: stats.timeSaved,
        rank: 0
      });
    }

    // Sort by stars descending, then totalScore descending, then timeSaved descending
    entries.sort((a, b) => {
      if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.totalTimeSaved - a.totalTimeSaved;
    });

    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    return entries;
  }

  getPlayers(search?: string): (UserProfile & { totalScore: number; totalStars: number; completedLevels: number })[] {
    let list = this.data.players;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.username.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
    }

    return list.map(player => {
      const progress = this.data.progress[player.id] || [];
      const totalScore = progress.reduce((acc, p) => acc + p.highestScore, 0);
      const totalStars = progress.reduce((acc, p) => acc + p.highestStars, 0);
      const completedLevels = progress.filter(p => p.isCompleted).length;
      return {
        ...player,
        totalScore,
        totalStars,
        completedLevels
      };
    });
  }

  resetPlayerProgress(playerId: string, actor: { id: string; name: string; role: UserRole }): boolean {
    const player = this.data.players.find(p => p.id === playerId);
    if (!player) return false;

    this.data.progress[playerId] = [];
    this.logAudit(actor, 'PLAYER_PROGRESS_RESET', 'player', playerId, { playerName: player.displayName });
    this.saveData();
    return true;
  }

  toggleBlockPlayer(playerId: string, actor: { id: string; name: string; role: UserRole }): boolean {
    const player = this.data.players.find(p => p.id === playerId);
    if (!player) return false;

    player.isBlocked = !player.isBlocked;
    this.logAudit(actor, player.isBlocked ? 'PLAYER_BLOCKED' : 'PLAYER_UNBLOCKED', 'player', playerId, {
      playerName: player.displayName,
      isBlocked: player.isBlocked
    });
    this.saveData();
    return player.isBlocked;
  }

  getAttempts(filters?: { playerId?: string; levelId?: string; difficulty?: LevelDifficulty }): PlayerAttempt[] {
    let list = this.data.attempts;
    if (filters?.playerId) {
      list = list.filter(a => a.playerId === filters.playerId);
    }
    if (filters?.levelId) {
      list = list.filter(a => a.levelId === filters.levelId);
    }
    if (filters?.difficulty) {
      list = list.filter(a => a.levelDifficulty === filters.difficulty);
    }
    return [...list].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  deleteAttempt(id: string, actor: { id: string; name: string; role: UserRole }): boolean {
    const index = this.data.attempts.findIndex(a => a.id === id);
    if (index === -1) return false;
    const item = this.data.attempts[index];
    this.data.attempts.splice(index, 1);
    this.logAudit(actor, 'ATTEMPT_DELETED', 'attempt', id, { playerName: item.playerName, levelName: item.levelName });
    this.saveData();
    return true;
  }

  clearAllAttempts(actor: { id: string; name: string; role: UserRole }): number {
    const count = this.data.attempts.length;
    this.data.attempts = [];
    this.logAudit(actor, 'ALL_ATTEMPTS_CLEARED', 'attempt', 'all', { count });
    this.saveData();
    return count;
  }

  getDashboardMetrics() {
    const totalPlayers = this.data.players.length;
    const totalLevels = this.data.levels.length;
    const activeLevels = this.data.levels.filter(l => l.status === 'published').length;
    const lockedLevels = this.data.levels.filter(l => l.status !== 'published').length;
    const totalQuestions = this.data.questions.length;
    const publishedQuestions = this.data.questions.filter(q => q.status === 'published').length;
    const draftQuestions = this.data.questions.filter(q => q.status === 'draft').length;
    const completedAttempts = this.data.attempts.filter(a => a.status === 'completed').length;
    const recentActivity = this.data.attempts.slice(-8).reverse();
    const leaderboard = this.getLeaderboard().slice(0, 5);
    const recentAuditLogs = this.data.auditLogs.slice(0, 8);

    return {
      totalPlayers,
      totalLevels,
      activeLevels,
      lockedLevels,
      totalQuestions,
      publishedQuestions,
      draftQuestions,
      completedAttempts,
      recentActivity,
      leaderboard,
      recentAuditLogs
    };
  }

  // --- GAMES & CASE CATEGORIES ---
  getGames(): GameCard[] {
    return this.data.games || INITIAL_GAMES;
  }

  createGame(gameData: Partial<GameCard>, actor: { id: string; name: string; role: UserRole }): GameCard {
    const newGame: GameCard = {
      id: `game-${Date.now()}`,
      slug: (gameData.title || 'custom-case').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: gameData.title || 'New Detective Case',
      tagline: gameData.tagline || 'Forensic Investigation Operation',
      description: gameData.description || 'Analyze digital and physical artifacts to solve the bureau case.',
      category: gameData.category || 'Cyber Forensics',
      icon: gameData.icon || 'shield',
      badge: gameData.badge || 'New Operation',
      totalLevels: Number(gameData.totalLevels) || 3,
      estimatedTime: gameData.estimatedTime || '15 Mins',
      rules: Array.isArray(gameData.rules) && gameData.rules.length > 0 ? gameData.rules : [
        'Clear exhibits one by one under strict countdown timers.',
        'Easy stage is unlocked immediately. Medium requires 2 stars on Easy.',
        'Speed bonus awarded for unused time; wrong answers deduct points.',
        'Complete all levels to finalize official college team submission.'
      ]
    };

    if (!this.data.games) {
      this.data.games = [...INITIAL_GAMES];
    }
    this.data.games.push(newGame);
    this.logAudit(actor, 'GAME_CREATED', 'game', newGame.id, { title: newGame.title });
    this.saveData();
    return newGame;
  }

  updateGame(id: string, updates: Partial<GameCard>, actor: { id: string; name: string; role: UserRole }): GameCard | null {
    if (!this.data.games) this.data.games = [...INITIAL_GAMES];
    const index = this.data.games.findIndex(g => g.id === id);
    if (index === -1) return null;

    this.data.games[index] = {
      ...this.data.games[index],
      ...updates
    };
    this.logAudit(actor, 'GAME_UPDATED', 'game', id, { updates });
    this.saveData();
    return this.data.games[index];
  }

  deleteGame(id: string, actor: { id: string; name: string; role: UserRole }): boolean {
    if (!this.data.games) this.data.games = [...INITIAL_GAMES];
    const index = this.data.games.findIndex(g => g.id === id);
    if (index === -1) return false;

    const game = this.data.games[index];
    this.data.games.splice(index, 1);

    // Also remove associated levels and questions so data stays cleanly synchronized
    const associatedLevelIds = new Set(this.data.levels.filter(l => l.gameId === id).map(l => l.id));
    this.data.levels = this.data.levels.filter(l => l.gameId !== id);
    this.data.questions = this.data.questions.filter(q => !associatedLevelIds.has(q.levelId));

    this.logAudit(actor, 'GAME_DELETED', 'game', id, { title: game.title });
    this.saveData();
    return true;
  }

  // --- PARTICIPANT SUBMISSIONS (NAME, REG NO, COLLEGE, TEAM) ---
  createParticipantSubmission(data: Omit<ParticipantSubmission, 'id' | 'submittedAt'>): ParticipantSubmission {
    const submission: ParticipantSubmission = {
      ...data,
      id: `part_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      submittedAt: new Date().toISOString()
    };
    if (!this.data.participantSubmissions) {
      this.data.participantSubmissions = [];
    }
    this.data.participantSubmissions.unshift(submission);
    this.saveData();
    return submission;
  }

  getParticipantSubmissions(search?: string): ParticipantSubmission[] {
    let list = this.data.participantSubmissions || [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.registerNumber.toLowerCase().includes(q) ||
        s.collegeName.toLowerCase().includes(q) ||
        s.teamName.toLowerCase().includes(q)
      );
    }
    return list;
  }

  deleteParticipantSubmission(id: string, actor: { id: string; name: string; role: UserRole }): boolean {
    if (!this.data.participantSubmissions) return false;
    const index = this.data.participantSubmissions.findIndex(s => s.id === id);
    if (index === -1) return false;
    const item = this.data.participantSubmissions[index];
    this.data.participantSubmissions.splice(index, 1);
    this.logAudit(actor, 'PARTICIPANT_RECORD_DELETED', 'participant', id, { name: item.name, registerNumber: item.registerNumber });
    this.saveData();
    return true;
  }

  clearAllParticipantSubmissions(actor: { id: string; name: string; role: UserRole }): number {
    if (!this.data.participantSubmissions) return 0;
    const count = this.data.participantSubmissions.length;
    this.data.participantSubmissions = [];
    this.logAudit(actor, 'ALL_PARTICIPANTS_CLEARED', 'participant', 'all', { count });
    this.saveData();
    return count;
  }

  clearFeedback(id: string): boolean {
    if (!this.data.participantSubmissions) return false;
    const target = this.data.participantSubmissions.find(s => s.id === id);
    if (!target) return false;
    target.feedback = '';
    target.rating = undefined;
    this.saveData();
    return true;
  }

  clearAllData(actor?: { id: string; name: string; role: UserRole }) {
    const attemptsCount = (this.data.attempts || []).length;
    const submissionsCount = (this.data.participantSubmissions || []).length;
    const playersCount = (this.data.players || []).length;

    this.data.attempts = [];
    this.data.participantSubmissions = [];
    this.data.players = [];
    this.data.progress = {};
    this.data.auditLogs = [];

    if (actor) {
      this.logAudit(actor, 'ALL_DATA_CLEARED', 'system', 'all', {
        clearedAttempts: attemptsCount,
        clearedSubmissions: submissionsCount,
        clearedPlayers: playersCount
      });
    }

    this.saveData();
    return {
      attemptsCount,
      submissionsCount,
      playersCount
    };
  }
}
