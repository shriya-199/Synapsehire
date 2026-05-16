import { Moon, Play, Save, Sun } from 'lucide-react';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' }
];

export function InterviewToolbar({ language, theme, connected, reconnecting, savedAt, onLanguageChange, onThemeChange, onRun, onSave }) {
  return (
    <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="h-10 rounded-[8px] border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-brand"
        >
          {languages.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {reconnecting ? 'Reconnecting' : connected ? 'Live' : 'Offline'}
        </span>
        <span className="text-xs text-slate-500">{savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : 'Not saved yet'}</span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onThemeChange} className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-300 text-slate-700">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button type="button" onClick={onSave} className="flex h-10 items-center gap-2 rounded-[8px] border border-slate-300 px-3 text-sm font-semibold text-slate-700">
          <Save size={17} />
          Save
        </button>
        <button type="button" onClick={onRun} className="flex h-10 items-center gap-2 rounded-[8px] bg-ink px-4 text-sm font-semibold text-white">
          <Play size={17} />
          Run
        </button>
      </div>
    </div>
  );
}
