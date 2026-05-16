import { motion } from 'framer-motion';

export function AnalyticsCard({ title, value, caption, icon: Icon, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand/10 text-brand',
    accent: 'bg-accent/10 text-accent',
    ink: 'bg-ink/10 text-ink'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
          {caption ? <p className="mt-2 text-sm text-slate-500">{caption}</p> : null}
        </div>
        {Icon ? (
          <div className={`flex h-11 w-11 items-center justify-center rounded-[8px] ${tones[tone]}`}>
            <Icon size={21} />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
