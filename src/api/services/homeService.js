import api from '../axios';

export const homeService = {
  getDashboard: () => api.get('/'),
};
