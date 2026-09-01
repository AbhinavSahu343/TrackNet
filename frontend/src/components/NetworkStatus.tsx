'use client';

import type { LiveTelemetryData } from '../hooks/useLiveTelemetry';

const PROVIDERS = ['Jio', 'Airtel', 'Vi'] as const;

function SignalGlyph({ active, strength }: { active: boolean; strength: number }) {
  const filled = Math.max(1, Math.round((strength / 100) * 4));
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          className={`w-[3px] rounded-sm ${
            bar <= filled
              ? active
                ? 'bg-[#00e5ff]'
                : 'bg-slate-500'
              : 'bg-slate-800'
          }`}
          style={{ height: `${6 + bar * 3}px` }}
        />
      ))}
    </div>
  );
}

export function NetworkStatus({
  telemetry,
  connected,
}: {
  telemetry: LiveTelemetryData | null;
  connected: boolean;
}) {
  const recommended = telemetry?.recommendation?.recommended_network || 'Jio';
  const key = (PROVIDERS.includes(recommended as (typeof PROVIDERS)[number])
    ? recommended
    : 'Jio') as (typeof PROVIDERS)[number];
  const active = telemetry?.networks?.[key];

  const download = active?.download_speed_mbps?.toFixed(1) ?? '—';
  const upload = active?.upload_speed_mbps?.toFixed(1) ?? '—';
  const latency = active?.latency_ms ?? '—';

  return (
    <section className="rounded-xl border border-slate-800 bg-[#0d1117] p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Network Status
        </h2>
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00e5ff]">
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-[#00e5ff]' : 'bg-slate-600'}`} />
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
        <div>
          <p className="text-[28px] font-bold text-white tracking-tight">
            {key} 4G
          </p>
          <div className="mt-6 grid grid-cols-3 gap-6 max-w-lg">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Download</p>
              <p className="mt-1 text-lg font-semibold text-[#00e5ff]">
                {download === '—' ? '—' : `${download} Mbps`}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Upload</p>
              <p className="mt-1 text-lg font-semibold text-[#00e5ff]">
                {upload === '—' ? '—' : `${upload} Mbps`}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Latency</p>
              <p className="mt-1 text-lg font-semibold text-[#00e5ff]">
                {latency === '—' ? '—' : `${latency} ms`}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-slate-800/80 lg:pl-8 pt-4 lg:pt-0">
          <div className="grid grid-cols-2 text-[10px] uppercase tracking-[0.16em] text-slate-500 mb-3">
            <span>Provider</span>
            <span className="text-right">Signal</span>
          </div>
          <div className="space-y-3">
            {PROVIDERS.map((name) => {
              const metrics = telemetry?.networks?.[name];
              const isActive = name === key;
              return (
                <div key={name} className="grid grid-cols-2 items-center">
                  <span className={`text-sm ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                    {name}
                  </span>
                  <div className="flex justify-end">
                    <SignalGlyph active={isActive} strength={metrics?.signal_strength ?? 0} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
