import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Eye,
  Github,
  LineChart,
  LockKeyhole,
  Play,
  Radar,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Video
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const signalData = [
  { name: 'Resume', value: 64 },
  { name: 'GitHub', value: 78 },
  { name: 'Coding', value: 91 },
  { name: 'Comms', value: 86 },
  { name: 'Integrity', value: 96 }
];

const trendData = [
  { day: 'Mon', signal: 62, quality: 58 },
  { day: 'Tue', signal: 68, quality: 64 },
  { day: 'Wed', signal: 72, quality: 71 },
  { day: 'Thu', signal: 81, quality: 76 },
  { day: 'Fri', signal: 88, quality: 84 },
  { day: 'Sat', signal: 93, quality: 89 }
];

const capabilities = [
  {
    icon: BrainCircuit,
    title: 'AI interview intelligence',
    copy: 'Scores technical depth, communication clarity, confidence, and hiring probability from live interview evidence.'
  },
  {
    icon: Code2,
    title: 'Collaborative coding rooms',
    copy: 'Monaco-powered pair programming with live cursors, autosave, execution logs, language controls, and session timelines.'
  },
  {
    icon: Eye,
    title: 'Integrity monitoring',
    copy: 'Detects tab switches, screen events, face anomalies, audio activity, and suspicious interview behavior in real time.'
  },
  {
    icon: LineChart,
    title: 'Recruiter analytics',
    copy: 'Turns interviews into ranked pipelines, funnel trends, skill heatmaps, candidate reports, and exportable decision briefs.'
  }
];

const proof = [
  ['43%', 'faster shortlisting'],
  ['91%', 'signal consistency'],
  ['12k+', 'candidate events scored'],
  ['3.8x', 'more evaluation context']
];

const workflow = [
  ['01', 'Create role-calibrated assessments', 'Recruiters define seniority, skills, prompts, anti-cheat rules, and evaluation rubrics.'],
  ['02', 'Run live simulation interviews', 'Candidates code, speak, share screen, and collaborate in a controlled interview workspace.'],
  ['03', 'Receive evidence-backed ranking', 'SynapseHire converts behavior, code, resume, and GitHub data into actionable hiring signals.']
];

const brands = ['AstraCloud', 'Northstar Labs', 'VectorWorks', 'ZenoCloud', 'HelioStack'];

