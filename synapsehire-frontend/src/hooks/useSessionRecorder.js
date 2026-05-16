import { useEffect, useRef, useState } from 'react';
import { monitoringApi } from '../features/monitoring/monitoringApi';

export function useSessionRecorder({ interviewId, stream, enabled }) {
  const recorderRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!enabled || !stream || !window.MediaRecorder) return undefined;

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = async (event) => {
      if (!event.data?.size) return;
      const chunkIndex = chunkIndexRef.current;
      chunkIndexRef.current += 1;
      await monitoringApi.uploadChunk({ interviewId, chunkIndex, chunk: event.data });
    };

    recorder.onstart = () => setRecording(true);
    recorder.onstop = async () => {
      setRecording(false);
      await monitoringApi.completeRecording(interviewId);
    };

    recorder.start(10000);

    return () => {
      if (recorder.state !== 'inactive') recorder.stop();
    };
  }, [enabled, interviewId, stream]);

  return { recording };
}
