import { ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-[#eef2f3] px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[8px] bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brand">
                <Sparkles size={20} />
              </div>
              <span className="text-xl font-semibold">SynapseHire</span>
            </div>
            <div className="mt-20 max-w-md">
              <h1 className="text-4xl font-semibold leading-tight">AI-grade hiring workflows for serious engineering teams.</h1>
              <p className="mt-5 text-base leading-7 text-white/72">
                Secure interviews, structured evaluations, candidate analytics, and recruiter controls in one production workflow.
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-white/76">
            {['Secure JWT sessions', 'Role-aware dashboards', 'Verified candidate identity'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-brand" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center p-6 sm:p-10"
        >
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-brand">SynapseHire</p>
              <h2 className="text-3xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
            {children}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
