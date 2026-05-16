import { useEffect, useRef } from 'react';

export function useVideoMonitoring({ interviewId, socketRef, videoRef, audioStream, enabled }) {
  const lastFaceAlertRef = useRef(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!enabled || !interviewId) return undefined;

    const onVisibility = () => {
      if (document.hidden) {
        socketRef.current?.emit('monitoring:event', {
          interviewId,
          type: 'TAB_SWITCH',
          payload: { visibilityState: document.visibilityState, at: new Date().toISOString() }
        });
      }
    };

    const onBlur = () => {
      socketRef.current?.emit('monitoring:event', {
        interviewId,
        type: 'TAB_SWITCH',
        payload: { reason: 'window_blur', at: new Date().toISOString() }
      });
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [enabled, interviewId, socketRef]);

  useEffect(() => {
    if (!enabled || !videoRef.current || !('FaceDetector' in window)) return undefined;

    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
    let cancelled = false;

    const detect = async () => {
      if (cancelled || !videoRef.current || videoRef.current.readyState < 2) {
        if (!cancelled) window.setTimeout(detect, 1500);
        return;
      }

      try {
        const faces = await detector.detect(videoRef.current);
        const now = Date.now();
        if (now - lastFaceAlertRef.current > 8000) {
          if (faces.length === 0) {
            lastFaceAlertRef.current = now;
            socketRef.current?.emit('monitoring:event', {
              interviewId,
              type: 'FACE_MISSING',
              payload: { faces: 0 }
            });
          }
          if (faces.length > 1) {
            lastFaceAlertRef.current = now;
            socketRef.current?.emit('monitoring:event', {
              interviewId,
              type: 'MULTIPLE_FACES',
              payload: { faces: faces.length }
            });
          }
        }
      } catch (_error) {
        // FaceDetector may fail while the video element is changing streams.
      }

      if (!cancelled) window.setTimeout(detect, 1500);
    };

    detect();
    return () => {
      cancelled = true;
    };
  }, [enabled, interviewId, socketRef, videoRef]);

  useEffect(() => {
    if (!enabled || !audioStream) return undefined;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return undefined;

    const audioContext = new AudioContextClass();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    let lastAlertAt = 0;

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const average = data.reduce((sum, value) => sum + value, 0) / data.length;
      if (average > 35 && Date.now() - lastAlertAt > 10000) {
        lastAlertAt = Date.now();
        socketRef.current?.emit('monitoring:event', {
          interviewId,
          type: 'AUDIO_ACTIVITY',
          severity: 'INFO',
          payload: { averageVolume: Math.round(average) }
        });
      }
      animationRef.current = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.cancelAnimationFrame(animationRef.current);
      source.disconnect();
      audioContext.close();
    };
  }, [audioStream, enabled, interviewId, socketRef]);
}
