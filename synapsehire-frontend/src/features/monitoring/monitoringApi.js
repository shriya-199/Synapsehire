import { apiClient } from '../../lib/apiClient';

export const monitoringApi = {
  dashboard: (interviewId) => apiClient.get(`/monitoring/interviews/${interviewId}/dashboard`),
  alerts: (interviewId) => apiClient.get(`/monitoring/interviews/${interviewId}/alerts`),
  acknowledge: (alertId) => apiClient.patch(`/monitoring/alerts/${alertId}/acknowledge`),
  uploadChunk: ({ interviewId, chunkIndex, chunk }) => {
    const formData = new FormData();
    formData.append('interviewId', interviewId);
    formData.append('chunkIndex', String(chunkIndex));
    formData.append('chunk', chunk, `chunk-${chunkIndex}.webm`);
    return apiClient.post('/monitoring/recordings/chunks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  completeRecording: (interviewId) => apiClient.post('/monitoring/recordings/complete', { interviewId }),
  recordings: (interviewId) => apiClient.get(`/monitoring/interviews/${interviewId}/recordings`)
};
