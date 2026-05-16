import { apiClient } from '../../lib/apiClient';

const toQuery = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
};

export const analyticsApi = {
  overview: (filters) => apiClient.get(`/analytics/overview?${toQuery(filters)}`),
  funnel: (filters) => apiClient.get(`/analytics/funnel?${toQuery(filters)}`),
  performance: (filters) => apiClient.get(`/analytics/performance?${toQuery(filters)}`),
  skills: (filters) => apiClient.get(`/analytics/skills?${toQuery(filters)}`),
  reports: (filters) => apiClient.get(`/analytics/reports?${toQuery(filters)}`),
  candidate: () => apiClient.get('/analytics/candidate'),
  admin: () => apiClient.get('/analytics/admin'),
  exportReportsUrl: (filters) => `${apiClient.defaults.baseURL}/analytics/export/reports.csv?${toQuery(filters)}`
};
