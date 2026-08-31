'use client';

import { Train } from 'lucide-react';
import type { LiveTelemetryData } from '../hooks/useLiveTelemetry';

const STATIONS = [
  { code: 'NDLS', sta: '06:00', ata: '06:00', delay: null as string | null, dim: false },
  { code: 'CNB', sta: '10:15', ata: '10:15', delay: null, dim: false },
  { code: 'PRYJ', sta: '12:45', ata: '—', delay: '+15m DLY', dim: false },
  { code: 'BSB', sta: '14:30', ata: '—', delay: null, dim: true },
];

const TOTAL_KM = 1380;

export function TelemetryRoute({ telemetry }: { telemetry: LiveTelemetryData | null }) {
  const speed = telemetry?.train?.speed_kmph ?? 0;
  const distance = telemetry?.train?.distance_km ?? 0;
  const progress = Math.min(1, Math.max(0.08, distance > 0 ? distance / TOTAL_KM : 0.62));
  const focusIndex = Math.min(STATIONS.length - 1, Math.round(progress * (STATIONS.length - 1)));

  return (
    <section className="rounded-xl border border-slate-800 bg-[#0d1117] p-6">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Active Telemetry Route
          </h2>
          <p className="mt-2 text-sm text-slate-500">Estimated arrival BSB: 14:30 IST</p>
        </div>
        <div className="rounded-md border border-slate-700/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
          Velocity: {Math.round(speed)} km/h
        </div>
      </div>

      <div className="relative px-4 sm:px-8 pt-2 pb-4">
        <div className="relative h-12">
          <div className="absolute left-0 right-0 top-[22px] h-[3px] rounded-full bg-slate-800" />
          <div
            className="absolute left-0 top-[21px] h-[5px] rounded-full bg-[#00e5ff] route-progress-glow"
            style={{ width: `${progress * 100}%` }}
          />

          {STATIONS.map((station, index) => {
            const left = (index / (STATIONS.length - 1)) * 100;
            const reached = index / (STATIONS.length - 1) <= progress;
            const focused = index === 2 || index === focusIndex;
            return (
              <div
                key={station.code}
                className="absolute top-[16px] -translate-x-1/2"
                style={{ left: `${left}%` }}
              >
                {focused ? (
                  <span className="relative flex h-[15px] w-[15px] items-center justify-center">
                    <span className="absolute h-[22px] w-[22px] rounded-full border border-[#00e5ff]/70" />
                    <span className="h-[11px] w-[11px] rounded-full bg-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
                  </span>
                ) : (
                  <span
                    className={`block h-[13px] w-[13px] rounded-full border-2 ${
                      reached
                        ? 'border-[#00e5ff] bg-[#00e5ff]'
                        : 'border-slate-600 bg-[#0d1117]'
                    }`}
                  />
                )}
              </div>
            );
          })}

          <div
            className="absolute top-[-6px] -translate-x-1/2 train-marker-glow"
            style={{ left: `${progress * 100}%` }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#00e5ff] text-[#05070a] shadow-[0_0_18px_rgba(0,229,255,0.55)]">
              <Train className="h-4 w-4" strokeWidth={2.2} />
            </div>
          </div>
        </div>

        <div className="relative mt-4 h-24">
          {STATIONS.map((station, index) => {
            const left = (index / (STATIONS.length - 1)) * 100;
            const muted = station.dim;
            return (
              <div
                key={station.code}
                className="absolute -translate-x-1/2 text-center min-w-[72px]"
                style={{ left: `${left}%` }}
              >
                <p className={`text-sm font-semibold tracking-wide ${muted ? 'text-slate-600' : 'text-white'}`}>
                  {station.code}
                </p>
                <p className={`mt-1 text-[10px] ${muted ? 'text-slate-600' : 'text-slate-500'}`}>
                  STA {station.sta}
                </p>
                <p className={`text-[10px] ${muted ? 'text-slate-600' : 'text-slate-500'}`}>
                  ATA {station.ata}
                </p>
                {station.delay && (
                  <span className="mt-1 inline-block rounded px-1.5 py-[1px] text-[9px] font-semibold tracking-wide text-[#f4b4a8] bg-[#3a221c]">
                    {station.delay}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
