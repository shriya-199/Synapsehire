import { apiClient } from '../../lib/apiClient';

export const recruiterApi = {
  listCandidates: ({ search = '', appliedRole = '' } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (appliedRole) params.set('appliedRole', appliedRole);
    return apiClient.get(`/users/candidates${params.toString() ? `?${params.toString()}` : ''}`);
  },
  listAssessments: () => apiClient.get('/assessments'),
  createAssessment: (payload) => apiClient.post('/assessments', payload),
  listInterviews: () => apiClient.get('/interviews'),
  scheduleInterview: (payload) => apiClient.post('/interviews', payload),
  startInterview: (id) => apiClient.post(`/interviews/${id}/start`),
  endInterview: (id) => apiClient.post(`/interviews/${id}/end`)
};
