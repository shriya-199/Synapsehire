import { apiClient } from '../../lib/apiClient';

export const interviewApi = {
  runCode: (payload) => apiClient.post('/code/run', payload),
  listRuns: (interviewId) => apiClient.get(`/code/interviews/${interviewId}/runs`)
};
