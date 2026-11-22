// src/hooks/useAppData.ts
// Centralized React Query hooks for all app data with smart persistent caching
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

// ── Persistent Cache Storage Keys ──
const CACHE_STORAGE_KEYS = {
  profile: '@cache_profile_data',
  balance: '@cache_wallet_balance',
  tickets: '@cache_tickets_balance',
};

// In-memory instant cache to provide 0ms synchronous fallback on mount
let inMemoryProfile: any = null;
let inMemoryBalance: number | null = null;
let inMemoryTickets: number | null = null;

// Preload cache from AsyncStorage at startup so data is immediately available
(async () => {
  try {
    const [savedProfile, savedBalance, savedTickets] = await Promise.all([
      AsyncStorage.getItem(CACHE_STORAGE_KEYS.profile),
      AsyncStorage.getItem(CACHE_STORAGE_KEYS.balance),
      AsyncStorage.getItem(CACHE_STORAGE_KEYS.tickets),
    ]);
    if (savedProfile) inMemoryProfile = JSON.parse(savedProfile);
    if (savedBalance !== null) inMemoryBalance = JSON.parse(savedBalance);
    if (savedTickets !== null) inMemoryTickets = JSON.parse(savedTickets);
  } catch {
    // Non-blocking fallback
  }
})();

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
  dailyChallengeStatus: ['quiz', 'dailyChallengeStatus'] as const,
};

// ── Profile (with persistent cache for name, avatar, coins, performance stats & rank) ──
export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async () => {
      const res = await api.user.getProfile();
      if (res?.data) {
        inMemoryProfile = res.data;
        AsyncStorage.setItem(CACHE_STORAGE_KEYS.profile, JSON.stringify(res.data)).catch(() => null);
      }
      return res.data;
    },
    placeholderData: (previousData) => previousData ?? inMemoryProfile,
    staleTime: 5 * 60 * 1000, // 5 min
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

// ── Wallet Balance (with persistent cache for instant coins display on Home & Profile) ──
export function useWalletBalance() {
  return useQuery({
    queryKey: QUERY_KEYS.walletBalance,
    queryFn: async () => {
      const res = await api.wallet.getBalance();
      const bal = res.data?.balance ?? 0;
      inMemoryBalance = bal;
      AsyncStorage.setItem(CACHE_STORAGE_KEYS.balance, JSON.stringify(bal)).catch(() => null);
      return bal;
    },
    placeholderData: (previousData) => previousData ?? inMemoryBalance ?? 0,
    staleTime: 5 * 60 * 1000, // 5 min
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

// ── Tickets (with persistent cache) ──
export function useTickets() {
  return useQuery({
    queryKey: QUERY_KEYS.tickets,
    queryFn: async () => {
      const res = await api.tickets.getBalance();
      const t = res.data?.tournamentTickets ?? 0;
      inMemoryTickets = t;
      AsyncStorage.setItem(CACHE_STORAGE_KEYS.tickets, JSON.stringify(t)).catch(() => null);
      return t;
    },
    placeholderData: (previousData) => previousData ?? inMemoryTickets ?? 0,
    staleTime: 5 * 60 * 1000,
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

// ── Teams / Clans ──
export function useTeams() {
  return useQuery({
    queryKey: QUERY_KEYS.teams,
    queryFn: async () => {
      const res = await api.team.getTeams();
      return res.data?.data || [];
    },
    staleTime: 60 * 1000,
  });
}

// ── Daily Challenge Status (2x Coins) ──
export function useDailyChallengeStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.dailyChallengeStatus,
    queryFn: async () => {
      const res = await api.quiz.getDailyChallengeStatus();
      return res.data;
    },
    staleTime: 30 * 1000,
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
