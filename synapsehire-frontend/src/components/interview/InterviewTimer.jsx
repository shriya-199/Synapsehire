import { Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const formatTime = (seconds) => {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export function InterviewTimer({ startedAt, durationSeconds = 3600 }) {
  const initialRemaining = useMemo(() => {
    if (!startedAt) return durationSeconds;
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return durationSeconds - elapsed;
  }, [durationSeconds, startedAt]);
  const [remaining, setRemaining] = useState(initialRemaining);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-[8px] bg-white px-3 py-2 text-sm font-semibold text-ink shadow-sm">
      <Clock size={17} className="text-brand" />
      {formatTime(remaining)}
    </div>
  );
}
