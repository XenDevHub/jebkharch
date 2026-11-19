// src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register device for Push Notifications and sync token with backend
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00d084',
      sound: 'default',
    });
  }

  if (Device.isDevice) {
    const existing = await Notifications.getPermissionsAsync();
    let finalStatus = (existing as any).status;

    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = (requested as any).status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied by user');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      'f35ea800-64d3-4dd8-99cb-601b43d672b0';

    // 1. Attempt to get Expo Push Token with EAS projectId
    try {
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      token = pushTokenData.data;
    } catch (e1) {
      console.log('Expo push token with projectId failed, trying without projectId:', e1);
      try {
        const pushTokenData = await Notifications.getExpoPushTokenAsync();
        token = pushTokenData.data;
      } catch (e2) {
        console.log('Default Expo push token failed, trying device push token:', e2);
        try {
          const deviceToken = await Notifications.getDevicePushTokenAsync();
          token = deviceToken.data;
        } catch (e3) {
          console.log('Device push token also failed:', e3);
        }
      }
    }

    if (token) {
      await AsyncStorage.setItem('push_token', token);
      console.log('Device push token generated:', token);

      // Immediately send token to backend API if user is authenticated
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        try {
          await api.notifications.registerToken(token);
          console.log('Push token successfully registered with backend database!');
        } catch (apiErr: any) {
          console.log('Error registering push token with backend:', apiErr?.response?.data || apiErr?.message);
        }
      }
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Sync existing or new push token whenever user logs in or visits HomeScreen
 */
export async function syncPushTokenWithBackend(): Promise<void> {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) return;

    let token = await AsyncStorage.getItem('push_token');
    if (!token || token.length < 5) {
      token = await registerForPushNotificationsAsync();
    } else {
      await api.notifications.registerToken(token);
      console.log('Existing push token verified with backend:', token);
    }
  } catch (err: any) {
    console.log('syncPushTokenWithBackend error:', err?.response?.data || err?.message);
  }
}

/**
 * Listeners for incoming notifications and user responses
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    onNotificationReceived?.(notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    onNotificationResponse?.(response);
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
