import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function PerformanceChart({ data }) {
  return (
    <div className="h-80 rounded-[8px] border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-semibold">Performance trend</h2>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="hiringProbability" stroke="#1f7a8c" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="technical" stroke="#bf5f45" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="communication" stroke="#172033" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
