// src/api/queryClient.ts
// Central React Query client with smart caching defaults
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 2 minutes — no refetch if user switches screens quickly
      staleTime: 2 * 60 * 1000,
      // Cached data kept for 5 minutes even after all components unmount
      gcTime: 5 * 60 * 1000,
      // Retry once on failure
      retry: 1,
      // Refetch when app comes back to foreground
      refetchOnWindowFocus: false,
      // Don't refetch when component remounts if data is fresh
      refetchOnMount: true,
    },
  },
});
