import { 
  GameSettings, 
  Level, 
  Question, 
  UserProfile, 
  PlayerAttempt, 
  LeaderboardEntry, 
  AuditLog, 
  QuestionPoster,
  GameCard,
  ParticipantSubmission,
  AnswerOption
} from '../types/game.ts';
import { getSupabaseClient } from './supabaseClient.ts';

const TOKEN_KEY = 'detective_auth_token';
const PLAYER_ID_KEY = 'detective_player_profile';
const AGENT_UUID_KEY = 'detective_agent_uuid';

const MOCK_SETTINGS: GameSettings = {
  id: 'global_settings',
  gameTitle: 'SMIT CENTRAL FORENSIC CRIME BUREAU',
  gameDescription: 'Crack cryptographic mysteries, inspect forensic evidence posters, decode syndicate ciphers, and neutralize international threats.',
  logoUrl: '/infoxtreme_logo.jpg',
  theme: 'noir-cyber',
  maintenanceMode: false,
  demoRulesCountdownEnabled: false,
  demoRulesCountdownSeconds: 120,
  defaultTimerSeconds: 60,
  briefingTimerSeconds: 180,
  allowTimerPause: true,
  allowQuestionRetry: false,
  autoSubmitOnTimeout: true,
  timeoutPenaltyPoints: 10,
  baseCorrectPoints: 100,
  incorrectPenaltyPoints: 25,
  hintPenaltyPoints: 15,
  speedBonusMultiplier: 1.5,
  soundEffectsEnabled: true,
  supportedLanguages: ['en', 'ta'],
  defaultLanguage: 'en',
  rulesText: 'Welcome Agent. You are tasked with solving cyber and forensic investigations. Each case has questions with evidence posters. Read the clues carefully, inspect the evidence dossier, and submit your deduction before the countdown expires.',
  updatedAt: new Date().toISOString()
};

const MOCK_GAMES: GameCard[] = [
  {
    id: 'game-data-heist',
    slug: 'the-midnight-cyber-heist',
    title: 'The Midnight Cyber Heist',
    tagline: 'Apex Quantum Reserve Incursion',
    description: 'An intrusion alarm was triggered inside the Apex Quantum Reserve server bank. Identify the attack vector, breach port, and rogue payload.',
    category: 'Cyber Forensics',
    icon: 'shield',
    badge: 'Easy',
    totalLevels: 1,
    estimatedTime: '5 mins',
    rules: ['Inspect evidence posters', 'Answer before timer expires']
  },
  {
    id: 'game-blackwood-manor',
    slug: 'the-blackwood-manor-cipher',
    title: 'The Vanishing Cipher at Blackwood Manor',
    tagline: 'Locked Room Mystery',
    description: 'Lord Blackwood was found incapacitated in his locked study. His cryptographic journal and safe combinations are missing.',
    category: 'Physical Forensics',
    icon: 'fingerprint',
    badge: 'Medium',
    totalLevels: 1,
    estimatedTime: '8 mins',
    rules: ['Examine physical clues', 'Decode ciphers']
  },
  {
    id: 'game-obsidian-syndicate',
    slug: 'the-syndicate-subterranean-vault',
    title: 'The Syndicate Subterranean Vault',
    tagline: 'High Security Infiltration',
    description: 'The international syndicate Obsidian 7 breached the deep subterranean reserve. Bypass the optical laser grids and intercept the mole.',
    category: 'Advanced Vault',
    icon: 'vault',
    badge: 'Hard',
    totalLevels: 1,
    estimatedTime: '10 mins',
    rules: ['Bypass optical laser grids', 'Neutralize threat']
  }
];

