import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  applyRemoteCodeChange,
  hydrateInterview,
  removeParticipant,
  setConnected,
  setCursor,
  setInterviewError,
  setReconnecting,
  setRunResult,
  setSavedAt,
  setTyping,
  upsertParticipant
} from '../features/interview/interviewSlice';
import { createInterviewSocket } from '../lib/socketClient';

export function useInterviewSocket(interviewId) {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!accessToken || !interviewId) return undefined;

    const socket = createInterviewSocket(accessToken);
    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit('interview:join', { interviewId, displayName: user?.name }, (response) => {
        if (!response?.success) {
          dispatch(setInterviewError(response?.message || 'Unable to join interview room'));
          return;
        }
        dispatch(hydrateInterview(response.state));
      });
    };

    socket.on('connect', () => {
      dispatch(setConnected(true));
      joinRoom();
    });

    socket.on('disconnect', () => {
      dispatch(setConnected(false));
    });

    socket.io.on('reconnect_attempt', () => {
      dispatch(setReconnecting(true));
    });

    socket.io.on('reconnect', joinRoom);

    socket.on('interview:state', (state) => dispatch(hydrateInterview(state)));
    socket.on('editor:change', (payload) => dispatch(applyRemoteCodeChange(payload)));
    socket.on('editor:sync-required', (payload) => dispatch(applyRemoteCodeChange(payload)));
    socket.on('editor:cursor', (payload) => dispatch(setCursor(payload)));
    socket.on('editor:typing', (payload) => dispatch(setTyping(payload)));
    socket.on('editor:saved', (payload) => dispatch(setSavedAt(payload.savedAt)));
    socket.on('code:run-result', (payload) => dispatch(setRunResult(payload.run)));
    socket.on('interview:presence', (payload) => {
      if (payload.status === 'joined') dispatch(upsertParticipant(payload.participant));
      if (payload.status === 'left') dispatch(removeParticipant(payload.userId));
    });
    socket.on('error', (payload) => dispatch(setInterviewError(payload.message)));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, dispatch, interviewId, user?.name]);

  return socketRef;
}
