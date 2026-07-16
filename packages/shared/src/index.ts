// ─────────────────────────────────────────────
// Jeb Kharch — Shared Types, DTOs & Constants
// ─────────────────────────────────────────────

// ── Enums ────────────────────────────────────

export enum UserRole {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
}

export enum OtpPurpose {
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  CHANGE_PHONE = 'CHANGE_PHONE',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum ChallengeStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionSource {
  QUIZ_REWARD = 'QUIZ_REWARD',
  QUIZ_ENTRY = 'QUIZ_ENTRY',
  CHALLENGE_WIN = 'CHALLENGE_WIN',
  CHALLENGE_ENTRY = 'CHALLENGE_ENTRY',
  CHALLENGE_REFUND = 'CHALLENGE_REFUND',
  TOURNAMENT_REWARD = 'TOURNAMENT_REWARD',
  TOURNAMENT_ENTRY = 'TOURNAMENT_ENTRY',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  SIGNUP_BONUS = 'SIGNUP_BONUS',
  DAILY_LOGIN = 'DAILY_LOGIN',
  AD_REWARD = 'AD_REWARD',
  WITHDRAWAL = 'WITHDRAWAL',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
}

export enum AdType {
  INTERSTITIAL = 'INTERSTITIAL',
  REWARDED = 'REWARDED',
  BANNER = 'BANNER',
}

// ── Coin Economy Constants ────────────────────

export const COIN_CONSTANTS = {
  SIGNUP_BONUS: 5,
  REFERRAL_BONUS: 5,
  DAILY_LOGIN_BONUS: 2,
  NORMAL_QUIZ_ENTRY: 5,
  CHALLENGE_ENTRY: 15,
  CHALLENGE_WIN_POT: 30, // winner takes all
  AD_REWARD_MIN: 1,
  AD_REWARD_MAX: 3,
  DAILY_EARNING_CAP: 50,
  DAILY_AD_WATCH_CAP: 10,
  MIN_WITHDRAWAL: 500,
  WITHDRAWAL_COOLDOWN_HOURS: 24,
  LARGE_WITHDRAWAL_THRESHOLD: 1000, // requires manual review
} as const;

export const QUIZ_REWARDS: Record<number, number> = {
  10: 15, // perfect score
  9: 8,
  8: 5,
  // 7 and below = 0 coins
};

export const QUIZ_CONSTANTS = {
  QUESTIONS_PER_SESSION: 10,
  TIME_PER_QUESTION_SECONDS: 15,
  MIN_CORRECT_FOR_REWARD: 8,
} as const;

export const OTP_CONSTANTS = {
  EXPIRY_SECONDS: 300,
  RESEND_COOLDOWN_SECONDS: 60,
  MAX_ATTEMPTS: 5,
  LENGTH: 6,
} as const;

export const SUBSCRIPTION_CONSTANTS = {
  PRICE_PKR: 150,
  XP_MULTIPLIER: 2,
  AD_FREE: true,
} as const;

// ── Quiz Categories ───────────────────────────

export interface QuizCategory {
  id: string;
  name: string;
  icon: string;
  difficulty: Difficulty;
  entryFee: number;
  isPremium: boolean;
}

export const DEFAULT_CATEGORIES: Omit<QuizCategory, 'id'>[] = [
  { name: 'Cricket', icon: '🏏', difficulty: Difficulty.EASY, entryFee: 5, isPremium: false },
  { name: 'Movies', icon: '🎬', difficulty: Difficulty.EASY, entryFee: 5, isPremium: false },
  { name: 'History', icon: '📜', difficulty: Difficulty.MEDIUM, entryFee: 5, isPremium: false },
  { name: 'Science', icon: '🔬', difficulty: Difficulty.MEDIUM, entryFee: 5, isPremium: false },
  { name: 'Islamic Knowledge', icon: '☪️', difficulty: Difficulty.EASY, entryFee: 5, isPremium: false },
  { name: 'General Knowledge', icon: '🌍', difficulty: Difficulty.EASY, entryFee: 5, isPremium: false },
  { name: 'Cars', icon: '🚗', difficulty: Difficulty.MEDIUM, entryFee: 5, isPremium: false },
  { name: 'Anime', icon: '⚔️', difficulty: Difficulty.MEDIUM, entryFee: 5, isPremium: true },
  { name: 'Football', icon: '⚽', difficulty: Difficulty.EASY, entryFee: 5, isPremium: false },
  { name: 'Technology', icon: '💻', difficulty: Difficulty.HARD, entryFee: 5, isPremium: true },
];

// ── Auth DTOs ─────────────────────────────────

export interface SendOtpDto {
  phone: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpDto {
  phone: string;
  otpCode: string;
  purpose: OtpPurpose;
}

export interface CreateProfileDto {
  phone: string;
  name: string;
  referralCode?: string;
  deviceId?: string;
  avatarUrl?: string;
}

export interface LoginDto {
  phone: string;
  otpCode: string;
  deviceId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ── User DTOs ─────────────────────────────────

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  coins: number;
  xp: number;
  rank: number;
  isPro: boolean;
  referralCode: string;
  createdAt: string;
}

export interface UserStats {
  totalQuizzes: number;
  winRate: number;
  currentStreak: number;
  totalCoinsEarned: number;
  totalChallenges: number;
  challengeWinRate: number;
}

// ── Quiz DTOs ─────────────────────────────────

export interface StartQuizDto {
  categoryId: string;
}

export interface AnswerQuestionDto {
  sessionId: string;
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  timeTaken: number; // seconds
}

export interface FinishQuizDto {
  sessionId: string;
}

export interface QuizResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  coinsWon: number;
  xpGained: number;
  answers: AnswerResult[];
}

export interface AnswerResult {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  timeTaken: number;
}

// ── Challenge DTOs ────────────────────────────

export interface CreateChallengeDto {
  categoryId: string;
}

export interface JoinChallengeDto {
  challengeId: string;
  deviceId?: string;
}

export interface SubmitChallengeAnswersDto {
  challengeId: string;
  answers: Omit<AnswerQuestionDto, 'sessionId'>[];
}

// ── Wallet DTOs ───────────────────────────────

export interface WalletSummary {
  totalCoins: number;
  pendingWithdrawals: number;
  todayEarned: number;
  totalWithdrawn: number;
}

export interface WithdrawDto {
  easypaisaNumber: string;
  coins: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  source: TransactionSource;
  status: TransactionStatus;
  createdAt: string;
  description?: string;
}

// ── Socket Events ─────────────────────────────

export enum SocketEvent {
  // Challenge
  CHALLENGE_JOINED = 'challenge:joined',
  CHALLENGE_STARTED = 'challenge:started',
  CHALLENGE_OPPONENT_READY = 'challenge:opponent_ready',
  CHALLENGE_COMPLETED = 'challenge:completed',
  CHALLENGE_CANCELLED = 'challenge:cancelled',
  CHALLENGE_COUNTDOWN = 'challenge:countdown',

