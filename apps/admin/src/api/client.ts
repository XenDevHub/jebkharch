import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  auth: {
    login: (phone: string, otp: string) => apiClient.post('/auth/verify-otp', { phone, otp, deviceId: 'admin-portal' }),
  },
  users: {
    getList: (page: number, search?: string) => apiClient.get('/admin/users', { params: { page, search } }),
    ban: (userId: string, reason: string) => apiClient.post('/admin/ban-user', { userId, reason }),
  },
  withdrawals: {
    getList: (status?: string, page = 1) => apiClient.get('/admin/withdrawals', { params: { status, page } }),
    approve: (withdrawalId: string) => apiClient.post('/admin/approve-withdrawal', { withdrawalId }),
    reject: (withdrawalId: string, reason: string) => apiClient.post('/admin/reject-withdrawal', { withdrawalId, reason }),
  },
  content: {
    generateQuestions: (categoryId: string, count: number, difficulty: string) => apiClient.post('/admin/generate-questions', { categoryId, count, difficulty }),
    getFlagged: (page = 1) => apiClient.get('/admin/flagged-questions', { params: { page } }),
    moderate: (questionId: string, approve: boolean) => apiClient.post('/admin/moderate-question', { questionId, approve }),
  },
  analytics: {
    getDashboard: () => apiClient.get('/admin/analytics'),
  },
  fraud: {
    getAlerts: (page = 1) => apiClient.get('/admin/fraud-alerts', { params: { page } }),
    resolve: (alertId: string, action: string) => apiClient.post('/admin/resolve-fraud', { alertId, action }),
  },
};
