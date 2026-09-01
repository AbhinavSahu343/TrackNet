'use client';

import { Train } from 'lucide-react';
import type { LiveTelemetryData } from '../hooks/useLiveTelemetry';

const STATIONS = [
  {
    code: 'MUM',
    name: 'Mumbai',
    distance: 0,
  },
  {
    code: 'ST',
    name: 'Surat',
    distance: 280,
  },
  {
    code: 'BRC',
    name: 'Vadodara',
    distance: 400,
  },
  {
    code: 'RTM',
    name: 'Ratlam',
    distance: 650,
  },
  {
    code: 'KOTA',
    name: 'Kota',
    distance: 900,
  },
  {
    code: 'NDLS',
    name: 'Delhi',
    distance: 1380,
  },
];

const TOTAL_KM = 1380;

function getJourneyLocation(distance: number): string {
  if (distance >= 1380) {
    return 'Delhi';
  }

  if (distance >= 900) {
    return 'Between Kota and Delhi';
  }

  if (distance >= 650) {
    return 'Between Ratlam and Kota';
  }

  if (distance >= 400) {
    return 'Between Vadodara and Ratlam';
  }

  if (distance >= 280) {
    return 'Between Surat and Vadodara';
  }

  return 'Between Mumbai and Surat';
}

export function TelemetryRoute({
  telemetry,
}: {
  telemetry: LiveTelemetryData | null;
}) {
  const speed = telemetry?.train?.speed_kmph ?? 0;
  const distance = telemetry?.train?.distance_km ?? 0;

  // --------------------------------------------------
  // Calculate train progress
  // --------------------------------------------------

  const progress = Math.min(
    1,
    Math.max(
      0,
      distance / TOTAL_KM
    )
  );

  // --------------------------------------------------
  // Determine current station / segment
  // --------------------------------------------------

  let currentIndex = 0;

  for (
    let i = 0;
    i < STATIONS.length - 1;
    i++
  ) {
    if (
      distance >= STATIONS[i].distance &&
      distance <= STATIONS[i + 1].distance
    ) {
      currentIndex = i;
      break;
    }

    if (
      distance >=
      STATIONS[STATIONS.length - 1].distance
    ) {
      currentIndex =
        STATIONS.length - 1;
    }
  }

  const currentStation =
    STATIONS[currentIndex];

  return (
    <section className="rounded-xl border border-slate-800 bg-[#0d1117] p-6">

      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}

      <div className="flex items-start justify-between gap-4 mb-10">

        <div>

          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Active Telemetry Route
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {telemetry?.train?.route ??
              'Mumbai-Delhi'}
          </p>

          <p className="mt-1 text-[11px] text-slate-600">
            Current location:{' '}
            {getJourneyLocation(distance)}
          </p>

        </div>

        <div className="rounded-md border border-slate-700/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
          Velocity: {Math.round(speed)} km/h
        </div>

      </div>

      {/* ------------------------------------------------ */}
      {/* Route */}
      {/* ------------------------------------------------ */}

      <div className="relative px-4 sm:px-8 pt-2 pb-4">

        <div className="relative h-12">

          {/* Base route */}

          <div className="absolute left-0 right-0 top-[22px] h-[3px] rounded-full bg-slate-800" />

          {/* Completed route */}

          <div
            className="absolute left-0 top-[21px] h-[5px] rounded-full bg-[#00e5ff] route-progress-glow"
            style={{
              width: `${progress * 100}%`,
            }}
          />

          {/* Stations */}

          {STATIONS.map(
            (station, index) => {

              const left =
                (station.distance /
                  TOTAL_KM) *
                100;

              const reached =
                distance >=
                station.distance;

              const isCurrent =
                index === currentIndex;

              return (
                <div
                  key={station.code}
                  className="absolute top-[16px] -translate-x-1/2"
                  style={{
                    left: `${left}%`,
                  }}
                >

                  {isCurrent ? (
                    <span className="relative flex h-[15px] w-[15px] items-center justify-center">

                      <span className="absolute h-[22px] w-[22px] rounded-full border border-[#00e5ff]/70" />

                      <span className="h-[11px] w-[11px] rounded-full bg-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.8)]" />

                    </span>
                  ) : (
                    <span
                      className={[
                        'block h-[13px] w-[13px] rounded-full border-2',
                        reached
                          ? 'border-[#00e5ff] bg-[#00e5ff]'
                          : 'border-slate-600 bg-[#0d1117]',
                      ].join(' ')}
                    />
                  )}

                </div>
              );
            }
          )}

          {/* ------------------------------------------------ */}
          {/* Train marker */}
          {/* ------------------------------------------------ */}

          <div
            className="absolute top-[-6px] -translate-x-1/2 train-marker-glow"
            style={{
              left: `${progress * 100}%`,
            }}
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#00e5ff] text-[#05070a] shadow-[0_0_18px_rgba(0,229,255,0.55)]">

              <Train
                className="h-4 w-4"
                strokeWidth={2.2}
              />

            </div>

          </div>

        </div>

        {/* ------------------------------------------------ */}
        {/* Station labels */}
        {/* ------------------------------------------------ */}

        <div className="relative mt-4 h-24">

          {STATIONS.map(
            (station) => {

              const left =
                (station.distance /
                  TOTAL_KM) *
                100;

              const reached =
                distance >=
                station.distance;

              return (
                <div
                  key={station.code}
                  className="absolute -translate-x-1/2 text-center min-w-[72px]"
                  style={{
                    left: `${left}%`,
                  }}
                >

                  <p
                    className={[
                      'text-sm font-semibold tracking-wide',
                      reached
                        ? 'text-white'
                        : 'text-slate-600',
                    ].join(' ')}
                  >
                    {station.code}
                  </p>

                  <p
                    className={[
                      'mt-1 text-[10px]',
                      reached
                        ? 'text-slate-500'
                        : 'text-slate-700',
                    ].join(' ')}
                  >
                    {station.name}
                  </p>

                  <p className="text-[10px] text-slate-600">
                    {station.distance} km
                  </p>

                </div>
              );
            }
          )}

        </div>

      </div>

      {/* ------------------------------------------------ */}
      {/* Current position */}
      {/* ------------------------------------------------ */}

      <div className="mt-4 border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">

        <div>

          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Current Position
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            {telemetry?.train?.location ??
              'Waiting'}
          </p>

        </div>

        <div className="text-right">

          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Distance
          </p>

          <p className="mt-1 text-sm font-semibold text-[#00e5ff]">
            {distance.toFixed(1)} / {TOTAL_KM} km
          </p>

        </div>

      </div>

    </section>
  );
}