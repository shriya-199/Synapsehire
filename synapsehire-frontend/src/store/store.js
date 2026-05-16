import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import interviewReducer from '../features/interview/interviewSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    interview: interviewReducer,
    analytics: analyticsReducer
  }
});
