import { apiClient } from '../../lib/apiClient';

export const candidateApi = {
  updateProfile: (payload) => apiClient.patch('/users/me', payload),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return apiClient.post('/users/me/resume', formData);
  }
};
