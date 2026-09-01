'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlarmClock,
  Check,
  List,
  RadioTower,
  Share2,
  Target,
  Train,
} from 'lucide-react';
import { AppShell } from './AppShell';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';

const DISPLAY_TOTAL_KM = 785;
const SIM_TOTAL_KM = 1380;

const STATIONS = [
  { name: 'New Delhi', code: 'NDLS', status: 'passed' as const, meta: 'ATA: 16:48 (On Time)' },
  { name: 'Ghaziabad', code: 'GZB', status: 'passed' as const, meta: 'ATA: 17:15 (+2m)' },
  { name: 'Kanpur Central', code: 'CNB', status: 'current' as const, meta: 'ARRIVED: 18:05 (+7m)' },
  { name: 'Prayagraj', code: 'PRYJ', status: 'upcoming' as const, meta: 'ETA: 18:42' },
  { name: 'Varanasi', code: 'BSB', status: 'upcoming' as const, meta: 'ETA: 22:17' },
];

function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

function VectorNavMap() {
  return (
    <div
      className="relative h-[148px] overflow-hidden rounded-lg border border-slate-800/80"
      style={{
        backgroundImage:
          'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
        backgroundColor: '#070b12',
      }}
    >
      <svg viewBox="0 0 220 150" className="absolute inset-0 h-full w-full" aria-hidden>
        <path
          d="M88 18 C108 16 128 28 134 48 C148 58 156 78 148 98 C158 118 146 132 128 140 C108 148 90 142 74 128 C52 118 48 92 54 70 C50 48 64 24 88 18 Z"
          fill="none"
          stroke="rgba(100,116,139,0.45)"
          strokeWidth="1.2"
        />
        <path
          d="M96 36 C108 52, 122 70, 128 88 C132 102, 126 116, 112 128"
          fill="none"
          stroke="#00d1ff"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="drop-shadow-[0_0_6px_rgba(0,209,255,0.8)]"
        />
        <circle cx="96" cy="36" r="3" fill="#64748b" />
        <circle cx="112" cy="62" r="3" fill="#64748b" />
        <circle cx="128" cy="88" r="4.5" fill="#00d1ff" className="drop-shadow-[0_0_8px_rgba(0,209,255,1)]" />
        <circle cx="122" cy="110" r="3" fill="#334155" />
        <circle cx="112" cy="128" r="3" fill="#334155" />
      </svg>
    </div>
  );
}

