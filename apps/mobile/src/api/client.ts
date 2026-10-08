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
export const api = {
  auth: {
    requestOtp: async (phone: string) => {
      return apiClient.post('/auth/send-otp', { phone, purpose: 'LOGIN' });
    },
    verifyOtp: async (phone: string, otp: string, deviceId: string) => {
      try {
        const loginRes = await apiClient.post('/auth/login', {
          phone,
          otpCode: otp,
          deviceId,
          platform: 'android',
          deviceModel: 'Android SDK built for x86'
        });
        return loginRes;
      } catch (err: any) {
        const isNotRegistered =
          err.response?.status === 401 ||
          err.response?.data?.message?.toLowerCase().includes('not found') ||
          err.response?.data?.message?.toLowerCase().includes('register');

        if (isNotRegistered) {
          await apiClient.post('/auth/verify-otp', {
            phone,
            otpCode: otp,
            purpose: 'LOGIN'
          });
          await apiClient.post('/auth/create-profile', {
            phone,
            name: `Player ${phone.slice(-4)}`,
            deviceId,
            platform: 'android',
            deviceModel: 'Android SDK built for x86'
          });
          return apiClient.post('/auth/login', {
            phone,
            otpCode: otp,
            deviceId,
            platform: 'android',
            deviceModel: 'Android SDK built for x86'
          });
        }
        throw err;
      }
    },
    register: async (data: any) => {
      return apiClient.post('/auth/create-profile', data);
    },
  },
  user: {
    getProfile: async () => {
      return apiClient.get('/user/profile');
    },
    updateProfile: async (updates: { name: string; email?: string; dob?: string; easypaisaNumber?: string }) => {
      return apiClient.patch('/user/update', updates);
    },
    getLeaderboard: async () => {
      const storedPhone = await AsyncStorage.getItem('user_phone');
      const res = await apiClient.get('/user/leaderboard');
      const mappedData = res.data.data.map((item: any) => ({
        rank: item.position,
        name: item.name || `Player ${item.phone?.slice(-4) || ''}`,
        score: item.xp,
        avatar: item.avatarUrl || '👤',
        isCurrentUser: item.phone === storedPhone,
      }));
      return { data: mappedData };
    },
  },
  quiz: {
    getCategories: async () => {
      return apiClient.get('/quiz/categories');
    },
    startSession: async (categoryId: string) => {
      const res = await apiClient.post('/quiz/start', { categoryId });
      const mappedQuestions = res.data.questions.map((q: any) => ({
        id: q.id,
        text: q.questionText,
        options: [
          { id: 'A', text: q.optionA },
          { id: 'B', text: q.optionB },
          { id: 'C', text: q.optionC },
          { id: 'D', text: q.optionD },
        ]
      }));
      return {
        data: {
          sessionId: res.data.sessionId,
          questions: mappedQuestions
        }
      };
    },
    submitAnswer: async (sessionId: string, questionId: string, answerId: string) => {
      return apiClient.post('/quiz/answer', {
        sessionId,
        questionId,
        selectedAnswer: answerId,
        timeTaken: 5
      });
    },
    completeSession: async (sessionId: string) => {
      const res = await apiClient.post('/quiz/finish', { sessionId });
      return {
        data: {
          score: res.data.score,
          total: res.data.totalQuestions,
          coinsEarned: res.data.coinsWon
        }
      };
    },
  },
  wallet: {
    getBalance: async () => {
      const res = await apiClient.get('/wallet');
      return {
        data: {
          balance: res.data.totalCoins
        }
      };
    },
    requestWithdrawal: async (amount: number, easypaisaNumber: string) => {
      return apiClient.post('/wallet/withdraw', { coins: amount, easypaisaNumber });
    },
    getWithdrawalHistory: async () => {
      const res = await apiClient.get('/wallet/withdrawals');
      const mapped = res.data.map((w: any) => ({
        id: w.id,
        amount: w.coins,
        account: w.easypaisaNumber,
        status: w.status,
        createdAt: w.createdAt
      }));
      return { data: mapped };
    },
  },
  ads: {
    watch: async (deviceId?: string) => {
      return apiClient.post('/ads/watch', { adType: 'REWARDED', deviceId });
    }
  },
  challenge: {
    create: async () => {
      return apiClient.post('/challenge/create', {});
    },
    join: async (inviteCode: string) => {
      return apiClient.post('/challenge/join', { inviteCode });
    },
    getQuestions: async (challengeId: string) => {
      const res = await apiClient.get(`/challenge/${challengeId}/questions`);
      const mapped = res.data.map((q: any) => ({
        id: q.id,
        text: q.questionText,
        correctAnswer: q.correctAnswer,
        options: [
          { id: 'A', text: q.optionA },
          { id: 'B', text: q.optionB },
          { id: 'C', text: q.optionC },
          { id: 'D', text: q.optionD },
        ]
      }));
      return { data: mapped };
    },
    submit: async (challengeId: string, score: number) => {
      return apiClient.post('/challenge/submit', { challengeId, score });
    },
    getHistory: async () => {
      return apiClient.get('/challenge/history');
    },
    getOne: async (challengeId: string) => {
      return apiClient.get(`/challenge/${challengeId}`);
    },
  }
};

const mockWithdrawals: Array<{ id: string; amount: number; account: string; status: string; createdAt: string }> = [
  { id: 'tx_101', amount: 500, account: '03001234567', status: 'COMPLETED', createdAt: '2026-07-28T10:15:00Z' },
  { id: 'tx_102', amount: 1000, account: '03001234567', status: 'COMPLETED', createdAt: '2026-07-25T14:30:00Z' },
];
