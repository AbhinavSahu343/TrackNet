'use client';

interface SignalCardProps {
  title: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
}

export function SignalCard({ title, value, status, description }: SignalCardProps) {
  const getStatusColor = () => {
    if (status === 'healthy') return 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30';
    if (status === 'warning') return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-300 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="bg-[#0d1117] p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em]">{title}</h3>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${getStatusColor()}`}>
            {status}
          </span>
        </div>
        <p className="text-2xl font-extrabold text-white tracking-tight mb-1">{value}</p>
      </div>
      <p className="text-[11px] text-slate-500 mt-2">{description}</p>
    </div>
  );
}