export function LiveJourneyView() {
  const { data: telemetry, status: liveStatus } = useLiveTelemetry();
  const [dismissed, setDismissed] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const speed = Math.round(telemetry?.train?.speed_kmph ?? 108);
  const traveled = telemetry
    ? Math.min(DISPLAY_TOTAL_KM, (telemetry.train.distance_km / SIM_TOTAL_KM) * DISPLAY_TOTAL_KM)
    : 438;
  const remaining = Math.max(0, DISPLAY_TOTAL_KM - traveled);
  const pct = Math.round((traveled / DISPLAY_TOTAL_KM) * 100);
  const elapsedH = traveled / Math.max(speed, 1);
  const remainingH = remaining / Math.max(speed, 1);
  const connected = liveStatus === 'connected';

  const updatedAgo = useMemo(() => {
    if (!telemetry?.timestamp) return 12;
    const delta = Math.max(0, Math.round((now - new Date(telemetry.timestamp).getTime()) / 1000));
    return delta;
  }, [now, telemetry?.timestamp]);

  return (
    <AppShell>
      <main className="px-4 py-6 sm:px-7 lg:px-8 pb-10">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-extrabold tracking-tight text-white uppercase leading-none">
              Live Journey
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-400">Real-time train location &amp; journey progress</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                LIVE
              </span>
              <span className="text-[11px] text-slate-500">
                Updated {updatedAgo} second{updatedAgo === 1 ? '' : 's'} ago
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Train 22436</p>
            <p className="mt-1 text-xl font-bold text-white">Vande Bharat Express</p>
          </div>
        </header>

        {!dismissed && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-md border border-cyan-900/40 bg-[#0a1620] px-4 py-2.5">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-400/90">
              <RadioTower className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
              {connected
                ? 'Offline journey data available — Cellular network intelligence active.'
                : 'Offline journey data available — Cellular network intelligence cached.'}
            </p>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-400 hover:text-cyan-200"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <section className="xl:col-span-4 relative overflow-hidden rounded-xl border border-slate-800 bg-[#0d1117] p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Target className="h-3.5 w-3.5" />
              Current Location
            </div>
            <Train className="pointer-events-none absolute -right-3 bottom-2 h-36 w-36 text-slate-800/80" strokeWidth={1} />
            <p className="relative mt-5 text-[32px] font-bold leading-tight text-[#00d1ff]">Kanpur Central</p>
            <p className="relative mt-1 text-lg text-slate-300">(CNB)</p>
            <div className="relative mt-8 flex gap-10 text-[11px] uppercase tracking-[0.14em]">
              <p className="text-slate-400">
                Speed <span className="ml-1 font-semibold text-white">{speed} km/h</span>
              </p>
              <p className="text-slate-400">
                Status <span className="ml-1 font-semibold text-orange-400">+7 min delay</span>
              </p>
            </div>
          </section>

          <section className="xl:col-span-4 rounded-xl border border-slate-800 bg-[#0d1117] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Journey Progress</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="text-4xl font-bold text-white">{pct}%</p>
              <p className="pb-1 text-sm text-slate-500">
                {Math.round(traveled)}km / {DISPLAY_TOTAL_KM}km
              </p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-[#00d1ff] shadow-[0_0_12px_rgba(0,209,255,0.55)]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <p>
                Elapsed: <span className="text-slate-200">{formatDuration(elapsedH)}</span>
              </p>
              <p>
                Remaining: <span className="text-slate-200">{formatDuration(remainingH)}</span>
              </p>
            </div>
          </section>

          <section className="xl:col-span-4 rounded-xl border border-slate-800 bg-[#0d1117] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Vector Nav Link: <span className="text-cyan-400">Active</span>
            </p>
            <div className="mt-4">
              <VectorNavMap />
            </div>
          </section>

          <div className="xl:col-span-12 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            {[
              { label: 'Speed', value: `${speed} km/h`, color: 'text-white' },
              { label: 'Delay', value: '+7 min', color: 'text-orange-400' },
              { label: 'Distance Rem.', value: `${Math.round(remaining)} km`, color: 'text-white' },
              { label: 'Power Src', value: 'Overhead', color: 'text-emerald-400' },
              { label: 'Sys Health', value: connected ? 'Nominal' : 'Degraded', color: connected ? 'text-cyan-400' : 'text-orange-400' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-800 bg-[#0d1117] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
                <p className={`mt-1 text-lg font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <section className="xl:col-span-4 rounded-xl border border-slate-800 bg-[#0d1117] p-5">
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Route Timeline</p>
            <ol className="relative ml-2 space-y-5">
              <span className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-800" />
              {STATIONS.map((station) => (
                <li key={station.code} className="relative flex gap-3 pl-6">
                  <span className="absolute left-0 top-1">
                    {station.status === 'passed' && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-slate-300">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    )}
                    {station.status === 'current' && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-cyan-400 shadow-[0_0_10px_rgba(0,209,255,0.7)]">
                        <span className="h-2 w-2 rounded-full bg-cyan-400" />
                      </span>
                    )}
                    {station.status === 'upcoming' && (
                      <span className="block h-4 w-4 rounded-full border border-slate-600 bg-[#0d1117]" />
                    )}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${station.status === 'current' ? 'text-cyan-400' : station.status === 'upcoming' ? 'text-slate-500' : 'text-slate-300'}`}>
                      {station.name}{' '}
                      <span className={station.status === 'current' ? 'text-cyan-500' : 'text-slate-500'}>({station.code})</span>
                    </p>
                    <p className={`text-[11px] ${station.status === 'current' ? 'text-cyan-500/80' : 'text-slate-500'}`}>
                      {station.meta}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="xl:col-span-4 rounded-xl border border-slate-800 bg-[#0d1117] p-5 border-l-4 border-l-[#00d1ff]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">Next Station (124km)</p>
            <p className="mt-4 text-3xl font-bold text-white">Prayagraj Junction</p>
            <div className="mt-8 flex gap-10 text-[11px] uppercase tracking-[0.14em] text-slate-400">
              <p>
                ETA <span className="ml-1 font-semibold text-white">18:42</span>
              </p>
              <p>
                Platform <span className="ml-1 font-semibold text-white">04</span>
              </p>
            </div>
          </section>

          <section className="xl:col-span-4 flex flex-col gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#00d1ff] py-3.5 text-sm font-bold text-[#041018] hover:bg-cyan-300 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share Live Journey
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/70 bg-transparent py-3.5 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              <AlarmClock className="h-4 w-4" />
              Set Destination Alarm
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-transparent py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800/60 transition-colors"
            >
              <List className="h-4 w-4" />
              View Full Timetable
            </button>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