function MetricPill({ label, value }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function HeroVisual() {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.16),transparent_34%),linear-gradient(135deg,#071014_0%,#111827_42%,#15120e_100%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="absolute right-[5vw] top-32 hidden w-[700px] max-w-[41vw] rounded-[14px] border border-white/10 bg-[#0b1216]/80 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl xl:block 2xl:right-[6.5vw] 2xl:max-w-[42vw]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b4a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f6c455]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-cyan-100/70">Live evaluation stream</div>
        </div>

        <div className="grid grid-cols-[1.08fr_0.92fr] gap-0">
          <div className="border-r border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/50">Candidate room</p>
                <p className="mt-1 text-lg font-semibold text-white">Senior React Engineer</p>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">Recording</span>
            </div>
            <div className="rounded-[10px] border border-white/10 bg-[#05080a] p-4 font-mono text-[12px] leading-6 text-slate-300">
              <p><span className="text-sky-300">function</span> evaluateCandidate(signal) {'{'}</p>
              <p className="pl-4"><span className="text-emerald-300">return</span> signal.codeQuality &gt; 90</p>
              <p className="pl-8">&& signal.communication === <span className="text-[#f6c455]">'clear'</span></p>
              <p className="pl-8">&& signal.integrityScore &gt;= 96;</p>
              <p>{'}'}</p>
            </div>
            <div className="mt-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="signal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis hide domain={[50, 100]} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff' }} />
                  <Area type="monotone" dataKey="signal" stroke="#2dd4bf" strokeWidth={2} fill="url(#signal)" />
                  <Area type="monotone" dataKey="quality" stroke="#fb7185" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5">
            <div className="rounded-[10px] border border-emerald-300/20 bg-emerald-300/10 p-4">
              <div className="flex items-center gap-2 text-emerald-100">
                <Sparkles size={17} />
                <span className="text-sm font-semibold">AI recommendation</span>
              </div>
              <p className="mt-3 text-4xl font-semibold text-white">91%</p>
              <p className="mt-1 text-sm text-emerald-100/70">Strong hire signal with high collaboration confidence.</p>
            </div>
            <div className="mt-4 space-y-3">
              {['No suspicious tab activity', 'Explained tradeoffs clearly', 'Optimized solution complexity'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-cyan-50/80">
                  <CheckCircle2 size={16} className="text-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signalData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis hide domain={[0, 100]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {signalData.map((entry, index) => (
                      <Cell key={entry.name} fill={['#2dd4bf', '#f97316', '#facc15', '#38bdf8', '#a3e635'][index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f7f6] text-[#101820]">
      <section className="relative min-h-[92vh] overflow-hidden text-white">
        <HeroVisual />
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-cyan-300 text-[#061114] shadow-[0_0_40px_rgba(45,212,191,0.34)]">
              <BrainCircuit size={22} />
            </span>
            <span className="text-lg font-semibold tracking-tight">SynapseHire</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-cyan-50/70 md:flex">
            <a href="#platform" className="hover:text-white">Platform</a>
            <a href="#intelligence" className="hover:text-white">Intelligence</a>
            <a href="#security" className="hover:text-white">Security</a>
            <a href="#workflow" className="hover:text-white">Workflow</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden rounded-[8px] px-4 py-2 text-sm font-semibold text-cyan-50/80 hover:text-white sm:inline-flex">
              Sign in
            </Link>
            <Link to="/signup" className="rounded-[8px] bg-white px-4 py-2 text-sm font-semibold text-[#071014] shadow-[0_12px_40px_rgba(255,255,255,0.12)]">
              Request access
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid min-h-[calc(92vh-88px)] max-w-7xl items-center px-5 pb-16 pt-8 sm:px-8 lg:pb-24 xl:grid-cols-[minmax(0,680px)_minmax(520px,1fr)]">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-[680px]">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/[0.06] px-3 py-1.5 text-sm text-cyan-50/80 backdrop-blur">
              <Activity size={15} className="text-cyan-300" />
              AI-native hiring simulations for engineering teams
            </motion.div>
            <motion.h1 variants={fadeUp} className="mt-7 max-w-[680px] text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              SynapseHire
              <span className="block text-cyan-100/75">evaluates engineers like your best staff interviewer.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              Run live coding simulations, video interviews, resume matching, GitHub analysis, integrity monitoring, and AI-generated hiring decisions in one premium recruiter workflow.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="group inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-cyan-300 px-6 text-sm font-semibold text-[#061114] shadow-[0_20px_70px_rgba(45,212,191,0.28)]">
                Start evaluating candidates
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-white/15 bg-white/[0.05] px-6 text-sm font-semibold text-white backdrop-blur">
                <Play size={16} />
                Open product demo
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {proof.map(([value, label]) => (
                <MetricPill key={label} label={label} value={value} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold uppercase tracking-[0.18em] text-slate-400">Built for teams that cannot afford noisy hiring signals</p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 font-semibold text-slate-700">
            {brands.map((brand) => <span key={brand}>{brand}</span>)}
          </div>
        </div>
      </section>

      <section id="platform" className="bg-[#f4f7f6] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} className="max-w-3xl">
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1f7a8c]">One operating system</motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
              Replace fragmented interview tooling with one decision engine.
            </motion.h2>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-[0_18px_70px_rgba(15,23,42,0.06)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#e6f7f5] text-[#0f766e]">
                  <item.icon size={22} />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="intelligence" className="bg-[#101820] px-5 py-24 text-white sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">AI signal graph</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Every hire recommendation is traceable to evidence.</h2>
            <p className="mt-6 text-base leading-8 text-slate-300">
              SynapseHire connects interview transcript, code execution, resume fit, GitHub quality, and monitoring events into a recruiter-ready intelligence layer.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                [Bot, 'Generated feedback'],
                [Github, 'Repository intelligence'],
                [Radar, 'Behavioral monitoring'],
                [ShieldCheck, 'Bias-aware scoring']
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                  <Icon size={18} className="text-cyan-300" />
                  <span className="text-sm font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
            <div className="grid gap-5 md:grid-cols-[1fr_0.82fr]">
              <div className="rounded-[8px] bg-[#071014] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <p className="font-semibold">Hiring probability trend</p>
                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">Live</span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="homeSignal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[50, 100]} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff' }} />
                      <Area type="monotone" dataKey="signal" stroke="#2dd4bf" strokeWidth={3} fill="url(#homeSignal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-[8px] bg-[#f8fafc] p-5 text-[#101820]">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f7a8c]">Decision brief</p>
                <p className="mt-4 text-5xl font-semibold tracking-[-0.04em]">A-</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Excellent code clarity, strong communication, low integrity risk. Follow up on distributed systems depth.</p>
                <div className="mt-6 space-y-3">
                  {['Senior frontend fit', 'Strong collaboration', 'Lean hire recommendation'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="bg-white px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#bf5f45]">Enterprise-grade trust</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Built like a serious product, not a demo.</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600 lg:ml-auto">
              Secure JWT sessions, refresh tokens, role-aware access, encrypted cookies, monitoring audit trails, controlled file uploads, API rate limits, and production deployment artifacts are part of the architecture.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              [LockKeyhole, 'Session security', 'Short-lived access tokens, refresh-token rotation, secure cookies, and role-aware route protection.'],
              [Video, 'Interview evidence', 'Recorded monitoring events, video session signals, and recruiter-visible alerts.'],
              [UsersRound, 'Recruiter control', 'Assessment ownership, organization scoping, dashboard access, and decision exports.']
            ].map(([Icon, title, copy]) => (
              <div key={title} className="rounded-[8px] border border-slate-200 bg-[#f8fafc] p-6">
                <Icon size={24} className="text-[#1f7a8c]" />
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-[#eef3f1] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1f7a8c]">Workflow</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">From role definition to hiring decision in one loop.</h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {workflow.map(([step, title, copy]) => (
              <div key={step} className="rounded-[8px] border border-slate-200 bg-white p-6">
                <span className="text-sm font-semibold text-[#bf5f45]">{step}</span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-[12px] bg-[#101820] p-7 text-white md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Ready for signal-rich hiring?</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Launch SynapseHire and start evaluating with evidence.</h2>
            </div>
            <Link to="/signup" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[8px] bg-cyan-300 px-6 text-sm font-semibold text-[#061114]">
              Create workspace
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