const MOCK_LEVELS = [
  {
    id: 'level-01-heist',
    gameId: 'game-data-heist',
    slug: 'the-midnight-cyber-heist',
    levelNumber: 1,
    displayOrder: 1,
    name: 'The Midnight Cyber Heist',
    description: 'An intrusion alarm was triggered inside the Apex Quantum Reserve server bank. Identify the attack vector, breach port, and rogue payload.',
    difficulty: 'easy' as const,
    timeLimitSeconds: 90,
    pointsPerQuestion: 100,
    passingScore: 180,
    minStarsRequiredToPass: 1,
    hintAvailable: true,
    hintPenalty: 15,
    incorrectPenalty: 25,
    speedBonusEnabled: true,
    speedBonusMax: 50,
    status: 'published' as const,
    unlockRequirements: { minStarsFromEasy: 0 },
    isUnlocked: true,
    isCompleted: false,
    highestScore: 0,
    highestStars: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'level-02-manor',
    gameId: 'game-blackwood-manor',
    slug: 'the-blackwood-manor-cipher',
    levelNumber: 2,
    displayOrder: 2,
    name: 'The Vanishing Cipher at Blackwood Manor',
    description: 'Lord Blackwood was found incapacitated in his locked study. His cryptographic journal and safe combinations are missing.',
    difficulty: 'medium' as const,
    timeLimitSeconds: 60,
    pointsPerQuestion: 120,
    passingScore: 220,
    minStarsRequiredToPass: 2,
    hintAvailable: true,
    hintPenalty: 20,
    incorrectPenalty: 30,
    speedBonusEnabled: true,
    speedBonusMax: 60,
    status: 'published' as const,
    unlockRequirements: { minStarsFromEasy: 1 },
    isUnlocked: true,
    isCompleted: false,
    highestScore: 0,
    highestStars: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'level-03-syndicate',
    gameId: 'game-obsidian-syndicate',
    slug: 'the-syndicate-subterranean-vault',
    levelNumber: 3,
    displayOrder: 3,
    name: 'The Syndicate Subterranean Vault',
    description: 'The international syndicate Obsidian 7 breached the deep subterranean reserve. Bypass the optical laser grids and intercept the mole.',
    difficulty: 'hard' as const,
    timeLimitSeconds: 45,
    pointsPerQuestion: 150,
    passingScore: 300,
    minStarsRequiredToPass: 2,
    hintAvailable: true,
    hintPenalty: 25,
    incorrectPenalty: 40,
    speedBonusEnabled: true,
    speedBonusMax: 75,
    status: 'published' as const,
    unlockRequirements: { minStarsFromMedium: 1 },
    isUnlocked: true,
    isCompleted: false,
    highestScore: 0,
    highestStars: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    levelId: 'level-01-heist',
    title: 'Firewall Egress Analysis',
    text: 'Which protocol and port entry indicates the primary data exfiltration vector identified in the Apex server firewall logs at 02:41 AM?',
    answerType: 'multiple_choice',
    options: [
      { id: 'opt-1', optionKey: 'A', text: 'HTTPS / Port 443 (Authorized Enterprise Gateway)' },
      { id: 'opt-2', optionKey: 'B', text: 'SFTP / Port 22 (Encrypted Tunnel via Compromised Service Account)' },
      { id: 'opt-3', optionKey: 'C', text: 'DNS Tunneling / Port 53 (Data Exfiltration Payload)' },
      { id: 'opt-4', optionKey: 'D', text: 'ICMP Echo Ping / Protocol 1' }
    ],
    correctAnswerSecret: 'C',
    explanation: 'Analysis of the firewall egress logs revealed abnormal high-volume DNS requests querying external authoritative nameservers with encoded payload chunks.',
    points: 100,
    incorrectPenalty: 25,
    difficulty: 'easy',
    category: 'Cyber',
    displayOrder: 1,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hint: 'Look for protocols traditionally used for domain name resolution that were repurposed for data tunneling.'
  },
  {
    id: 'q-2',
    levelId: 'level-01-heist',
    title: 'Memory Dump Persistence',
    text: 'Examine the server memory dump. What was the exact PID of the rogue persistence daemon spawned during the intrusion?',
    answerType: 'multiple_choice',
    options: [
      { id: 'opt-21', optionKey: 'A', text: 'PID 4092 (systemd-journal)' },
      { id: 'opt-22', optionKey: 'B', text: 'PID 7312 (kworker/u16:3)' },
      { id: 'opt-23', optionKey: 'C', text: 'PID 8491 (sys_update_daemon.sh)' },
      { id: 'opt-24', optionKey: 'D', text: 'PID 1024 (sshd)' }
    ],
    correctAnswerSecret: 'C',
    explanation: 'PID 8491 executed an unauthorized shell script from /tmp/ with root privileges.',
    points: 100,
    incorrectPenalty: 25,
    difficulty: 'easy',
    category: 'Cyber',
    displayOrder: 2,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hint: 'Check processes running out of temporary directory paths.'
  }
];

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getPlayerId: (): string => {
    let id = localStorage.getItem(AGENT_UUID_KEY);
    if (!id) {
      id = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(AGENT_UUID_KEY, id);
    }
    return id;
  },
  getPlayer: (): UserProfile | null => {
    try {
      const stored = localStorage.getItem(PLAYER_ID_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
  setPlayer: (player: UserProfile) => {
    localStorage.setItem(PLAYER_ID_KEY, JSON.stringify(player));
  },
  clearPlayer: () => localStorage.removeItem(PLAYER_ID_KEY)
};

function getStaticMockResponse<T>(endpoint: string, options: RequestInit = {}): T {
  console.log(`[Static Mock API] Serving fallback for: ${endpoint}`);
  
  if (endpoint.includes('/api/auth/login')) {
    let identifier = 'director_vance';
    try {
      if (options.body) {
        const parsed = JSON.parse(options.body as string);
        if (parsed.identifier) identifier = parsed.identifier;
      }
    } catch {}
    const mockUser: UserProfile = {
      id: 'admin-super-01',
      username: identifier,
      email: `${identifier}@detectivebureau.org`,
      role: identifier.includes('inspector') ? 'content_admin' : identifier.includes('scully') || identifier.includes('analyst') ? 'analyst' : 'super_admin',
      displayName: identifier.includes('inspector') ? 'Inspector Chen' : identifier.includes('scully') ? 'Specialist Scully' : 'Director Vance',
      isBlocked: false,
      createdAt: new Date().toISOString()
    };
    return { token: 'mock-static-jwt-token', user: mockUser } as unknown as T;
  }

  if (endpoint.includes('/api/auth/player-register')) {
    let username = 'Agent';
    try {
      if (options.body) {
        const parsed = JSON.parse(options.body as string);
        if (parsed.username) username = parsed.username;
      }
    } catch {}
    const player: UserProfile = {
      id: authStorage.getPlayerId(),
      username,
      email: `${username}@smit.edu`,
      role: 'player',
      displayName: username,
      isBlocked: false,
      createdAt: new Date().toISOString()
    };
    authStorage.setPlayer(player);
    return { token: 'mock-player-token', user: player } as unknown as T;
  }

  if (endpoint.includes('/api/auth/me')) {
    return { user: authStorage.getPlayer() || { id: authStorage.getPlayerId(), username: 'Agent_Recruit', role: 'player', displayName: 'Agent Recruit' } } as unknown as T;
  }

  if (endpoint.includes('/api/game/init')) {
    return {
      settings: MOCK_SETTINGS,
      user: authStorage.getPlayer(),
      token: 'mock-init-token',
      unlocks: {},
      playerProgress: []
    } as unknown as T;
  }

  if (endpoint.includes('/api/game/levels')) {
    return MOCK_LEVELS as unknown as T;
  }

  if (endpoint.includes('/api/game/questions')) {
    return MOCK_QUESTIONS as unknown as T;
  }

  if (endpoint.includes('/api/games')) {
    return MOCK_GAMES as unknown as T;
  }

  if (endpoint.includes('/api/game/leaderboard')) {
    return [] as unknown as T;
  }

  if (endpoint.includes('/api/game/attempt/start')) {
    const attempt: PlayerAttempt = {
      id: `attempt_${Date.now()}`,
      playerId: authStorage.getPlayerId(),
      playerName: authStorage.getPlayer()?.displayName || 'Agent',
      levelId: 'level-01-heist',
      levelName: 'The Midnight Cyber Heist',
      levelDifficulty: 'easy',
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      totalScore: 0,
      starsEarned: 0,
      totalTimeSpentSeconds: 0,
      totalTimeSavedSeconds: 90,
      accuracyPercentage: 0,
      hintsUsedCount: 0,
      isPassed: false,
      answers: []
    };
    return { attempt, questions: MOCK_QUESTIONS.slice(0, 2), token: 'mock-attempt-token' } as unknown as T;
  }

  if (endpoint.includes('/api/game/attempt/submit-answer')) {
    return {
      isCorrect: true,
      pointsAwarded: 100,
      penaltyDeducted: 0,
      netScore: 100,
      timeSaved: 45
    } as unknown as T;
  }

  if (endpoint.includes('/api/game/attempt/finish')) {
    const attempt: PlayerAttempt = {
      id: `attempt_${Date.now()}`,
      playerId: authStorage.getPlayerId(),
      playerName: authStorage.getPlayer()?.displayName || 'Agent',
      levelId: 'level-01-heist',
      levelName: 'The Midnight Cyber Heist',
      levelDifficulty: 'easy',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: 'completed',
      totalScore: 250,
      starsEarned: 3,
      totalTimeSpentSeconds: 40,
      totalTimeSavedSeconds: 50,
      accuracyPercentage: 100,
      hintsUsedCount: 0,
      isPassed: true,
      answers: []
    };
    return {
      ...attempt,
      updatedLevels: MOCK_LEVELS.map(l => ({ ...l, isCompleted: true, highestScore: 250, highestStars: 3 }))
    } as unknown as T;
  }

  if (endpoint.includes('/api/admin/dashboard')) {
    return {
      totalPlayers: 12,
      totalLevels: 3,
      activeLevels: 3,
      lockedLevels: 0,
      totalQuestions: 4,
      publishedQuestions: 4,
      draftQuestions: 0,
      completedAttempts: 15,
      recentActivity: [],
      leaderboard: [],
      recentAuditLogs: []
    } as unknown as T;
  }

  if (endpoint.includes('/api/admin/games') || endpoint.includes('/api/admin/levels') || endpoint.includes('/api/admin/questions')) {
    return MOCK_GAMES as unknown as T;
  }

  if (endpoint.includes('/api/admin/settings')) {
    return MOCK_SETTINGS as unknown as T;
  }

  if (endpoint.includes('/api/admin/participant-submissions') || endpoint.includes('/api/admin/feedback') || endpoint.includes('/api/admin/results')) {
    return [] as unknown as T;
  }

  return { success: true } as unknown as T;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const playerId = authStorage.getPlayerId();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (playerId && !headers.has('X-Player-Id')) {
    headers.set('X-Player-Id', playerId);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    return response.json();
  } catch (err) {
    console.warn(`[API Fetch Warning] Network error on ${endpoint}. Serving static fallback mock.`);
    return getStaticMockResponse<T>(endpoint, options);
  }
}

export const api = {
  // Auth
  adminLogin: async (identifier: string, password: string): Promise<{ token: string; user: UserProfile }> => {
    const res = await apiFetch<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    authStorage.setToken(res.token);
    return res;
  },

  playerRegister: async (username: string, email?: string, displayName?: string): Promise<{ token: string; user: UserProfile }> => {
    const res = await apiFetch<{ token: string; user: UserProfile }>('/api/auth/player-register', {
      method: 'POST',
      body: JSON.stringify({ username, email, displayName })
    });
    authStorage.setToken(res.token);
    authStorage.setPlayer(res.user);
    return res;
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    try {
      const res = await apiFetch<{ user: UserProfile }>('/api/auth/me');
      return res.user;
    } catch {
      return null;
    }
  },

  logout: async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    authStorage.clearToken();
  },

  // Game Player Endpoints
  getGameInit: async () => {
    const res = await apiFetch<{
      settings: GameSettings;
      user: UserProfile | null;
      token?: string;
      unlocks: Record<string, { isUnlocked: boolean; lockReason?: string }>;
      playerProgress: any[];
    }>('/api/game/init');
    if (res.token && !authStorage.getToken()) {
      authStorage.setToken(res.token);
    }
    return res;
  },

  getGames: async () => {
    return apiFetch<GameCard[]>('/api/games');
  },

  getLevels: async () => {
    return apiFetch<(Level & { isUnlocked: boolean; lockReason?: string; isCompleted: boolean; highestScore: number; highestStars: number })[]>('/api/game/levels');
  },

  getGameQuestions: async (levelId?: string) => {
    const query = levelId ? `?levelId=${encodeURIComponent(levelId)}` : '';
    return apiFetch<Question[]>(`/api/game/questions${query}`);
  },

  resetGameSession: async () => {
    const res = await apiFetch<{ success: boolean; token: string; user: UserProfile; levels: any[] }>('/api/game/reset-session', {
      method: 'POST'
    });
    if (res.token) {
      authStorage.setToken(res.token);
      authStorage.setPlayer(res.user);
    }
    return res;
  },

  startAttempt: async (levelId: string) => {
    const res = await apiFetch<{ attempt: PlayerAttempt; questions: Question[]; token?: string }>('/api/game/attempt/start', {
      method: 'POST',
      body: JSON.stringify({ levelId })
    });
    if (res.token && !authStorage.getToken()) {
      authStorage.setToken(res.token);
    }
    return res;
  },

  submitAnswer: async (attemptId: string, questionId: string, answer: string, timeTakenSeconds: number, hintUsed: boolean) => {
    return apiFetch<{
      isCorrect: boolean;
      pointsAwarded: number;
      penaltyDeducted: number;
      netScore: number;
      timeSaved: number;
    }>('/api/game/attempt/submit-answer', {
      method: 'POST',
      body: JSON.stringify({ attemptId, questionId, answer, timeTakenSeconds, hintUsed })
    });
  },

  finishAttempt: async (attemptId: string) => {
    return apiFetch<PlayerAttempt & { updatedLevels?: (Level & { isUnlocked: boolean; lockReason?: string; isCompleted: boolean; highestScore: number; highestStars: number })[] }>('/api/game/attempt/finish', {
      method: 'POST',
      body: JSON.stringify({ attemptId })
    });
  },

  getLeaderboard: async () => {
    return apiFetch<LeaderboardEntry[]>('/api/game/leaderboard');
  },

  // Admin Endpoints
  getDashboard: async () => {
    return apiFetch<{
      totalPlayers: number;
      totalLevels: number;
      activeLevels: number;
      lockedLevels: number;
      totalQuestions: number;
      publishedQuestions: number;
      draftQuestions: number;
      completedAttempts: number;
      recentActivity: PlayerAttempt[];
      leaderboard: LeaderboardEntry[];
      recentAuditLogs: AuditLog[];
    }>('/api/admin/dashboard');
  },

  getAdminGames: async () => {
    return apiFetch<GameCard[]>('/api/admin/games');
  },

  createGame: async (gameData: any) => {
    return apiFetch<GameCard>('/api/admin/games', {
      method: 'POST',
      body: JSON.stringify(gameData)
    });
  },

  updateGame: async (gameId: string, gameData: any) => {
    return apiFetch<GameCard>(`/api/admin/games/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(gameData)
    });
  },

  saveGame: async (gameData: any) => {
    return apiFetch<GameCard>('/api/admin/games', {
      method: 'POST',
      body: JSON.stringify(gameData)
    });
  },

  deleteGame: async (gameId: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/games/${gameId}`, {
      method: 'DELETE'
    });
  },

  getAdminLevels: async () => {
    return apiFetch<Level[]>('/api/admin/levels');
  },

  createLevel: async (levelData: any) => {
    return apiFetch<Level>('/api/admin/levels', {
      method: 'POST',
      body: JSON.stringify(levelData)
    });
  },

  updateLevel: async (levelId: string, levelData: any) => {
    return apiFetch<Level>(`/api/admin/levels/${levelId}`, {
      method: 'PUT',
      body: JSON.stringify(levelData)
    });
  },

  saveLevel: async (levelData: any) => {
    return apiFetch<Level>('/api/admin/levels', {
      method: 'POST',
      body: JSON.stringify(levelData)
    });
  },

  deleteLevel: async (levelId: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/levels/${levelId}`, {
      method: 'DELETE'
    });
  },

  getAdminQuestions: async (levelId?: string) => {
    const q = levelId ? `?levelId=${encodeURIComponent(levelId)}` : '';
    return apiFetch<Question[]>(`/api/admin/questions${q}`);
  },

  createQuestion: async (qData: any) => {
    return apiFetch<Question>('/api/admin/questions', {
      method: 'POST',
      body: JSON.stringify(qData)
    });
  },

  updateQuestion: async (qId: string, qData: any) => {
    return apiFetch<Question>(`/api/admin/questions/${qId}`, {
      method: 'PUT',
      body: JSON.stringify(qData)
    });
  },

  saveQuestion: async (qData: any) => {
    return apiFetch<Question>('/api/admin/questions', {
      method: 'POST',
      body: JSON.stringify(qData)
    });
  },

  deleteQuestion: async (qId: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/questions/${qId}`, {
      method: 'DELETE'
    });
  },

  clearLevelQuestions: async (levelId: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/levels/${levelId}/questions`, {
      method: 'DELETE'
    });
  },

  getAdminSettings: async () => {
    return apiFetch<GameSettings>('/api/admin/settings');
  },

  updateAdminSettings: async (settings: Partial<GameSettings>) => {
    return apiFetch<GameSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  uploadLogo: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await apiFetch<{ logoUrl: string }>('/api/admin/upload-logo', {
        method: 'POST',
        body: formData
      });
      return res;
    } catch {
      return { logoUrl: '/infoxtreme_logo.jpg' };
    }
  },

  getAdminResults: async () => {
    return apiFetch<PlayerAttempt[]>('/api/admin/results');
  },

  deleteResult: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/results/${id}`, {
      method: 'DELETE'
    });
  },

  deleteAttempt: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/results/${id}`, {
      method: 'DELETE'
    });
  },

  clearAllResults: async () => {
    return apiFetch<{ success: boolean; count: number }>('/api/admin/results', {
      method: 'DELETE'
    });
  },

  clearAllAttempts: async () => {
    return apiFetch<{ success: boolean; count: number }>('/api/admin/results', {
      method: 'DELETE'
    });
  },

  exportResultsCsv: async () => {
    try {
      const res = await fetch('/api/admin/results/export');
      if (!res.ok) throw new Error('Export failed');
      return res.text();
    } catch {
      return 'id,userId,score,stars,status\nmock_1,agent_1,250,3,completed';
    }
  },

  getAuditLogs: async () => {
    return apiFetch<AuditLog[]>('/api/admin/audit-logs');
  },

  clearAuditLogs: async () => {
    return apiFetch<{ success: boolean }>('/api/admin/audit-logs', {
      method: 'DELETE'
    });
  },

  submitParticipant: async (data: {
    name: string;
    registerNumber: string;
    collegeName: string;
    teamName: string;
    gameTitle: string;
    totalScore: number;
    totalStars: number;
    accuracyPercentage: number;
    totalTimeSpentSeconds: number;
    totalTimeSavedSeconds: number;
    completedLevelsCount: number;
    feedback?: string;
    rating?: number;
  }) => {
    const res = await apiFetch<{ success: boolean; submission: ParticipantSubmission }>('/api/admin/participant-submissions', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    try {
      const sb = getSupabaseClient();
      if (sb) {
        const payload = {
          name: data.name,
          register_number: data.registerNumber,
          college_name: data.collegeName,
          team_name: data.teamName,
          game_title: data.gameTitle,
          total_score: data.totalScore,
          total_stars: data.totalStars,
          accuracy_percentage: data.accuracyPercentage,
          total_time_spent_seconds: data.totalTimeSpentSeconds,
          total_time_saved_seconds: data.totalTimeSavedSeconds,
          completed_levels_count: data.completedLevelsCount,
          feedback: data.feedback,
          rating: data.rating,
          submitted_at: res.submission?.submittedAt || new Date().toISOString()
        };
        await sb.from('participant_submissions').insert([payload]);
      }
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    }

    return res;
  },

  getParticipantSubmissions: async (search?: string) => {
    try {
      const sb = getSupabaseClient();
      if (sb) {
        let query = sb.from('participant_submissions').select('*').order('submitted_at', { ascending: false });
        const { data, error } = await query;
        if (!error && data) {
          let list = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            registerNumber: row.register_number,
            collegeName: row.college_name,
            teamName: row.team_name,
            gameTitle: row.game_title,
            totalScore: row.total_score,
            totalStars: row.total_stars,
            accuracyPercentage: row.accuracy_percentage,
            totalTimeSpentSeconds: row.total_time_spent_seconds,
            totalTimeSavedSeconds: row.total_time_saved_seconds,
            completedLevelsCount: row.completed_levels_count,
            feedback: row.feedback,
            rating: row.rating,
            submittedAt: row.submitted_at
          }));
          if (search) {
            const q = search.toLowerCase();
            list = list.filter((s: ParticipantSubmission) => 
              s.name.toLowerCase().includes(q) ||
              s.registerNumber.toLowerCase().includes(q) ||
              s.collegeName.toLowerCase().includes(q) ||
              s.teamName.toLowerCase().includes(q)
            );
          }
          return list;
        }
      }
    } catch {}

    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiFetch<ParticipantSubmission[]>(`/api/admin/participant-submissions${q}`);
  },

  deleteParticipantSubmission: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/participant-submissions/${id}`, {
      method: 'DELETE'
    });
  },

  clearAllParticipantSubmissions: async () => {
    return apiFetch<{ success: boolean; count: number }>('/api/admin/participant-submissions', {
      method: 'DELETE'
    });
  },

  // Feedback Management
  getFeedbackList: async () => {
    return apiFetch<Array<{
      id: string;
      name: string;
      registerNumber: string;
      collegeName: string;
      teamName: string;
      gameTitle: string;
      rating: number;
      feedback: string;
      totalScore: number;
      submittedAt: string;
    }>>('/api/admin/feedback');
  },

  deleteFeedback: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/feedback/${id}`, {
      method: 'DELETE'
    });
  }
};
