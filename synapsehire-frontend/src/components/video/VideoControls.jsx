import { Mic, MicOff, MonitorUp, MonitorX, Radio, RadioTower, Video, VideoOff } from 'lucide-react';

export function VideoControls({
  cameraEnabled,
  micEnabled,
  screenSharing,
  recording,
  onToggleCamera,
  onToggleMic,
  onShareScreen
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-[8px] border border-slate-200 bg-white p-3 shadow-sm">
      <button type="button" onClick={onToggleCamera} className="flex h-11 items-center gap-2 rounded-[8px] border border-slate-300 px-4 text-sm font-semibold">
        {cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
        Camera
      </button>
      <button type="button" onClick={onToggleMic} className="flex h-11 items-center gap-2 rounded-[8px] border border-slate-300 px-4 text-sm font-semibold">
        {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
        Mic
      </button>
      <button type="button" onClick={onShareScreen} className="flex h-11 items-center gap-2 rounded-[8px] border border-slate-300 px-4 text-sm font-semibold">
        {screenSharing ? <MonitorX size={18} /> : <MonitorUp size={18} />}
        Screen
      </button>
      <span className={`flex h-11 items-center gap-2 rounded-[8px] px-4 text-sm font-semibold ${recording ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
        {recording ? <RadioTower size={18} /> : <Radio size={18} />}
        {recording ? 'Recording' : 'Recorder idle'}
      </span>
    </div>
  );
}
