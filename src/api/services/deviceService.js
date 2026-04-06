import api from '../axios';

export const deviceService = {
  getAll: () => api.get('/devices'),
  getOne: (id) => api.get(`/devices/${id}`),
  getHealth: (id) => api.get(`/devices/${id}/health`),
  update: (id, data) => api.put(`/devices/${id}`, data),
  toggleStatus: async (id, status) => {
    const payloads = [
      { status },
      { isOn: status === 'on' },
      { status, isOn: status === 'on' },
      { active: status === 'on' },
      { status: status === 'on' ? 'active' : 'inactive' },
      { state: status },
    ];

    const url = `/devices/${id}`;
    let lastError = null;

    for (const payload of payloads) {
      try {
        return await api.patch(url, payload);
      } catch (error) {
        lastError = error;
        const statusCode = error?.response?.status;
        if (![400, 404, 405, 422].includes(statusCode)) {
          throw error;
        }
      }
    }

    throw lastError;
  },
  create: (payload) => api.post('/devices', payload),
  delete: (id) => api.delete(`/devices/${id}`),
};
