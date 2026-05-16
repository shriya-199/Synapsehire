import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('synapsehire-editor-theme') || 'dark',
  language: 'javascript',
  code: '',
  version: 0,
  savedAt: null,
  connected: false,
  reconnecting: false,
  participants: [],
  cursors: {},
  typing: {},
  runResult: null,
  error: null
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem('synapsehire-editor-theme', action.payload);
    },
    setConnected(state, action) {
      state.connected = action.payload;
      state.reconnecting = false;
    },
    setReconnecting(state, action) {
      state.reconnecting = action.payload;
    },
    hydrateInterview(state, action) {
      state.code = action.payload.editor.code;
      state.language = action.payload.editor.language;
      state.version = action.payload.editor.version;
      state.savedAt = action.payload.editor.savedAt;
      state.participants = action.payload.participants || [];
    },
    applyLocalCodeChange(state, action) {
      state.code = action.payload.code;
      state.version = action.payload.version;
    },
    applyRemoteCodeChange(state, action) {
      if (action.payload.version >= state.version) {
        state.code = action.payload.code;
        state.language = action.payload.language;
        state.version = action.payload.version;
      }
    },
    setLanguage(state, action) {
      state.language = action.payload;
    },
    setSavedAt(state, action) {
      state.savedAt = action.payload;
    },
    setParticipants(state, action) {
      state.participants = action.payload;
    },
    upsertParticipant(state, action) {
      const next = action.payload;
      state.participants = state.participants.filter((item) => item.userId !== next.userId);
      state.participants.push(next);
    },
    removeParticipant(state, action) {
      state.participants = state.participants.filter((item) => item.userId !== action.payload);
    },
    setCursor(state, action) {
      state.cursors[action.payload.userId] = action.payload;
    },
    setTyping(state, action) {
      state.typing[action.payload.userId] = action.payload.isTyping;
    },
    setRunResult(state, action) {
      state.runResult = action.payload;
    },
    setInterviewError(state, action) {
      state.error = action.payload;
    }
  }
});

export const {
  setTheme,
  setConnected,
  setReconnecting,
  hydrateInterview,
  applyLocalCodeChange,
  applyRemoteCodeChange,
  setLanguage,
  setSavedAt,
  setParticipants,
  upsertParticipant,
  removeParticipant,
  setCursor,
  setTyping,
  setRunResult,
  setInterviewError
} = interviewSlice.actions;

export default interviewSlice.reducer;
