import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  const isCandidate = user?.role === 'CANDIDATE';
  const isRecruiter = user?.role && user.role !== 'CANDIDATE';
  const participants = useSelector((state) => state.interview.participants);
  const connected = useSelector((state) => state.interview.connected);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  const combinedStream = useMemo(() => {
    if (!localStream) return null;
    const stream = new MediaStream();
    localStream.getTracks().forEach((track) => stream.addTrack(track));
    screenStream?.getVideoTracks().forEach((track) => stream.addTrack(track));
    return stream;
  }, [localStream, screenStream]);

  const { remoteStreams, replaceTracks } = useWebRTCInterview({
    interviewId,
    socketRef,
    localStream,
    participants,
    currentUserId: user?._id
  });

  const { recording } = useSessionRecorder({ interviewId, stream: combinedStream, enabled: Boolean(combinedStream) });

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
      .catch(() => {
        if (isCandidate) {
          socketRef.current?.emit('monitoring:event', { interviewId, type: 'CAMERA_DISABLED', severity: 'HIGH' });
          socketRef.current?.emit('monitoring:event', { interviewId, type: 'MIC_DISABLED', severity: 'MEDIUM' });
        }
      });

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [interviewId, isCandidate, socketRef]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isRecruiter) return undefined;
    const onAlert = (payload) => setAlerts((current) => [payload.alert, ...current].slice(0, 100));
    socket.on('monitoring:flag', onAlert);
    return () => socket.off('monitoring:flag', onAlert);
  }, [connected, isRecruiter, socketRef]);

  const emitMediaState = (next = {}) => {
    socketRef.current?.emit('video:media-state', {
      interviewId,
      cameraEnabled,
      micEnabled,
      screenSharing: Boolean(screenStream),
      ...next
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
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
      emitMediaState({ screenSharing: false });
      if (isCandidate) socketRef.current?.emit('monitoring:event', { interviewId, type: 'SCREEN_SHARE_STOPPED' });
      return;
    }

    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    stream.getVideoTracks()[0].onended = () => {
      screenStreamRef.current = null;
      setScreenStream(null);
      emitMediaState({ screenSharing: false });
      if (isCandidate) socketRef.current?.emit('monitoring:event', { interviewId, type: 'SCREEN_SHARE_STOPPED' });
    };
    screenStreamRef.current = stream;
    setScreenStream(stream);
    replaceTracks(new MediaStream([...localStream.getAudioTracks(), ...stream.getVideoTracks()]));
    emitMediaState({ screenSharing: true });
  };

  return (
    <main className="min-h-screen bg-panel p-6 text-ink">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">Live video interview</p>
            <h1 className="mt-2 text-3xl font-semibold">Candidate monitoring room</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative min-h-52 overflow-hidden rounded-[8px] bg-ink">
              <video ref={localVideoRef} autoPlay playsInline muted className="h-full min-h-52 w-full object-cover" />
              <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">
                {user?.name || 'You'} (you)
              </div>
            </div>
            {Object.entries(remoteStreams).map(([userId, stream]) => (
              <VideoTile key={userId} stream={stream} name={participants.find((p) => p.userId === userId)?.displayName || 'Participant'} />
            ))}
          </div>

          <div className="mt-5">
            <VideoControls
              cameraEnabled={cameraEnabled}
              micEnabled={micEnabled}
              screenSharing={Boolean(screenStream)}
              recording={recording}
              onToggleCamera={toggleCamera}
              onToggleMic={toggleMic}
              onShareScreen={shareScreen}
            />
          </div>
        </section>

        {isRecruiter ? <AlertFeed alerts={alerts} /> : null}
      </div>
    </main>
  );
}
