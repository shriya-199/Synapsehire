import { apiClient } from '../../lib/apiClient';

export const authApi = {
  candidateSignup: (payload) => apiClient.post('/auth/signup/candidate', payload),
  recruiterSignup: (payload) => apiClient.post('/auth/signup/recruiter', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  google: (payload) => apiClient.post('/auth/google', payload),
  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  resendVerification: () => apiClient.post('/auth/resend-verification'),
  resendVerificationByEmail: (email) => apiClient.post('/auth/resend-verification-email', { email }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload),
  requestOtp: (purpose = 'LOGIN') => apiClient.post('/auth/otp/request', { purpose }),
  verifyOtp: (otp) => apiClient.post('/auth/otp/verify', { otp }),
  sessions: () => apiClient.get('/auth/sessions'),
  revokeSession: (sessionId) => apiClient.delete(`/auth/sessions/${sessionId}`),
  revokeAllSessions: () => apiClient.delete('/auth/sessions')
};
