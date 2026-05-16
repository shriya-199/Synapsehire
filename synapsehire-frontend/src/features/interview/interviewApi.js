import { apiClient } from '../../lib/apiClient';

export const interviewApi = {
  getInterview: (interviewId) => apiClient.get(`/interviews/${interviewId}`),
  runCode: (payload) => apiClient.post('/code/run', payload),
  listRuns: (interviewId) => apiClient.get(`/code/interviews/${interviewId}/runs`)
};
