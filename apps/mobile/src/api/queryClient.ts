// src/api/queryClient.ts
// Central React Query client with smart caching defaults
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes — instant display when switching screens
      staleTime: 5 * 60 * 1000,
      // Cached data kept in memory for 24 hours
      gcTime: 24 * 60 * 60 * 1000,
      // Retry once on failure
      retry: 1,
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
      // Don't refetch on component remount if cached data is fresh
      refetchOnMount: false,
    },
  },
});
