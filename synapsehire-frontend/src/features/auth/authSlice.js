import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import { getApiErrorMessage } from '../../lib/apiClient';

const initialState = {
  user: null,
  accessToken: null,
  status: 'idle',
  bootstrapped: false,
  error: null,
  sessions: []
};

const withError = async (fn, rejectWithValue) => {
  try {
    const response = await fn();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
};

export const signupCandidate = createAsyncThunk('auth/signupCandidate', (payload, { rejectWithValue }) =>
  withError(() => authApi.candidateSignup(payload), rejectWithValue)
);

export const signupRecruiter = createAsyncThunk('auth/signupRecruiter', (payload, { rejectWithValue }) =>
  withError(() => authApi.recruiterSignup(payload), rejectWithValue)
);

export const login = createAsyncThunk('auth/login', (payload, { rejectWithValue }) =>
  withError(() => authApi.login(payload), rejectWithValue)
);

export const googleLogin = createAsyncThunk('auth/google', (payload, { rejectWithValue }) =>
  withError(() => authApi.google(payload), rejectWithValue)
);

export const loadMe = createAsyncThunk('auth/me', (_payload, { rejectWithValue }) =>
  withError(() => authApi.me(), rejectWithValue)
);

export const bootstrapSession = createAsyncThunk('auth/bootstrapSession', (_payload, { rejectWithValue }) =>
  withError(() => authApi.me(), rejectWithValue)
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

export const fetchSessions = createAsyncThunk('auth/sessions', (_payload, { rejectWithValue }) =>
  withError(() => authApi.sessions(), rejectWithValue)
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.sessions = [];
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading';
      state.error = null;
    };

    const rejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Request failed';
      state.bootstrapped = true;
    };

    const authFulfilled = (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken || state.accessToken;
      state.bootstrapped = true;
      state.error = null;
    };

    builder
      .addCase(signupCandidate.pending, pending)
      .addCase(signupCandidate.fulfilled, authFulfilled)
      .addCase(signupCandidate.rejected, rejected)
      .addCase(signupRecruiter.pending, pending)
      .addCase(signupRecruiter.fulfilled, authFulfilled)
      .addCase(signupRecruiter.rejected, rejected)
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, authFulfilled)
      .addCase(login.rejected, rejected)
      .addCase(googleLogin.pending, pending)
      .addCase(googleLogin.fulfilled, authFulfilled)
      .addCase(googleLogin.rejected, rejected)
      .addCase(loadMe.pending, pending)
      .addCase(loadMe.fulfilled, authFulfilled)
      .addCase(loadMe.rejected, rejected)
      .addCase(bootstrapSession.pending, pending)
      .addCase(bootstrapSession.fulfilled, authFulfilled)
      .addCase(bootstrapSession.rejected, (state) => {
        state.status = 'idle';
        state.bootstrapped = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.sessions = [];
        state.status = 'idle';
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessions = action.payload.sessions;
      });
  }
});

export const { setAccessToken, clearAuth, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