  // General
  NOTIFICATION = 'notification',
  COIN_BALANCE_UPDATE = 'coin:balance_update',
}

// ── Pagination ────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

// ── API Response wrapper ──────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ── Referral ──────────────────────────────────

export interface ReferralInfo {
  code: string;
  totalReferrals: number;
  totalRewardEarned: number;
}

// ── Admin DTOs ────────────────────────────────

export interface AdminBanUserDto {
  userId: string;
  reason: string;
}

export interface AdminWithdrawalActionDto {
  withdrawalId: string;
  action: 'approve' | 'reject';
  note?: string;
}

export interface GenerateQuestionsDto {
  categoryId: string;
  count: number;
  difficulty: Difficulty;
}

// ── Fraud ─────────────────────────────────────

export enum FraudReason {
  MULTIPLE_ACCOUNTS_DEVICE = 'MULTIPLE_ACCOUNTS_DEVICE',
  SHARED_EASYPAISA = 'SHARED_EASYPAISA',
  UNUSUAL_WIN_RATE = 'UNUSUAL_WIN_RATE',
  AD_FARMING = 'AD_FARMING',
  OTP_SPAM = 'OTP_SPAM',
  REFERRAL_LOOP = 'REFERRAL_LOOP',
  VPN_DETECTED = 'VPN_DETECTED',
  EMULATOR_DETECTED = 'EMULATOR_DETECTED',
}
