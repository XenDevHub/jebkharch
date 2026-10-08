import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://109.199.122.238:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  auth: {
    requestOtp: (phone: string) => apiClient.post('/auth/send-otp', { phone, purpose: 'LOGIN' }),
    login: (phone: string, otpCode: string) => apiClient.post('/auth/login', { phone, otpCode, deviceId: 'admin-panel' }),
  },
  quiz: {
    getCategories: () => apiClient.get('/quiz/categories'),
  },
  admin: {
    getAnalytics: () => apiClient.get('/admin/analytics'),
    getUsers: (page = 1, pageSize = 20, search = '') => apiClient.get(`/admin/users?page=${page}&pageSize=${pageSize}&search=${search}`),
    banUser: (userId: string, reason: string) => apiClient.post('/admin/ban-user', { userId, reason }),
    unbanUser: (userId: string) => apiClient.post('/admin/unban-user', { userId }),
    getWithdrawals: (status?: string, page = 1) => apiClient.get(`/admin/withdrawals?page=${page}${status ? `&status=${status}` : ''}`),
    approveWithdrawal: (withdrawalId: string) => apiClient.post('/admin/approve-withdrawal', { withdrawalId }),
    rejectWithdrawal: (withdrawalId: string, reason?: string) => apiClient.post('/admin/reject-withdrawal', { withdrawalId, reason }),
    generateQuestions: (categoryId: string, count: number, difficulty: string) => apiClient.post('/admin/generate-questions', { categoryId, count, difficulty }),
    getFlaggedQuestions: (page = 1) => apiClient.get(`/admin/flagged-questions?page=${page}`),
    moderateQuestion: (questionId: string, approve: boolean) => apiClient.post('/admin/moderate-question', { questionId, approve }),
  }
};
