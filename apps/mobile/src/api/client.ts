import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

// Determine the API base URL based on the environment
// In local dev, use your local machine's IP instead of localhost for Android emulator support
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://109.199.122.238:3000/api';

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
// API Service functions wrapper
// MOCKED FOR CLIENT DEMO
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockBalance = 2500;
let currentScore = 0;

export const api = {
  auth: {
    requestOtp: async (phone: string) => {
      await delay(1000);
      return { data: { message: 'OTP sent' } };
    },
    verifyOtp: async (phone: string, otp: string, deviceId: string) => {
      await delay(1000);
      if (otp !== '123456') { 
        return Promise.reject({ response: { data: { message: 'Invalid OTP' } } });
      }
      return { 
        data: { 
          accessToken: 'mock_access_token_123', 
          refreshToken: 'mock_refresh_token_123', 
          isNewUser: false 
        } 
      };
    },
    register: async (data: any) => {
      await delay(1000);
      return { data: { success: true } };
    },
  },
  user: {
    getProfile: async () => {
      await delay(500);
      return { data: { name: 'Client Demo', phone: '03000000000' } };
    },
    getLeaderboard: async () => {
      await delay(500);
      return { 
        data: [
          { rank: 1, name: 'Shahzaib K.', score: 14200, avatar: '👑', isCurrentUser: false },
          { rank: 2, name: 'Hamza Malik', score: 12850, avatar: '🥈', isCurrentUser: false },
          { rank: 3, name: 'Ali Raza', score: 11400, avatar: '🥉', isCurrentUser: false },
          { rank: 4, name: 'Tariq J.', score: 9800, avatar: '⚡', isCurrentUser: false },
          { rank: 5, name: 'Zohaib Ahmed', score: 8550, avatar: '🔥', isCurrentUser: false },
          { rank: 14, name: 'You (Riduan)', score: 3250, avatar: '🎮', isCurrentUser: true },
        ] 
      };
    },
  },
  quiz: {
    getCategories: async () => {
      await delay(500);
      return { 
        data: [
          { id: '1', name: 'General Knowledge', icon: 'earth', isPremium: false },
          { id: '2', name: 'Science', icon: 'flask', isPremium: false },
          { id: '3', name: 'History', icon: 'book', isPremium: false },
          { id: '4', name: 'Sports', icon: 'football', isPremium: false },
          { id: '5', name: 'Technology', icon: 'hardware-chip', isPremium: true },
        ] 
      };
    },
    startSession: async (categoryId: string) => {
      await delay(500);
      currentScore = 0;
      return { 
        data: { 
          sessionId: 'session_123',
          questions: [
            { id: 'q1', text: 'Which planet is known as the Red Planet?', options: [{id: 'o1', text: 'Earth'}, {id: 'o2', text: 'Mars'}, {id: 'o3', text: 'Jupiter'}, {id: 'o4', text: 'Venus'}] },
            { id: 'q2', text: 'What is the largest ocean on Earth?', options: [{id: 'o1', text: 'Atlantic'}, {id: 'o2', text: 'Indian'}, {id: 'o3', text: 'Arctic'}, {id: 'o4', text: 'Pacific'}] },
            { id: 'q3', text: 'What is the capital of Japan?', options: [{id: 'o1', text: 'Seoul'}, {id: 'o2', text: 'Beijing'}, {id: 'o3', text: 'Tokyo'}, {id: 'o4', text: 'Bangkok'}] },
          ]
        } 
      };
    },
    submitAnswer: async (sessionId: string, questionId: string, answerId: string) => {
      await delay(200);
      // Hardcode correct answers for mock: q1=o2, q2=o4, q3=o3
      const isCorrect = 
        (questionId === 'q1' && answerId === 'o2') ||
        (questionId === 'q2' && answerId === 'o4') ||
        (questionId === 'q3' && answerId === 'o3');
        
      if (isCorrect) currentScore++;
      
      return { data: { correct: isCorrect } };
    },
    completeSession: async (sessionId: string) => {
      await delay(1000);
      const coinsEarned = currentScore * 10;
      mockBalance += coinsEarned;
      return { data: { score: currentScore, total: 3, coinsEarned } };
    },
  },
  wallet: {
    getBalance: async () => {
      await delay(500);
      return { data: { balance: mockBalance } };
    },
    requestWithdrawal: async (amount: number, easypaisaNumber: string) => {
      await delay(1500);
      if (amount > mockBalance) {
        return Promise.reject({ response: { data: { message: 'Insufficient balance' } } });
      }
      mockBalance -= amount;
      mockWithdrawals.unshift({
        id: `tx_${Date.now()}`,
        amount,
        account: easypaisaNumber,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      });
      return { data: { success: true, newBalance: mockBalance } };
    },
    getWithdrawalHistory: async () => {
      await delay(500);
      return { data: mockWithdrawals };
    },
  },
};

const mockWithdrawals: Array<{ id: string; amount: number; account: string; status: string; createdAt: string }> = [
  { id: 'tx_101', amount: 500, account: '03001234567', status: 'COMPLETED', createdAt: '2026-07-28T10:15:00Z' },
  { id: 'tx_102', amount: 1000, account: '03001234567', status: 'COMPLETED', createdAt: '2026-07-25T14:30:00Z' },
];
