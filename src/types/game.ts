export type UserRole = 'super_admin' | 'content_admin' | 'game_manager' | 'analyst' | 'player';

export type LevelDifficulty = 'easy' | 'medium' | 'hard';

export type ContentStatus = 'draft' | 'published' | 'archived';

export type AnswerType = 'multiple_choice' | 'text_input';

export interface AnswerOption {
  id: string;
  optionKey: string; // 'A', 'B', 'C', 'D'
  text: string;
  isCorrect?: boolean; // Hidden from untrusted player
}

export interface Question {
  id: string;
  levelId: string;
  title: string;
  text: string;
  imagePosterUrl?: string;
  imageCaption?: string;
  imageStoragePath?: string;
  answerType: AnswerType;
  options: AnswerOption[];
  correctAnswerSecret: string; // Only visible to admin/backend
  explanation: string;
  hint?: string;
  difficulty: LevelDifficulty;
  category: string;
  points: number;
  incorrectPenalty: number;
  timerOverrideSeconds?: number | null;
  autoClosedOnTimeout?: boolean;
  displayOrder: number;
  status: ContentStatus;
  translations?: Record<string, {
    title?: string;
    text?: string;
    caption?: string;
    options?: Record<string, string>;
    hint?: string;
    explanation?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LevelUnlockRequirements {
  requiredPreviousLevelId?: string | null;
  minStarsFromEasy?: number;
  minStarsFromMedium?: number;
  minTotalStars?: number;
  minTotalScore?: number;
  customConditionDescription?: string;
}

export interface Level {
  id: string;
  gameId?: string;
  slug: string;
  levelNumber: number;
  displayOrder: number;
  name: string;
  description: string;
  difficulty: LevelDifficulty;
  timeLimitSeconds: number; // 0 for untimed
  pointsPerQuestion: number;
  passingScore: number;
  minStarsRequiredToPass: number;
  hintAvailable: boolean;
  hintPenalty: number;
  incorrectPenalty: number;
  speedBonusEnabled: boolean;
  speedBonusMax: number;
  status: ContentStatus;
  backgroundImageUrl?: string;
  unlockRequirements: LevelUnlockRequirements;
  translations?: Record<string, {
    name?: string;
    description?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface GameSettings {
  id: string;
  gameTitle: string;
  gameDescription: string;
  logoUrl?: string;
  theme: string;
  maintenanceMode: boolean;
  demoRulesCountdownEnabled: boolean;
  demoRulesCountdownSeconds: number;
  defaultTimerSeconds: number;
  briefingTimerSeconds: number;
  allowTimerPause: boolean;
  allowQuestionRetry: boolean;
  autoSubmitOnTimeout: boolean;
  timeoutPenaltyPoints: number;
  baseCorrectPoints: number;
  incorrectPenaltyPoints: number;
  hintPenaltyPoints: number;
  speedBonusMultiplier: number;
  soundEffectsEnabled: boolean;
  supportedLanguages: string[];
  defaultLanguage: string;
  rulesText: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface PlayerProgress {
  levelId: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  highestScore: number;
  highestStars: number;
  fastestTimeSeconds: number;
  attemptsCount: number;
  firstCompletedAt?: string;
  lastAttemptAt?: string;
}

export interface AttemptAnswer {
  questionId: string;
  submittedAnswer: string;
  isCorrect: boolean;
  pointsAwarded: number;
  penaltyDeducted: number;
  hintUsed: boolean;
  timeTakenSeconds: number;
  timeSavedSeconds: number;
  correctAnswer?: string; // Revealed after attempt finishes
  explanation?: string;
}

export interface PlayerAttempt {
  id: string;
  playerId: string;
  playerName: string;
  levelId: string;
  levelName: string;
  levelDifficulty: LevelDifficulty;
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'timeout' | 'abandoned';
  totalScore: number;
  starsEarned: number;
  totalTimeSpentSeconds: number;
  totalTimeSavedSeconds: number;
  accuracyPercentage: number;
  hintsUsedCount: number;
  isPassed: boolean;
  answers: AttemptAnswer[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId?: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface QuestionPoster {
  id: string;
  questionId?: string;
  storagePath: string;
  publicUrl: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  caption?: string;
  altText?: string;
  createdAt: string;
}

export interface ParticipantSubmission {
  id: string;
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
  rank?: number;
  submittedAt: string;
}

export interface FeedbackRecord {
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
}

export interface GameCard {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  icon: string; // 'fingerprint', 'shield', 'vault'
  badge: string;
  totalLevels: number;
  estimatedTime: string;
  rules: string[];
  translations?: Record<string, {
    title?: string;
    tagline?: string;
    description?: string;
    category?: string;
    rules?: string[];
  }>;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalStars: number;
  totalScore: number;
  completedLevelsCount: number;
  totalTimeSaved: number;
  rank: number;
}
