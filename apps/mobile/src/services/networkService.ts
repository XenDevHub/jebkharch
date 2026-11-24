// src/services/networkService.ts
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

// Sync React Query's onlineManager with native NetInfo
// This automatically pauses failed queries while offline and refetches them when reconnected
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state: NetInfoState) => {
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
    setOnline(isOnline);
  });
});

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOffline: boolean;
  type: string;
}

/**
 * Check current network status immediately
 */
export async function getNetworkStatusAsync(): Promise<NetworkStatus> {
  try {
    const state = await NetInfo.fetch();
    const isConnected = Boolean(state.isConnected);
    // Note: isInternetReachable can be null initially while determining
    const isOffline = !isConnected || state.isInternetReachable === false;
    
    return {
      isConnected,
      isInternetReachable: state.isInternetReachable,
      isOffline,
      type: state.type,
    };
  } catch {
    return {
      isConnected: false,
      isInternetReachable: false,
      isOffline: true,
      type: 'unknown',
    };
  }
}

/**
 * Subscribe to real-time network connectivity changes
 */
export function subscribeToNetworkChanges(callback: (status: NetworkStatus) => void): () => void {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const isConnected = Boolean(state.isConnected);
    const isOffline = !isConnected || state.isInternetReachable === false;
    
    callback({
      isConnected,
      isInternetReachable: state.isInternetReachable,
      isOffline,
      type: state.type,
    });
  });

  return unsubscribe;
}
