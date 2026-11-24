// src/hooks/useNetworkStatus.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getNetworkStatusAsync,
  subscribeToNetworkChanges,
  NetworkStatus,
} from '../services/networkService';

export function useNetworkStatus() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    isOffline: false,
    type: 'unknown',
  });
  const [isChecking, setIsChecking] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);
  const prevOfflineRef = useRef(false);

  useEffect(() => {
    // Initial fetch
    getNetworkStatusAsync().then((initial) => {
      setStatus(initial);
      prevOfflineRef.current = initial.isOffline;
    });

    // Real-time listener
    const unsubscribe = subscribeToNetworkChanges((newStatus) => {
      // If we were offline and now came back online
      if (prevOfflineRef.current && !newStatus.isOffline) {
        setJustReconnected(true);
        // Refresh stale data automatically
        queryClient.invalidateQueries().catch(() => null);

        // Hide "reconnected" confirmation banner after 3 seconds
        setTimeout(() => {
          setJustReconnected(false);
        }, 3000);
      }

      prevOfflineRef.current = newStatus.isOffline;
      setStatus(newStatus);
    });

    return unsubscribe;
  }, [queryClient]);

  const refresh = useCallback(async () => {
    setIsChecking(true);
    try {
      const fresh = await getNetworkStatusAsync();
      if (prevOfflineRef.current && !fresh.isOffline) {
        setJustReconnected(true);
        queryClient.invalidateQueries().catch(() => null);
        setTimeout(() => setJustReconnected(false), 3000);
      }
      prevOfflineRef.current = fresh.isOffline;
      setStatus(fresh);
      return !fresh.isOffline;
    } finally {
      setIsChecking(false);
    }
  }, [queryClient]);

  return {
    ...status,
    isChecking,
    justReconnected,
    refresh,
  };
}
