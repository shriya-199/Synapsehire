import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { analyticsApi } from './analyticsApi';
import { getApiErrorMessage } from '../../lib/apiClient';

const initialState = {
  filters: {
    from: '',
    to: '',
    status: '',
    search: ''
  },
  overview: null,
  funnel: [],
  performance: [],
  skills: [],
  reports: [],
  candidate: null,
  admin: null,
  status: 'idle',
  error: null
};

const request = async (fn, rejectWithValue) => {
  try {
    const response = await fn();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
};

export const loadRecruiterAnalytics = createAsyncThunk('analytics/recruiter', async (filters, { rejectWithValue }) => {
  try {
    const [overview, funnel, performance, skills, reports] = await Promise.all([
      analyticsApi.overview(filters),
      analyticsApi.funnel(filters),
      analyticsApi.performance(filters),
      analyticsApi.skills(filters),
      analyticsApi.reports(filters)
    ]);

    return {
      overview: overview.data.data,
      funnel: funnel.data.data,
      performance: performance.data.data,
      skills: skills.data.data,
      reports: reports.data.data
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const loadCandidateAnalytics = createAsyncThunk('analytics/candidate', (_payload, { rejectWithValue }) =>
  request(() => analyticsApi.candidate(), rejectWithValue)
);

export const loadAdminControls = createAsyncThunk('analytics/admin', (_payload, { rejectWithValue }) =>
  request(() => analyticsApi.admin(), rejectWithValue)
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setAnalyticsFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading';
      state.error = null;
    };
    const rejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to load analytics';
    };

    builder
      .addCase(loadRecruiterAnalytics.pending, pending)
      .addCase(loadRecruiterAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        Object.assign(state, action.payload);
      })
      .addCase(loadRecruiterAnalytics.rejected, rejected)
      .addCase(loadCandidateAnalytics.pending, pending)
      .addCase(loadCandidateAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.candidate = action.payload;
      })
      .addCase(loadCandidateAnalytics.rejected, rejected)
      .addCase(loadAdminControls.fulfilled, (state, action) => {
        state.admin = action.payload;
      });
  }
});

export const { setAnalyticsFilters } = analyticsSlice.actions;
export default analyticsSlice.reducer;
