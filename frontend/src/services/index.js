import api from './api';

export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const scoreService = {
  getScores: () => api.get('/scores'),
  addScore: (data) => api.post('/scores', data),
  updateScore: (id, data) => api.put(`/scores/${id}`, data),
  deleteScore: (id) => api.delete(`/scores/${id}`),
};

export const subscriptionService = {
  getStatus:     () => api.get('/subscriptions/status'),
  createOrder:   (plan) => api.post('/payments/create-order', { plan }),
  verifyPayment: (data) => api.post('/payments/verify', data),
  cancel:        () => api.post('/subscriptions/cancel'),
  getPayments:   () => api.get('/subscriptions/payments'),
};

export const drawService = {
  getDraws: () => api.get('/draws'),
  getDrawById: (id) => api.get(`/draws/${id}`),
  getMyResults: () => api.get('/draws/my/results'),
  simulate: (data) => api.post('/draws/simulate', data),
  runDraw: (data) => api.post('/draws/run', data),
  publishDraw: (id) => api.post(`/draws/${id}/publish`),
};

export const charityService = {
  getCharities: (params) => api.get('/charities', { params }),
  getCharityById: (id) => api.get(`/charities/${id}`),
  getCategories: () => api.get('/charities/categories'),
  selectCharity: (data) => api.put('/charities/select', data),
};

export const winnerService = {
  getMyWinnings: () => api.get('/winners/my'),
  uploadProof: (id, formData) => api.post(`/winners/${id}/upload-proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAllVerifications: (params) => api.get('/winners', { params }),
  reviewVerification: (id, data) => api.put(`/winners/${id}/review`, data),
  markPaid: (id) => api.put(`/winners/${id}/mark-paid`),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (formData) => api.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getUserScores: (userId) => api.get(`/admin/users/${userId}/scores`),
  updateScore: (id, data) => api.put(`/admin/scores/${id}`, data),
  getCharities: () => api.get('/admin/charities'),
  createCharity: (data) => api.post('/admin/charities', data),
  updateCharity: (id, data) => api.put(`/admin/charities/${id}`, data),
  deleteCharity: (id) => api.delete(`/admin/charities/${id}`),
};
