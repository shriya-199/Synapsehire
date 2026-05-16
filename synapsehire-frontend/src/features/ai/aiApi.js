import { apiClient } from '../../lib/apiClient';

export const aiApi = {
  dashboard: () => apiClient.get('/ai/dashboard'),
  analyzeInterview: (payload) => apiClient.post('/ai/interviews/analyze', payload),
  analyzeAnswer: (payload) => apiClient.post('/ai/answers/analyze', payload),
  resumeJobMatch: (payload) => apiClient.post('/ai/resume-job-match', payload),
  evaluateGithub: (payload) => apiClient.post('/ai/github/evaluate', payload),
  getEvaluation: (id) => apiClient.get(`/ai/evaluations/${id}`)
};
