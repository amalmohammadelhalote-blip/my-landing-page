import api from './axios';

const extractArrayPayload = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  if (typeof payload !== 'object') return [];

  if (Array.isArray(payload?.devices)) return payload.devices;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.docs)) return payload.docs;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;

  const keys = ['devices', 'results', 'docs', 'items', 'data'];
  for (const key of keys) {
    const nested = payload[key];
    const extracted = extractArrayPayload(nested);
    if (extracted.length) return extracted;
  }

  for (const value of Object.values(payload)) {
    const extracted = extractArrayPayload(value);
    if (extracted.length) return extracted;
  }

  return [];
};

export const normalizeListResponse = (response) => {
  const payload = response?.data?.data ?? response?.data;
  return extractArrayPayload(payload);
};


export const deviceService = {
  getAll: () => api.get('/devices'),
  getOne: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
  toggleStatus: (id, status) => api.put(`/devices/${id}/status`, { status }),
  getHealth: (id, period) => api.get(`/devices/${id}/health`, { params: period ? { period } : {} }),
  getRecommendation: (id) => api.get(`/devices/${id}/recommendation`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  getOne: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const homeService = {
  getDashboard: () => api.get('/dashboard'),
};

export const reportsService = {
  getEnergyConsumption: (period) => api.get(`/reports/energy-consumption?period=${period}`),
  getDevicePerformance: (period) => api.get(`/reports/device-performance?period=${period}`),
  getDeviceBreakdown: () => api.get('/reports/device-breakdown'),
};

export const locationService = {
  getAll: () => api.get('/locations'),
  getOne: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
};

export const userService = {
  getAll: () => api.get('/users'),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/profile/change-password', data),
};

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
};


