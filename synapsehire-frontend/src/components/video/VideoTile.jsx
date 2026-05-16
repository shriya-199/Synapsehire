import { Mic, MicOff, MonitorUp, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function VideoTile({ stream, name, muted, cameraEnabled = true, micEnabled = true, screenSharing = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative min-h-52 overflow-hidden rounded-[8px] bg-ink">
      <video ref={ref} autoPlay playsInline muted={muted} className="h-full min-h-52 w-full object-cover" />
      {!cameraEnabled ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white">
          <VideoOff size={36} />
        </div>
      ) : null}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">
        <span>{name}</span>
        {screenSharing ? <MonitorUp size={14} /> : null}
        {micEnabled ? <Mic size={14} /> : <MicOff size={14} />}
        {cameraEnabled ? <Video size={14} /> : <VideoOff size={14} />}
      </div>
    </div>
  );
}
