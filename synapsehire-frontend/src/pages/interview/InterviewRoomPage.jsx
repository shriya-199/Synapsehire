import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Camera, Mic, MonitorUp, ShieldAlert, ShieldCheck } from 'lucide-react';
import { InterviewToolbar } from '../../components/interview/InterviewToolbar';
import { ParticipantsBar } from '../../components/interview/ParticipantsBar';
import { InterviewTimer } from '../../components/interview/InterviewTimer';
import { RunOutput } from '../../components/interview/RunOutput';
import { VideoTile } from '../../components/video/VideoTile';
import { useInterviewSocket } from '../../hooks/useInterviewSocket';
import { useVideoMonitoring } from '../../hooks/useVideoMonitoring';
import { useWebRTCInterview } from '../../hooks/useWebRTCInterview';
import {
  applyLocalCodeChange,
  setInterviewError,
  setLanguage,
  setRunResult,
  setSavedAt,
  setTheme
} from '../../features/interview/interviewSlice';
import { interviewApi } from '../../features/interview/interviewApi';
import { getApiErrorMessage } from '../../lib/apiClient';

const editorLanguageMap = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'cpp'
};

export function InterviewRoomPage() {
  const { interviewId } = useParams();
  const dispatch = useDispatch();
  const socketRef = useInterviewSocket(interviewId);
  const editorRef = useRef(null);
  const monitoringVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const interviewLoadedRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);
  const [stdin, setStdin] = useState('');
  const [running, setRunning] = useState(false);
  const [interview, setInterview] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [screenSharing, setScreenSharing] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [recruiterAlerts, setRecruiterAlerts] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const isCandidate = user?.role === 'CANDIDATE';
  const isRecruiter = user?.role && user.role !== 'CANDIDATE';
  const {
    code,
    language,
    version,
    theme,
    connected,
    reconnecting,
    participants,
    typing,
    savedAt,
    runResult,
    error
  } = useSelector((state) => state.interview);

  const currentState = useMemo(() => ({ code, language, version }), [code, language, version]);
  const questions = interview?.assessmentId?.questions || [];
  const selectedQuestion = questions.find((question) => question._id === selectedQuestionId) || questions[0];

  const { remoteStreams, replaceTracks } = useWebRTCInterview({
    interviewId,
    socketRef,
    localStream: isCandidate ? screenStream : null,
    participants,
    currentUserId: user?._id
  });

  useVideoMonitoring({
    interviewId,
    socketRef,
    videoRef: monitoringVideoRef,
    audioStream: cameraStream,
    enabled: Boolean(interviewId && isCandidate)
  });

  const emitTyping = useCallback(
    (isTyping) => {
      socketRef.current?.emit('editor:typing', { interviewId, isTyping });
    },
    [interviewId, socketRef]
  );

  const autosave = useCallback(() => {
    socketRef.current?.emit('editor:autosave', { interviewId }, (response) => {
      if (response?.success) dispatch(setSavedAt(response.savedAt));
    });
  }, [dispatch, interviewId, socketRef]);

  const pushCodeChange = useCallback(
    (nextCode, nextLanguage, nextVersion) => {
      socketRef.current?.emit(
        'editor:change',
        {
          interviewId,
          code: nextCode,
          language: nextLanguage,
          version: nextVersion,
          operationId: `${user?._id || 'user'}-${nextVersion}`
        },
        (response) => {
          if (!response?.success && response?.current) {
            dispatch(applyLocalCodeChange({ code: response.current.code, version: response.current.version }));
          }
        }
      );
    },
    [dispatch, interviewId, socketRef, user?._id]
  );

  const handleChange = (nextCode = '') => {
    const nextVersion = currentState.version + 1;
    dispatch(applyLocalCodeChange({ code: nextCode, version: nextVersion }));
    pushCodeChange(nextCode, currentState.language, nextVersion);
    emitTyping(true);

    window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => emitTyping(false), 900);

    window.clearTimeout(autosaveTimeoutRef.current);
    autosaveTimeoutRef.current = window.setTimeout(autosave, 1200);
  };

  const handleLanguageChange = (nextLanguage) => {
    const nextVersion = version + 1;
    dispatch(setLanguage(nextLanguage));
    socketRef.current?.emit('editor:language-change', {
      interviewId,
      language: nextLanguage,
      code,
      version: nextVersion
    });
  };

  const handleCursorChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    socketRef.current?.emit('editor:cursor', {
      interviewId,
      position: editor.getPosition(),
      selection: editor.getSelection()
    });
  };

  const runCode = async () => {
    setRunning(true);
    dispatch(setInterviewError(null));
    try {
      const response = await interviewApi.runCode({
        interviewId,
        questionId: selectedQuestion?._id,
        language,
        code,
        stdin,
        expectedOutput: selectedQuestion?.testCases?.[0]?.expectedOutput || ''
      });
      dispatch(setRunResult(response.data.data));
    } catch (apiError) {
      dispatch(setInterviewError(getApiErrorMessage(apiError)));
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (interviewLoadedRef.current) return;
    interviewLoadedRef.current = true;
    interviewApi
      .getInterview(interviewId)
      .then((response) => {
        const nextInterview = response.data.data;
        const firstQuestion = nextInterview.assessmentId?.questions?.[0];
        setInterview(nextInterview);
        if (firstQuestion) {
          setSelectedQuestionId(firstQuestion._id);
          if (!code && firstQuestion.starterCode) {
            dispatch(applyLocalCodeChange({ code: firstQuestion.starterCode, version: version + 1 }));
            dispatch(setLanguage(firstQuestion.language || 'javascript'));
          }
        }
      })
      .catch((apiError) => {
        interviewLoadedRef.current = false;
        dispatch(setInterviewError(getApiErrorMessage(apiError)));
      });
  }, [code, dispatch, interviewId, version]);

  const emitMonitoringEvent = useCallback(
    (type, severity = undefined, payload = {}) => {
      socketRef.current?.emit('monitoring:event', { interviewId, type, severity, payload });
    },
    [interviewId, socketRef]
  );

  const enableCameraAndMic = async () => {
    setPermissionError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      cameraStreamRef.current = stream;
      setCameraStream(stream);
      if (monitoringVideoRef.current) monitoringVideoRef.current.srcObject = stream;
      socketRef.current?.emit('video:media-state', {
        interviewId,
        cameraEnabled: true,
        micEnabled: true,
        screenSharing
      });
    } catch (permissionIssue) {
      setPermissionError('Camera or microphone permission was blocked. Please allow it from browser permissions.');
      emitMonitoringEvent('CAMERA_DISABLED', 'HIGH', { reason: permissionIssue?.name || 'permission_denied' });
      emitMonitoringEvent('MIC_DISABLED', 'MEDIUM', { reason: permissionIssue?.name || 'permission_denied' });
    }
  };

  const shareScreen = async () => {
    setPermissionError('');
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
      setScreenSharing(false);
      socketRef.current?.emit('video:media-state', {
        interviewId,
        cameraEnabled: Boolean(cameraStream),
        micEnabled: Boolean(cameraStream),
        screenSharing: false
      });
      emitMonitoringEvent('SCREEN_SHARE_STOPPED', 'HIGH');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = stream;
      setScreenStream(stream);
      setScreenSharing(true);
      replaceTracks(stream);
      stream.getVideoTracks()[0].onended = () => {
        screenStreamRef.current = null;
        setScreenStream(null);
        setScreenSharing(false);
        socketRef.current?.emit('video:media-state', {
          interviewId,
          cameraEnabled: Boolean(cameraStreamRef.current),
          micEnabled: Boolean(cameraStreamRef.current),
          screenSharing: false
        });
        emitMonitoringEvent('SCREEN_SHARE_STOPPED', 'HIGH');
      };
      socketRef.current?.emit('video:media-state', {
        interviewId,
        cameraEnabled: Boolean(cameraStream),
        micEnabled: Boolean(cameraStream),
        screenSharing: true
      });
    } catch (permissionIssue) {
      setPermissionError('Screen share permission was cancelled or blocked.');
      emitMonitoringEvent('SCREEN_SHARE_STOPPED', 'HIGH', { reason: permissionIssue?.name || 'permission_denied' });
    }
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(typingTimeoutRef.current);
      window.clearTimeout(autosaveTimeoutRef.current);
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!isCandidate || !interviewId) return undefined;

    const onCopyPaste = (event) => {
      emitMonitoringEvent('COPY_PASTE', 'MEDIUM', {
        action: event.type,
        at: new Date().toISOString()
      });
    };

    window.addEventListener('copy', onCopyPaste);
    window.addEventListener('paste', onCopyPaste);

    return () => {
      window.removeEventListener('copy', onCopyPaste);
      window.removeEventListener('paste', onCopyPaste);
    };
  }, [emitMonitoringEvent, interviewId, isCandidate]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isRecruiter) return undefined;

    const onAlert = (payload) => {
      setRecruiterAlerts((current) => [payload.alert, ...current].slice(0, 5));
    };

    socket.on('monitoring:flag', onAlert);
    return () => socket.off('monitoring:flag', onAlert);
  }, [connected, isRecruiter, socketRef]);

  return (
    <main className="flex min-h-screen flex-col bg-panel text-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-ink px-5 py-4 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Live coding interview</p>
          <h1 className="mt-1 text-xl font-semibold">Collaborative workspace</h1>
        </div>
        <InterviewTimer durationSeconds={3600} />
      </header>

      <ParticipantsBar participants={participants} typing={typing} />

      <video ref={monitoringVideoRef} autoPlay playsInline muted className="hidden" />

      {isCandidate ? (
        <section className="border-b border-cyan-200 bg-cyan-50 px-4 py-3">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3 text-sm text-cyan-950">
              <ShieldCheck size={18} className="mt-0.5 text-brand" />
              <div>
                <p className="font-semibold">Interview monitoring permissions</p>
                <p className="text-cyan-900/75">Allow camera, microphone, and screen share for the coding round. Monitoring issues notify the recruiter only.</p>
                {permissionError ? <p className="mt-1 text-sm font-medium text-red-700">{permissionError}</p> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={enableCameraAndMic} className="inline-flex items-center gap-2 rounded-[8px] bg-ink px-3 py-2 text-sm font-semibold text-white">
                <Camera size={16} />
                <Mic size={16} />
                {cameraStream ? 'Camera/mic allowed' : 'Allow camera & mic'}
              </button>
              <button type="button" onClick={shareScreen} className="inline-flex items-center gap-2 rounded-[8px] bg-brand px-3 py-2 text-sm font-semibold text-white">
                <MonitorUp size={16} />
                {screenSharing ? 'Stop screen share' : 'Share screen'}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {isRecruiter && recruiterAlerts.length ? (
        <section className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-start gap-2">
              <ShieldAlert size={18} className="mt-0.5" />
              <div>
                <p className="font-semibold">Recruiter alert: {recruiterAlerts[0].message}</p>
                <p className="mt-1 text-red-700">
                  Severity: {recruiterAlerts[0].severity} · Type: {recruiterAlerts[0].type}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {isRecruiter ? (
        <section className="border-b border-slate-200 bg-white px-4 py-3">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Candidate shared screen</p>
                <p className="text-xs text-slate-500">Live screen stream appears here when the candidate clicks Share screen.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${Object.keys(remoteStreams).length ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {Object.keys(remoteStreams).length ? 'Screen live' : 'Waiting for screen'}
              </span>
            </div>
            {Object.keys(remoteStreams).length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(remoteStreams).map(([userId, stream]) => (
                  <VideoTile
                    key={userId}
                    stream={stream}
                    name={`${participants.find((participant) => participant.userId === userId)?.displayName || 'Candidate'} screen`}
                    muted
                    screenSharing
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <InterviewToolbar
        language={language}
        theme={theme}
        connected={connected}
        reconnecting={reconnecting}
        savedAt={savedAt}
        onLanguageChange={handleLanguageChange}
        onThemeChange={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
        onRun={runCode}
        onSave={autosave}
      />

      {error ? (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={17} />
          {error}
        </div>
      ) : null}

      {selectedQuestion ? (
        <section className="border-b border-slate-200 bg-white px-4 py-4">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_380px]">
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Coding problem</p>
                  <h2 className="mt-1 text-xl font-semibold">{selectedQuestion.title}</h2>
                </div>
                {questions.length > 1 ? (
                  <select className="h-10 rounded-[8px] border border-slate-300 px-3 text-sm" value={selectedQuestionId} onChange={(event) => setSelectedQuestionId(event.target.value)}>
                    {questions.map((question) => (
                      <option key={question._id} value={question._id}>{question.title}</option>
                    ))}
                  </select>
                ) : null}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{selectedQuestion.prompt}</p>
            </div>
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold">Visible test cases</p>
              <div className="mt-2 space-y-2">
                {(selectedQuestion.testCases || []).filter((testCase) => !testCase.hidden).map((testCase, index) => (
                  <div key={index} className="rounded-[8px] bg-white p-3 text-xs">
                    <p><span className="font-semibold">Input:</span> {testCase.input || '(empty)'}</p>
                    <p className="mt-1"><span className="font-semibold">Expected:</span> {testCase.expectedOutput || '(empty)'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid min-h-0 flex-1 grid-rows-[1fr_auto]">
        <div className="min-h-[520px]">
          <Editor
            height="100%"
            language={editorLanguageMap[language]}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={code}
            onChange={handleChange}
            onMount={(editor) => {
              editorRef.current = editor;
              editor.onDidChangeCursorPosition(handleCursorChange);
              editor.onDidChangeCursorSelection(handleCursorChange);
            }}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              renderLineHighlight: 'all',
              smoothScrolling: true
            }}
          />
        </div>

        <div className="grid border-t border-slate-200 bg-white lg:grid-cols-[1fr_1.2fr]">
          <div className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
            <label className="text-sm font-semibold text-slate-700" htmlFor="stdin">
              Standard input
            </label>
            <textarea
              id="stdin"
              value={stdin}
              onChange={(event) => setStdin(event.target.value)}
              className="mt-2 h-32 w-full resize-none rounded-[8px] border border-slate-300 p-3 font-mono text-sm outline-none focus:border-brand"
              placeholder="Optional stdin..."
            />
            {running ? <p className="mt-2 text-sm text-brand">Running code...</p> : null}
          </div>
          <RunOutput result={runResult} />
        </div>
      </section>
    </main>
  );
}
