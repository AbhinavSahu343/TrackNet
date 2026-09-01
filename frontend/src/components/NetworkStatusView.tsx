'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  Bell,
  GitBranch,
  MapPin,
  RadioTower,
  Settings,
  Train,
  UserCircle,
} from 'lucide-react';
import { AppShell } from './AppShell';
import { useLiveTelemetry, type NetworkMetrics } from '../hooks/useLiveTelemetry';

const PROVIDERS = ['Jio', 'Airtel', 'Vi'] as const;

function strengthToDbm(strength: number) {
  return Math.round(-110 + (Math.min(100, Math.max(0, strength)) / 100) * 52);
}

function Sparkline({ color, seed }: { color: string; seed: number }) {
  const bars = Array.from({ length: 12 }, (_, i) => 28 + ((seed * (i + 3) * 17) % 48));
  return (
    <div className="mt-2 flex h-7 items-end gap-[3px]">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[5px] rounded-sm"
          style={{ height: `${h}%`, backgroundColor: color, opacity: 0.35 + (i / bars.length) * 0.65 }}
        />
      ))}
    </div>
  );
}

function SignalBars({ strength }: { strength: number }) {
  const filled = Math.max(1, Math.round((strength / 100) * 4));
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          className={`w-[4px] rounded-sm ${bar <= filled ? 'bg-emerald-400' : 'bg-slate-700'}`}
          style={{ height: `${7 + bar * 3}px` }}
        />
      ))}
    </div>
  );
}

function networkStatusLabel(name: string, recommended: string, metrics?: NetworkMetrics) {
  if (name === recommended) return { label: 'Connected', color: 'bg-emerald-400', text: 'text-emerald-400' };
  if ((metrics?.signal_strength ?? 0) < 35) return { label: 'Weak Signal', color: 'bg-rose-400', text: 'text-rose-400' };
  return { label: 'Available', color: 'bg-slate-200', text: 'text-slate-300' };
}

const EVENTS = [
  { time: '08:00', label: 'Jio 4G Linked', color: 'bg-emerald-400' },
  { time: '11:30', label: 'Signal Drop', color: 'bg-rose-400' },
  { time: '11:32', label: 'Switched to Airtel', color: 'bg-sky-400' },
  { time: '13:15', label: 'Weak Signal Alert', color: 'bg-cyan-400' },
];

