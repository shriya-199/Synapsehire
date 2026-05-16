import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { InterviewToolbar } from '../../components/interview/InterviewToolbar';
import { ParticipantsBar } from '../../components/interview/ParticipantsBar';
import { InterviewTimer } from '../../components/interview/InterviewTimer';
import { RunOutput } from '../../components/interview/RunOutput';
import { useInterviewSocket } from '../../hooks/useInterviewSocket';
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
  const typingTimeoutRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);
  const [stdin, setStdin] = useState('');
  const [running, setRunning] = useState(false);
  const user = useSelector((state) => state.auth.user);
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
      const response = await interviewApi.runCode({ interviewId, language, code, stdin });
      dispatch(setRunResult(response.data.data));
    } catch (apiError) {
      dispatch(setInterviewError(getApiErrorMessage(apiError)));
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(typingTimeoutRef.current);
      window.clearTimeout(autosaveTimeoutRef.current);
    };
  }, []);

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
