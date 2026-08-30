'use client';

interface SignalCardProps {
  title: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
}

export function SignalCard({ title, value, status, description }: SignalCardProps) {
  const getStatusColor = () => {
    if (status === 'healthy') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (status === 'warning') return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${getStatusColor()}`}>
            {status}
          </span>
        </div>
        <p className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">{value}</p>
      </div>
      <p className="text-[11px] text-slate-400 mt-2">{description}</p>
    </div>
  );
}
