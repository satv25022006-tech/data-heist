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

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
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

  getAdminLevels: async () => {
    return apiFetch<Level[]>('/api/admin/levels');
  },

  createLevel: async (levelData: Partial<Level>) => {
    return apiFetch<Level>('/api/admin/levels', {
      method: 'POST',
      body: JSON.stringify(levelData)
    });
  },

  updateLevel: async (id: string, updates: Partial<Level>) => {
    return apiFetch<Level>(`/api/admin/levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  deleteLevel: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/levels/${id}`, {
      method: 'DELETE'
    });
  },

  clearLevelQuestions: async (levelId: string) => {
    return apiFetch<{ success: boolean; count: number }>(`/api/admin/levels/${levelId}/questions`, {
      method: 'DELETE'
    });
  },

  duplicateLevel: async (id: string) => {
    return apiFetch<Level>(`/api/admin/levels/${id}/duplicate`, {
      method: 'POST'
    });
  },

  publishLevel: async (id: string) => {
    return apiFetch<Level>(`/api/admin/levels/${id}/publish`, {
      method: 'POST'
    });
  },

  getAdminQuestions: async (filters?: { levelId?: string; status?: string; difficulty?: string }) => {
    const params = new URLSearchParams();
    if (filters?.levelId) params.set('levelId', filters.levelId);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.difficulty) params.set('difficulty', filters.difficulty);
    return apiFetch<Question[]>(`/api/admin/questions?${params.toString()}`);
  },

  createQuestion: async (questionData: Partial<Question>) => {
    return apiFetch<Question>('/api/admin/questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    });
  },

  updateQuestion: async (id: string, updates: Partial<Question>) => {
    return apiFetch<Question>(`/api/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  deleteQuestion: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/questions/${id}`, {
      method: 'DELETE'
    });
  },

  duplicateQuestion: async (id: string) => {
    return apiFetch<Question>(`/api/admin/questions/${id}/duplicate`, {
      method: 'POST'
    });
  },

  uploadPoster: async (file: File, caption?: string, altText?: string, questionId?: string) => {
    const formData = new FormData();
    formData.append('poster', file);
    if (caption) formData.append('caption', caption);
    if (altText) formData.append('altText', altText);
    if (questionId) formData.append('questionId', questionId);

    return apiFetch<{ success: boolean; poster: QuestionPoster }>('/api/admin/upload-poster', {
      method: 'POST',
      body: formData
    });
  },

  getAdminPosters: async () => {
    return apiFetch<QuestionPoster[]>('/api/admin/posters');
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

  getAdminPlayers: async (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiFetch<(UserProfile & { totalScore: number; totalStars: number; completedLevels: number })[]>(`/api/admin/players${q}`);
  },

  resetPlayerProgress: async (playerId: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/players/${playerId}/reset`, {
      method: 'POST'
    });
  },

  toggleBlockPlayer: async (playerId: string) => {
    return apiFetch<{ isBlocked: boolean }>(`/api/admin/players/${playerId}/toggle-block`, {
      method: 'POST'
    });
  },

  getAdminResults: async (filters?: { playerId?: string; levelId?: string; difficulty?: string }) => {
    const params = new URLSearchParams();
    if (filters?.playerId) params.set('playerId', filters.playerId);
    if (filters?.levelId) params.set('levelId', filters.levelId);
    if (filters?.difficulty) params.set('difficulty', filters.difficulty);
    return apiFetch<PlayerAttempt[]>(`/api/admin/results?${params.toString()}`);
  },

  deleteAttempt: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/results/${id}`, {
      method: 'DELETE'
    });
  },

  clearAllAttempts: async () => {
    return apiFetch<{ success: boolean; count: number }>('/api/admin/results', {
      method: 'DELETE'
    });
  },

  getAdminAuditLogs: async (type?: string) => {
    const q = type ? `?type=${encodeURIComponent(type)}` : '';
    return apiFetch<AuditLog[]>(`/api/admin/audit-logs${q}`);
  },

  bulkImportQuestions: async (items: Partial<Question>[]) => {
    return apiFetch<{ importedCount: number; items: Question[] }>('/api/admin/questions/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  },

  // Game Modules / Cases Management
  getGames: async () => {
    return apiFetch<GameCard[]>('/api/game/games');
  },

  getAdminGames: async () => {
    return apiFetch<GameCard[]>('/api/admin/games');
  },

  createGame: async (data: Partial<GameCard>) => {
    return apiFetch<GameCard>('/api/admin/games', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateGame: async (id: string, updates: Partial<GameCard>) => {
    return apiFetch<GameCard>(`/api/admin/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  deleteGame: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/api/admin/games/${id}`, {
      method: 'DELETE'
    });
  },

  // Official College Event Participant Submissions
  submitParticipant: async (data: Omit<ParticipantSubmission, 'id' | 'submittedAt'>) => {
    const res = await apiFetch<{ success: boolean; submission: ParticipantSubmission }>('/api/game/participant-submission', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    // Also persist directly into Supabase if configured
    try {
      const sb = getSupabaseClient();
      if (sb) {
        const payload = {
          id: res.submission.id,
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
          submitted_at: res.submission.submittedAt
        };
        const { error } = await sb.from('participant_submissions').insert([payload]);
        if (error) {
          console.warn('Supabase participant submission insert error:', error.message);
        } else {
          console.log('Successfully stored participant submission in Supabase database.');
        }
      }
    } catch (err) {
      console.warn('Failed to sync participant submission to Supabase:', err);
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
    } catch (err) {
      console.warn('Failed to fetch from Supabase, falling back to local API:', err);
    }

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
