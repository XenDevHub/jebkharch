import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

// Determine the API base URL based on the environment
// In local dev, use your local machine's IP instead of localhost for Android emulator support
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the auth token and device ID to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach device ID for fraud tracking/device sessions
    let deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      // In a real app, you might use expo-application's getIosIdForVendorAsync or expo-device
      deviceId = `${Device.osName}-${Device.osVersion}-${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    config.headers['x-device-id'] = deviceId;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 Unauthorized (e.g., token expiration)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const newAccessToken = res.data.accessToken;
          await AsyncStorage.setItem('accessToken', newAccessToken);
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Handle failed refresh (e.g., log out user)
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

// API Service functions wrapper
export const api = {
  auth: {
    requestOtp: (phone: string) => apiClient.post('/auth/request-otp', { phone }),
    verifyOtp: (phone: string, otp: string, deviceId: string) => apiClient.post('/auth/verify-otp', { phone, otp, deviceId }),
    register: (data: any) => apiClient.post('/auth/register', data),
  },
  user: {
    getProfile: () => apiClient.get('/user/profile'),
    getLeaderboard: () => apiClient.get('/user/leaderboard'),
  },
  quiz: {
    getCategories: () => apiClient.get('/quiz/categories'),
    startSession: (categoryId: string) => apiClient.post('/quiz/start', { categoryId }),
    submitAnswer: (sessionId: string, questionId: string, answerId: string) => apiClient.post('/quiz/answer', { sessionId, questionId, answerId }),
    completeSession: (sessionId: string) => apiClient.post('/quiz/complete', { sessionId }),
  },
  wallet: {
    getBalance: () => apiClient.get('/wallet/balance'),
    requestWithdrawal: (amount: number, easypaisaNumber: string) => apiClient.post('/wallet/withdraw', { amount, easypaisaNumber }),
  },
};