export function NetworkStatusView() {
  const { data: telemetry, status: liveStatus } = useLiveTelemetry();
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const connected = liveStatus === 'connected';
  const recommended = (PROVIDERS.includes(telemetry?.recommendation?.recommended_network as (typeof PROVIDERS)[number])
    ? telemetry?.recommendation?.recommended_network
    : 'Jio') as (typeof PROVIDERS)[number];
  const primary = telemetry?.networks?.[recommended];

  const download = primary?.download_speed_mbps?.toFixed(1) ?? '42.6';
  const upload = primary?.upload_speed_mbps?.toFixed(1) ?? '12.8';
  const latency = primary?.latency_ms ?? 38;
  const dbm = strengthToDbm(primary?.signal_strength ?? 72);
  const packetLoss = primary?.packet_loss_percent ?? 0.02;
  const stability = Math.max(40, Math.min(100, Math.round(100 - packetLoss * 80 - (latency > 80 ? 8 : 0))));

  const avgDownload = telemetry
    ? (
        (telemetry.networks.Jio.download_speed_mbps +
          telemetry.networks.Airtel.download_speed_mbps +
          telemetry.networks.Vi.download_speed_mbps) /
        3
      ).toFixed(1)
    : '38.4';
  const avgUpload = telemetry
    ? (
        (telemetry.networks.Jio.upload_speed_mbps +
          telemetry.networks.Airtel.upload_speed_mbps +
          telemetry.networks.Vi.upload_speed_mbps) /
        3
      ).toFixed(1)
    : '14.2';

  const updatedAgo = useMemo(() => {
    if (!telemetry?.timestamp) return 12;
    return Math.max(0, Math.round((now - new Date(telemetry.timestamp).getTime()) / 1000));
  }, [now, telemetry?.timestamp]);

  return (
    <AppShell>
      <main className="px-4 py-6 sm:px-7 lg:px-8 pb-10">
        <div className="mb-6 flex items-center justify-end gap-4 text-slate-400">
          <p className="hidden sm:block text-sm text-slate-400">Vande Bharat Express • 22436</p>
          <Bell className="h-4 w-4" strokeWidth={1.6} />
          <Settings className="h-4 w-4" strokeWidth={1.6} />
          <span className="h-8 w-8 rounded-full border-2 border-sky-400/80 bg-slate-700 shadow-[0_0_10px_rgba(56,189,248,0.45)] overflow-hidden">
            <UserCircle className="h-full w-full text-slate-300" strokeWidth={1.4} />
          </span>
        </div>

        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white uppercase">Network Status</h1>
            <p className="mt-2 text-sm text-slate-400">Real-time connectivity monitoring throughout your journey.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Train className="h-3.5 w-3.5" strokeWidth={1.6} />
                Vande Bharat Express • 22436
              </span>
              <span className="h-4 w-px bg-slate-700" />
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.6} />
                New Delhi → Varanasi
              </span>
            </div>
          </div>
          <div className={`rounded-xl border px-4 py-2.5 ${connected ? 'border-emerald-900/70 bg-emerald-950/40' : 'border-rose-900/70 bg-rose-950/40'}`}>
            <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${connected ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {connected ? 'Connected' : 'Disconnected'}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Updated {updatedAgo}s ago</p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <section className="rounded-2xl border border-slate-800 bg-[#0d1117] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <RadioTower className="mt-1 h-6 w-6 text-slate-300" strokeWidth={1.6} />
                  <div>
                    <p className="text-2xl font-bold text-white">{recommended} 4G LTE</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Primary Uplink Active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <SignalBars strength={primary?.signal_strength ?? 80} />
                  <span className="text-sm font-semibold">{dbm} dBm</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Download</p>
                  <p className="mt-1 text-xl font-bold text-white">{download} Mbps</p>
                  <Sparkline color="#3b82f6" seed={Number(download) || 42} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Upload</p>
                  <p className="mt-1 text-xl font-bold text-white">{upload} Mbps</p>
                  <Sparkline color="#22d3ee" seed={Number(upload) || 12} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Latency</p>
                  <p className="mt-1 text-xl font-bold text-emerald-400">{latency} ms</p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                    <ArrowDown className="h-3 w-3" /> Improved
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Uptime</p>
                  <p className="mt-1 text-xl font-bold text-white">{connected ? '98.7' : '—'} %</p>
                  <p className="mt-2 text-xs text-slate-500">Last 24 hours</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-[#0d1117] p-6">
              <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Event Timeline</p>
              <div className="relative px-2">
                <div className="absolute left-6 right-6 top-[7px] h-px bg-slate-700" />
                <div className="grid grid-cols-4">
                  {EVENTS.map((event) => (
                    <div key={event.time} className="relative flex flex-col items-start">
                      <span className={`relative z-10 h-3.5 w-3.5 rounded-full ${event.color} shadow-[0_0_8px_rgba(255,255,255,0.15)]`} />
                      <p className="mt-3 text-xs font-semibold text-slate-300">{event.time}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{event.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-cyan-700/50 bg-[#0d1117] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <GitBranch className="h-4 w-4 text-cyan-400" />
                  Auto-Switch Enabled
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoSwitch}
                  onClick={() => setAutoSwitch((v) => !v)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${autoSwitch ? 'bg-cyan-400' : 'bg-slate-700'}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-slate-950 transition-transform ${
                      autoSwitch ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <p className="mt-4 text-sm">
                <span className="text-emerald-400">Jio</span>
                <span className="text-slate-500"> → </span>
                <span className="text-white">Airtel</span>
                <span className="text-slate-500"> → </span>
                <span className="text-slate-500">Vi</span>
                <span className="text-slate-500"> → </span>
                <span className="text-rose-400">Offline</span>
              </p>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-[#0d1117] p-5">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Available Networks</p>
              <ul className="space-y-4">
                {PROVIDERS.map((name) => {
                  const metrics = telemetry?.networks?.[name];
                  const status = networkStatusLabel(name, recommended, metrics);
                  const speed = metrics?.download_speed_mbps?.toFixed(1) ?? '—';
                  return (
                    <li key={name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${status.color}`} />
                        <div>
                          <p className="text-sm font-semibold text-white">{name} 4G</p>
                          <p className={`text-[11px] ${status.text}`}>{status.label}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300">{speed === '—' ? '—' : `${speed} Mbps`}</p>
                    </li>
                  );
                })}
              </ul>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-[#0d1117] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Avg Download</p>
                <p className="mt-2 text-lg font-bold text-white">{avgDownload} Mbps</p>
                <p className="mt-1 text-[11px] text-emerald-400">+5% vs yesterday</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0d1117] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Avg Upload</p>
                <p className="mt-2 text-lg font-bold text-white">{avgUpload} Mbps</p>
                <p className="mt-1 text-[11px] text-emerald-400">+2% vs yesterday</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0d1117] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Packet Loss</p>
                <p className="mt-2 text-lg font-bold text-white">{Number(packetLoss).toFixed(2)} %</p>
                <p className="mt-1 text-[11px] text-slate-500">— Stable</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0d1117] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Stability Index</p>
                <p className="mt-2 text-lg font-bold text-white">{stability} / 100</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-cyan-400" style={{ width: `${stability}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
