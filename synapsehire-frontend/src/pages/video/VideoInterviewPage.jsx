import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Eye, EyeOff, MonitorUp, ShieldAlert, Video } from 'lucide-react';
import { AlertFeed } from '../../components/video/AlertFeed';
import { VideoControls } from '../../components/video/VideoControls';
import { VideoTile } from '../../components/video/VideoTile';
import { useInterviewSocket } from '../../hooks/useInterviewSocket';
import { useSessionRecorder } from '../../hooks/useSessionRecorder';
import { useVideoMonitoring } from '../../hooks/useVideoMonitoring';
import { useWebRTCInterview } from '../../hooks/useWebRTCInterview';

export function VideoInterviewPage() {
  const { interviewId } = useParams();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const socketRef = useInterviewSocket(interviewId);
  const user = useSelector((state) => state.auth.user);
  const participants = useSelector((state) => state.interview.participants);
  const connected = useSelector((state) => state.interview.connected);
  const isCandidate = user?.role === 'CANDIDATE';
  const isInterviewer = user?.role && user.role !== 'CANDIDATE';
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [permissionError, setPermissionError] = useState('');
  const [candidateCanViewInterviewer, setCandidateCanViewInterviewer] = useState(false);

  const cameraShareStream = useMemo(() => {
    if (!localStream) return null;
    if (isInterviewer && !candidateCanViewInterviewer) return null;
    return localStream;
  }, [candidateCanViewInterviewer, isInterviewer, localStream]);

  const combinedCandidateRecordingStream = useMemo(() => {
    if (!isCandidate || !localStream) return null;
    const stream = new MediaStream();
    localStream.getTracks().forEach((track) => stream.addTrack(track));
    screenStream?.getVideoTracks().forEach((track) => stream.addTrack(track));
    return stream;
  }, [isCandidate, localStream, screenStream]);

  const { remoteStreams: cameraStreams } = useWebRTCInterview({
    interviewId,
    socketRef,
    localStream: cameraShareStream,
    participants,
    currentUserId: user?._id,
    channel: 'camera'
  });

  const { remoteStreams: screenStreams } = useWebRTCInterview({
    interviewId,
    socketRef,
    localStream: isCandidate ? screenStream : null,
    participants,
    currentUserId: user?._id,
    channel: 'screen'
  });

  const { recording } = useSessionRecorder({
    interviewId,
    stream: combinedCandidateRecordingStream,
    enabled: Boolean(combinedCandidateRecordingStream)
  });

  useVideoMonitoring({
    interviewId,
    socketRef,
    videoRef: localVideoRef,
    audioStream: localStream,
    enabled: Boolean(localStream && isCandidate)
  });

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      })
      .catch((error) => {
        setCameraEnabled(false);
        setMicEnabled(false);
        setPermissionError('Camera or microphone permission was blocked. Please allow it from browser permissions.');
        if (isCandidate) {
          socketRef.current?.emit('monitoring:event', { interviewId, type: 'CAMERA_DISABLED', severity: 'HIGH', payload: { reason: error?.name } });
          socketRef.current?.emit('monitoring:event', { interviewId, type: 'MIC_DISABLED', severity: 'MEDIUM', payload: { reason: error?.name } });
        }
      });

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [interviewId, isCandidate, socketRef]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isInterviewer) return undefined;
    const onAlert = (payload) => setAlerts((current) => [payload.alert, ...current].slice(0, 100));
    socket.on('monitoring:flag', onAlert);
    return () => socket.off('monitoring:flag', onAlert);
  }, [connected, isInterviewer, socketRef]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isCandidate) return undefined;
    const onVisibility = (payload) => setCandidateCanViewInterviewer(payload.candidateCanViewInterviewer);
    socket.on('video:visibility-control', onVisibility);
    return () => socket.off('video:visibility-control', onVisibility);
  }, [connected, isCandidate, socketRef]);

  const emitMediaState = (next = {}) => {
    socketRef.current?.emit('video:media-state', {
      interviewId,
      cameraEnabled,
      micEnabled,
      screenSharing: Boolean(screenStream),
      ...next
    });
  };

  const toggleCandidateVisibility = () => {
    const next = !candidateCanViewInterviewer;
    setCandidateCanViewInterviewer(next);
    socketRef.current?.emit('video:visibility-control', {
      interviewId,
      candidateCanViewInterviewer: next
    });
  };

  const toggleCamera = () => {
    const next = !cameraEnabled;
    localStream?.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setCameraEnabled(next);
    emitMediaState({ cameraEnabled: next });
    if (!next && isCandidate) socketRef.current?.emit('monitoring:event', { interviewId, type: 'CAMERA_DISABLED' });
  };

  const toggleMic = () => {
    const next = !micEnabled;
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setMicEnabled(next);
    emitMediaState({ micEnabled: next });
    if (!next && isCandidate) socketRef.current?.emit('monitoring:event', { interviewId, type: 'MIC_DISABLED' });
  };

  const shareScreen = async () => {
    setPermissionError('');
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
      emitMediaState({ screenSharing: false });
      if (isCandidate) socketRef.current?.emit('monitoring:event', { interviewId, type: 'SCREEN_SHARE_STOPPED', severity: 'HIGH' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      stream.getVideoTracks()[0].onended = () => {
        screenStreamRef.current = null;
        setScreenStream(null);
        emitMediaState({ screenSharing: false });
        if (isCandidate) socketRef.current?.emit('monitoring:event', { interviewId, type: 'SCREEN_SHARE_STOPPED', severity: 'HIGH' });
      };
      screenStreamRef.current = stream;
      setScreenStream(stream);
      emitMediaState({ screenSharing: true });
    } catch (error) {
      setPermissionError('Screen share permission was cancelled or blocked.');
      if (isCandidate) {
        socketRef.current?.emit('monitoring:event', {
          interviewId,
          type: 'SCREEN_SHARE_STOPPED',
          severity: 'HIGH',
          payload: { reason: error?.name || 'permission_denied' }
        });
      }
    }
  };

  const visibleCameraStreams = isCandidate && !candidateCanViewInterviewer ? {} : cameraStreams;
  const candidateScreenEntries = Object.entries(screenStreams);

  return (
    <main className="min-h-screen bg-[#f4f7f6] p-5 text-ink sm:p-6">
      <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">Live interview</p>
              <h1 className="mt-2 text-3xl font-semibold">Video interview room</h1>
              <p className="mt-2 text-sm text-slate-600">
                {isCandidate
                  ? 'Keep camera, microphone, and screen share active during the interview.'
                  : 'Review candidate video, screen activity, and monitoring alerts in one room.'}
              </p>
            </div>
            {isInterviewer ? (
              <button
                type="button"
                onClick={toggleCandidateVisibility}
                className="inline-flex items-center gap-2 rounded-[8px] bg-ink px-4 py-2 text-sm font-semibold text-white"
              >
                {candidateCanViewInterviewer ? <EyeOff size={16} /> : <Eye size={16} />}
                {candidateCanViewInterviewer ? 'Hide interviewer video from candidate' : 'Show interviewer video to candidate'}
              </button>
            ) : null}
          </div>

          {permissionError ? (
            <div className="flex items-center gap-2 rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <ShieldAlert size={17} />
              {permissionError}
            </div>
          ) : null}

          {isCandidate && !screenStream ? (
            <div className="rounded-[8px] border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Screen share is required for the live interview.</p>
                  <p className="mt-1 text-cyan-900/75">The interviewer sees your shared screen. Monitoring alerts are visible only to the recruiter.</p>
                </div>
                <button type="button" onClick={shareScreen} className="inline-flex items-center gap-2 rounded-[8px] bg-brand px-4 py-2 font-semibold text-white">
                  <MonitorUp size={16} />
                  Share full screen
                </button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="relative min-h-64 overflow-hidden rounded-[8px] bg-ink">
              <video ref={localVideoRef} autoPlay playsInline muted className="h-full min-h-64 w-full object-cover" />
              <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">
                {user?.name || 'You'} (you)
              </div>
            </div>

            {Object.entries(visibleCameraStreams).map(([userId, stream]) => (
              <VideoTile key={userId} stream={stream} name={participants.find((p) => p.userId === userId)?.displayName || 'Participant'} />
            ))}

            {!Object.keys(visibleCameraStreams).length ? (
              <div className="flex min-h-64 items-center justify-center rounded-[8px] border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                {isCandidate && !candidateCanViewInterviewer ? 'The interviewer has not enabled their video for candidate view.' : 'Waiting for the other participant to join.'}
              </div>
            ) : null}
          </div>

          <VideoControls
            cameraEnabled={cameraEnabled}
            micEnabled={micEnabled}
            screenSharing={Boolean(screenStream)}
            recording={recording}
            onToggleCamera={toggleCamera}
            onToggleMic={toggleMic}
            onShareScreen={shareScreen}
            canShareScreen={isCandidate}
          />
        </section>

        <aside className="space-y-5">
          {isInterviewer ? (
            <section className="rounded-[8px] border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Candidate screen</p>
                  <p className="text-xs text-slate-500">Live shared screen appears here during the interview.</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${candidateScreenEntries.length ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {candidateScreenEntries.length ? 'Live' : 'Waiting'}
                </span>
              </div>

              {candidateScreenEntries.length ? (
                <div className="space-y-3">
                  {candidateScreenEntries.map(([userId, stream]) => (
                    <VideoTile
                      key={userId}
                      stream={stream}
                      name={`${participants.find((participant) => participant.userId === userId)?.displayName || 'Candidate'} screen`}
                      muted
                      screenSharing
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-48 items-center justify-center rounded-[8px] border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                  Ask the candidate to click Share full screen.
                </div>
              )}
            </section>
          ) : null}

          {isInterviewer ? <AlertFeed alerts={alerts} /> : null}

          {isCandidate ? (
            <section className="rounded-[8px] border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <div className="mb-2 flex items-center gap-2 font-semibold text-ink">
                <Video size={16} />
                Interview visibility
              </div>
              <p>
                {candidateCanViewInterviewer
                  ? 'The interviewer has enabled their video for you.'
                  : 'The interviewer video is currently hidden. Your camera and shared screen remain visible to the interviewer.'}
              </p>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
