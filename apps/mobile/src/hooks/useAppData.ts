// src/hooks/useAppData.ts
// Centralized React Query hooks for all app data with smart caching
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

// ── Query Keys (constants for cache identity) ──
export const QUERY_KEYS = {
  profile: ['profile'] as const,
  categories: ['categories'] as const,
  walletBalance: ['wallet', 'balance'] as const,
  streakStatus: ['streak', 'status'] as const,
  lives: ['lives'] as const,
  leaderboard: ['leaderboard'] as const,
  missions: ['missions'] as const,
  achievements: ['achievements'] as const,
  wrongAnswers: ['wrongAnswers'] as const,
  teams: ['teams'] as const,
  withdrawalHistory: ['withdrawal', 'history'] as const,
  referralCode: ['referral', 'code'] as const,
  tickets: ['tickets'] as const,
};

// ── Profile ──
export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async () => {
      const res = await api.user.getProfile();
      return res.data;
    },
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

// ── Categories ──
export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      const res = await api.quiz.getCategories();
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // 10 min — categories rarely change
  });
}

// ── Wallet Balance ──
export function useWalletBalance() {
  return useQuery({
    queryKey: QUERY_KEYS.walletBalance,
    queryFn: async () => {
      const res = await api.wallet.getBalance();
      return res.data.balance ?? 0;
    },
    staleTime: 60 * 1000, // 1 min
  });
}

// ── Streak Status ──
export function useStreakStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.streakStatus,
    queryFn: async () => {
      const res = await api.streak.getStatus();
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ── Lives ──
export function useLives() {
  return useQuery({
    queryKey: QUERY_KEYS.lives,
    queryFn: async () => {
      const res = await api.bonus.getLives();
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

// ── Tickets ──
export function useTickets() {
  return useQuery({
    queryKey: QUERY_KEYS.tickets,
    queryFn: async () => {
      const res = await api.tickets.getBalance();
      return res.data?.tournamentTickets ?? 0;
    },
    staleTime: 60 * 1000,
  });
}

// ── Leaderboard ──
export function useLeaderboard() {
  return useQuery({
    queryKey: QUERY_KEYS.leaderboard,
    queryFn: async () => {
      const res = await api.user.getLeaderboard();
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ── Missions ──
export function useMissions() {
  return useQuery({
    queryKey: QUERY_KEYS.missions,
    queryFn: async () => {
      const res = await api.missions.getMissions();
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

// ── Achievements ──
export function useAchievements() {
  return useQuery({
    queryKey: QUERY_KEYS.achievements,
    queryFn: async () => {
      const res = await api.missions.getAchievements();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Wrong Answers ──
export function useWrongAnswers() {
  return useQuery({
    queryKey: QUERY_KEYS.wrongAnswers,
    queryFn: async () => {
      const res = await api.wrongAnswers.getBank();
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

// ── Invalidation helpers (call after mutations) ──
export function useInvalidateQueries() {
  const qc = useQueryClient();
  return {
    invalidateProfile: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
    invalidateBalance: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.walletBalance }),
    invalidateStreak: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.streakStatus }),
    invalidateLives: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.lives }),
    invalidateTickets: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
    invalidateMissions: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.missions }),
    invalidateWrongAnswers: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.wrongAnswers }),
    invalidateAll: () => qc.invalidateQueries(),
    // After quiz/game — refresh everything that changes
    invalidateAfterQuiz: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.profile });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.walletBalance });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.streakStatus });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.lives });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.missions });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.wrongAnswers });
    },
  };
}
