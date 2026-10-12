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
  ParticipantSubmission
} from '../types/game.ts';
import { getSupabaseClient } from './supabaseClient.ts';

const TOKEN_KEY = 'detective_auth_token';
const PLAYER_ID_KEY = 'detective_player_profile';
const AGENT_UUID_KEY = 'detective_agent_uuid';

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

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      if (text && !text.trim().startsWith('<')) {
        const errorJson = JSON.parse(text);
        if (errorJson.error) errorMsg = errorJson.error;
      }
    } catch {}
    throw new Error(errorMsg);
  }

  if (contentType.includes('text/html') || text.trim().startsWith('<')) {
    throw new Error('Received HTML response instead of JSON payload');
  }

  return JSON.parse(text);
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
    const formData = new FormData();
    formData.append('logo', file);
    return apiFetch<{ logoUrl: string }>('/api/admin/upload-logo', {
      method: 'POST',
      body: formData
    });
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
    const res = await fetch('/api/admin/results/export-csv');
    if (!res.ok) throw new Error('Export failed');
    return res.text();
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
  },

  clearAllData: async () => {
    return apiFetch<{ success: boolean; message: string; attemptsCount: number; submissionsCount: number; playersCount: number }>('/api/admin/clear-all-data', {
      method: 'POST'
    });
  }
};
