'use client';

import {
  Bell,
  CircleDot,
  Clock3,
  MapPin,
  Navigation,
  Radio,
  Share2,
  Train,
} from 'lucide-react';

import {
  useLiveTelemetry,
  type LiveTelemetryData,
} from '../hooks/useLiveTelemetry';

const TOTAL_KM = 1380;

/*
 * This route MUST stay synchronized with:
 *
 * backend/simulation/train.py
 *
 * Backend route:
 * Mumbai      0 km
 * Surat      280 km
 * Vadodara   400 km
 * Ratlam     650 km
 * Kota       900 km
 * Delhi     1380 km
 */
const ROUTE = [
  {
    code: 'MMCT',
    name: 'Mumbai',
    shortName: 'Mumbai',
    distance: 0,
    latitude: 19.0760,
    longitude: 72.8777,
  },
  {
    code: 'ST',
    name: 'Surat',
    shortName: 'Surat',
    distance: 280,
    latitude: 21.1702,
    longitude: 72.8311,
  },
  {
    code: 'BRC',
    name: 'Vadodara',
    shortName: 'Vadodara',
    distance: 400,
    latitude: 22.3072,
    longitude: 73.1812,
  },
  {
    code: 'RTM',
    name: 'Ratlam',
    shortName: 'Ratlam',
    distance: 650,
    latitude: 23.3315,
    longitude: 75.0367,
  },
  {
    code: 'KOTA',
    name: 'Kota',
    shortName: 'Kota',
    distance: 900,
    latitude: 25.2138,
    longitude: 75.8648,
  },
  {
    code: 'NDLS',
    name: 'Delhi',
    shortName: 'Delhi',
    distance: 1380,
    latitude: 28.6139,
    longitude: 77.2090,
  },
];

/* -------------------------------------------------------
 * Route calculation
 * ----------------------------------------------------- */

function getRouteState(distanceKm: number) {
  const distance = Math.max(
    0,
    Math.min(TOTAL_KM, Number.isFinite(distanceKm) ? distanceKm : 0)
  );

  if (distance >= TOTAL_KM) {
    return {
      currentStation: ROUTE[ROUTE.length - 1],
      nextStation: null,
      segmentStart: ROUTE[ROUTE.length - 1],
      segmentEnd: ROUTE[ROUTE.length - 1],
      currentIndex: ROUTE.length - 1,
      distanceToNext: 0,
      progress: 100,
      segmentProgress: 1,
      atStation: true,
      finished: true,
    };
  }

  for (let i = 0; i < ROUTE.length - 1; i++) {
    const start = ROUTE[i];
    const end = ROUTE[i + 1];

    if (
      distance >= start.distance &&
      distance < end.distance
    ) {
      const segmentDistance =
        end.distance - start.distance;

      const segmentProgress =
        segmentDistance > 0
          ? (distance - start.distance) / segmentDistance
          : 0;

      const distanceFromStart =
        distance - start.distance;

      /*
       * Treat the train as being "at" a station when it is
       * extremely close to that station.
       */
      const atStation =
        distanceFromStart < 2;

      return {
        currentStation: start,
        nextStation: end,
        segmentStart: start,
        segmentEnd: end,
        currentIndex: i,
        distanceToNext: Math.max(
          0,
          Math.round(end.distance - distance)
        ),
        progress:
          Math.round((distance / TOTAL_KM) * 1000) / 10,
        segmentProgress,
        atStation,
        finished: false,
      };
    }
  }

  return {
    currentStation: ROUTE[0],
    nextStation: ROUTE[1],
    segmentStart: ROUTE[0],
    segmentEnd: ROUTE[1],
    currentIndex: 0,
    distanceToNext: ROUTE[1].distance,
    progress: 0,
    segmentProgress: 0,
    atStation: true,
    finished: false,
  };
}

/* -------------------------------------------------------
 * Formatting helpers
 * ----------------------------------------------------- */

function formatDistance(distance: number) {
  if (!Number.isFinite(distance)) {
    return '0';
  }

  if (distance >= 1000) {
    return Math.round(distance).toLocaleString();
  }

  return Math.round(distance).toString();
}

function formatUpdatedTime(timestamp?: string) {
  if (!timestamp) {
    return 'Waiting for telemetry';
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'Live telemetry';
  }

  return `Updated ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })}`;
}

function getEtaText(
  distanceToNext: number,
  speedKmph: number,
  finished: boolean
) {
  if (finished) {
    return 'Arrived';
  }

  if (
    distanceToNext <= 0 ||
    speedKmph <= 0
  ) {
    return 'Calculating';
  }

  const hours =
    distanceToNext / speedKmph;

  const minutes = Math.max(
    1,
    Math.round(hours * 60)
  );

  if (minutes < 60) {
    return `~${minutes} min`;
  }

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return m > 0
    ? `~${h}h ${m}m`
    : `~${h}h`;
}

/* -------------------------------------------------------
 * Props
 *
 * telemetry / connected are optional so this component can
 * either:
 *
 * 1. Fetch telemetry itself using useLiveTelemetry()
 * 2. Receive telemetry from an existing parent
 * ----------------------------------------------------- */

interface LiveJourneyViewProps {
  telemetry?: LiveTelemetryData | null;
  connected?: boolean;
}

/* -------------------------------------------------------
 * Component
 * ----------------------------------------------------- */

export function LiveJourneyView({
  telemetry: externalTelemetry,
  connected: externalConnected,
}: LiveJourneyViewProps) {
  const {
    data: liveTelemetry,
    status,
  } = useLiveTelemetry();

  /*
   * If the parent passes telemetry, use it.
   * Otherwise use the hook directly.
   */
  const telemetry =
    externalTelemetry ?? liveTelemetry;

  const connected =
    externalConnected ??
    status === 'connected';

  const distance =
    telemetry?.train?.distance_km ?? 0;

  const speed =
    telemetry?.train?.speed_kmph ?? 0;

  const routeState =
    getRouteState(distance);

  const distanceRemaining = Math.max(
    0,
    Math.round(TOTAL_KM - distance)
  );

  const progress = Math.min(
    100,
    Math.max(0, routeState.progress)
  );

  const etaText = getEtaText(
    routeState.distanceToNext,
    speed,
    routeState.finished
  );

  const currentLatitude =
    telemetry?.train?.latitude;

  const currentLongitude =
    telemetry?.train?.longitude;

  const currentLocation =
    routeState.atStation
      ? routeState.currentStation.name
      : `Between ${routeState.segmentStart.name} and ${routeState.segmentEnd.name}`;

  const currentCode =
    routeState.atStation
      ? routeState.currentStation.code
      : `${routeState.segmentStart.code} → ${routeState.segmentEnd.code}`;

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-8 lg:px-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                LIVE JOURNEY
              </h1>

              <span
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                  connected
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-700 bg-slate-900 text-slate-500'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    connected
                      ? 'bg-emerald-400'
                      : 'bg-slate-600'
                  }`}
                />

                {connected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Real-time train location & journey progress
            </p>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              TRAIN
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              22436
            </p>

            <p className="text-sm font-medium text-slate-400">
              Vande Bharat Express
            </p>
          </div>
        </header>

        {/* ==================================================
            STATUS BANNER
        ================================================== */}

        <div className="mb-6 flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-500/[0.05] px-4 py-3">

          <div className="flex items-center gap-3">
            <Radio className="h-4 w-4 text-[#00e5ff]" />

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#00e5ff]">
                {connected
                  ? 'LIVE JOURNEY DATA AVAILABLE'
                  : 'WAITING FOR JOURNEY DATA'}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {connected
                  ? `${formatUpdatedTime(
                      telemetry?.timestamp
                    )} • Cellular network intelligence active`
                  : 'Connect the telemetry gateway to receive live position data'}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600 sm:flex">
            GPS
            <span className="text-[#00e5ff]">
              {currentLatitude !== undefined &&
              currentLongitude !== undefined
                ? 'LOCKED'
                : 'WAITING'}
            </span>
          </div>
        </div>

        {/* ==================================================
            TOP INFORMATION GRID
        ================================================== */}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_1fr_1fr]">

          {/* CURRENT LOCATION */}

          <section className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0b0f14] p-6">

            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              Current Location
            </div>

            <div className="mt-6">
              <h2 className="text-3xl font-black tracking-tight text-[#00e5ff] sm:text-4xl">
                {currentLocation}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {currentCode}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Speed
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {Math.round(speed)} km/h
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Position
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-300">
                  {currentLatitude !== undefined
                    ? `${currentLatitude.toFixed(4)}, ${currentLongitude?.toFixed(4)}`
                    : 'Waiting...'}
                </p>
              </div>

            </div>

            <div className="pointer-events-none absolute -bottom-10 -right-8 opacity-[0.03]">
              <Train className="h-48 w-48" />
            </div>
          </section>

          {/* JOURNEY PROGRESS */}

          <section className="rounded-xl border border-slate-800 bg-[#0b0f14] p-6">

            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Journey Progress
              </p>

              <p className="text-sm font-medium text-slate-500">
                {formatDistance(distance)} km / {TOTAL_KM.toLocaleString()} km
              </p>
            </div>

            <div className="mt-5 flex items-end justify-between">

              <p className="text-5xl font-black tracking-tight text-white">
                {Math.round(progress)}%
              </p>

              <p className="text-right text-xs uppercase tracking-[0.15em] text-slate-600">
                {routeState.finished
                  ? 'Journey Complete'
                  : 'In Transit'}
              </p>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-[#00e5ff] transition-all duration-700"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Distance Travelled
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {formatDistance(distance)} km
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Remaining
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {formatDistance(distanceRemaining)} km
                </p>
              </div>

            </div>
          </section>

          {/* VECTOR NAVIGATION */}

          <section className="rounded-xl border border-slate-800 bg-[#0b0f14] p-6">

            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Vector Nav Link
              </p>

              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#00e5ff]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff]" />
                Active
              </span>
            </div>

            <div className="relative mt-5 h-[150px] overflow-hidden rounded-lg border border-slate-800 bg-[#080c11]">

              {/* Grid */}

              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Route line */}

              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 400 150"
                preserveAspectRatio="none"
              >
                <path
                  d="M 55 120 C 105 100, 100 65, 155 70 C 210 75, 190 35, 245 45 C 295 55, 290 20, 350 25"
                  fill="none"
                  stroke="#0e7490"
                  strokeWidth="2"
                />

                <path
                  d="M 55 120 C 105 100, 100 65, 155 70 C 210 75, 190 35, 245 45 C 295 55, 290 20, 350 25"
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="2"
                  strokeDasharray="7 7"
                  pathLength="100"
                  strokeDashoffset={`${100 - progress}`}
                />
              </svg>

              {/* Current train position */}

              <div
                className="absolute"
                style={{
                  left: `${Math.max(
                    8,
                    Math.min(92, progress)
                  )}%`,
                  top: `${55 - Math.sin(
                    (progress / 100) * Math.PI * 2
                  ) * 20}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#00e5ff] text-[#05070a] shadow-[0_0_20px_rgba(0,229,255,0.6)]">
                  <Navigation className="h-4 w-4" />
                </div>
              </div>

              {/* Coordinates */}

              <div className="absolute bottom-2 left-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                {currentLatitude !== undefined
                  ? `${currentLatitude.toFixed(4)}, ${currentLongitude?.toFixed(4)}`
                  : 'GPS WAITING'}
              </div>

              <div className="absolute right-3 top-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                MUMBAI → DELHI
              </div>
            </div>
          </section>
        </div>

        {/* ==================================================
            METRIC CARDS
        ================================================== */}

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <MetricCard
            label="Speed"
            value={`${Math.round(speed)} km/h`}
            icon={<Navigation className="h-4 w-4" />}
          />

          <MetricCard
            label="Distance Rem."
            value={`${formatDistance(distanceRemaining)} km`}
            icon={<MapPin className="h-4 w-4" />}
          />

          <MetricCard
            label="Next Station ETA"
            value={etaText}
            icon={<Clock3 className="h-4 w-4" />}
          />

          <MetricCard
            label="System Health"
            value={connected ? 'Nominal' : 'Offline'}
            icon={<Radio className="h-4 w-4" />}
          />
        </div>

        {/* ==================================================
            ROUTE + NEXT STATION
        ================================================== */}

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">

          {/* ROUTE TIMELINE */}

          <section className="rounded-xl border border-slate-800 bg-[#0b0f14] p-6">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Route Timeline
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Mumbai → Delhi • {TOTAL_KM.toLocaleString()} km
                </p>
              </div>

              <Train className="h-5 w-5 text-slate-700" />
            </div>

            <div className="mt-8 space-y-0">

              {ROUTE.map((station, index) => {
                const reached =
                  distance >= station.distance;

                const isCurrent =
                  index === routeState.currentIndex;

                const isDestination =
                  index === ROUTE.length - 1;

                return (
                  <div
                    key={station.code}
                    className="relative flex min-h-[76px] gap-4"
                  >

                    {/* Vertical line */}

                    {!isDestination && (
                      <div
                        className={`absolute left-[7px] top-4 h-[76px] w-px ${
                          distance >= ROUTE[index + 1].distance
                            ? 'bg-[#00e5ff]'
                            : 'bg-slate-800'
                        }`}
                      />
                    )}

                    {/* Station dot */}

                    <div className="relative z-10 pt-1">

                      {isCurrent ? (
                        <div className="relative flex h-4 w-4 items-center justify-center">
                          <div className="absolute h-7 w-7 rounded-full border border-[#00e5ff]/30" />

                          <div className="h-3 w-3 rounded-full bg-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.8)]" />
                        </div>
                      ) : (
                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            reached
                              ? 'border-[#00e5ff] bg-[#00e5ff]'
                              : 'border-slate-700 bg-[#0b0f14]'
                          }`}
                        />
                      )}

                    </div>

                    {/* Station information */}

                    <div className="flex-1 pb-5">

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <p
                            className={`text-sm font-bold ${
                              isCurrent
                                ? 'text-[#00e5ff]'
                                : reached
                                  ? 'text-slate-200'
                                  : 'text-slate-600'
                            }`}
                          >
                            {station.name}

                            <span className="ml-2 text-xs font-medium text-slate-600">
                              ({station.code})
                            </span>
                          </p>

                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                            {station.distance.toLocaleString()} km
                          </p>
                        </div>

                        <span
                          className={`text-[9px] font-bold uppercase tracking-[0.14em] ${
                            isCurrent
                              ? 'text-[#00e5ff]'
                              : reached
                                ? 'text-slate-500'
                                : 'text-slate-700'
                          }`}
                        >
                          {isCurrent
                            ? 'CURRENT'
                            : reached
                              ? 'PASSED'
                              : 'UPCOMING'}
                        </span>

                      </div>

                      {isCurrent && !routeState.finished && (
                        <p className="mt-2 text-[10px] font-medium text-slate-500">
                          {routeState.atStation
                            ? `Train is at ${station.name}`
                            : `Train is travelling toward ${routeState.segmentEnd.name}`}
                        </p>
                      )}

                    </div>
                  </div>
                );
              })}

            </div>
          </section>

          {/* NEXT STATION */}

          <section className="rounded-xl border border-slate-800 bg-[#0b0f14] p-6">

            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00e5ff]">
              <CircleDot className="h-3.5 w-3.5" />

              {routeState.finished
                ? 'Destination'
                : `Next Station (${routeState.distanceToNext} KM)`}
            </div>

            <div className="mt-6">

              <h2 className="text-4xl font-black tracking-tight text-white">
                {routeState.finished
                  ? 'Delhi'
                  : routeState.nextStation?.name}
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {routeState.finished
                  ? 'NDLS'
                  : routeState.nextStation?.code}
              </p>
            </div>

            {/* NEXT STATION DETAILS */}

            <div className="mt-8 grid grid-cols-2 gap-6">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Distance
                </p>

                <p className="mt-1 text-xl font-bold text-white">
                  {routeState.finished
                    ? '0 km'
                    : `${formatDistance(
                        routeState.distanceToNext
                      )} km`}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Estimated
                </p>

                <p className="mt-1 text-xl font-bold text-white">
                  {etaText}
                </p>
              </div>

            </div>

            {/* SEGMENT PROGRESS */}

            {!routeState.finished && (
              <div className="mt-8">

                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                    Segment Progress
                  </span>

                  <span className="text-[9px] font-semibold text-slate-500">
                    {Math.round(
                      routeState.segmentProgress * 100
                    )}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-[#00e5ff] transition-all duration-700"
                    style={{
                      width: `${
                        routeState.segmentProgress * 100
                      }%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  <span>
                    {routeState.segmentStart.name}
                  </span>

                  <span>
                    {routeState.segmentEnd.name}
                  </span>
                </div>

              </div>
            )}

            {/* ACTIONS */}

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined') {
                    navigator.clipboard
                      ?.writeText(
                        `TrackNet Live Journey: ${currentLocation} • ${formatDistance(
                          distance
                        )} km / ${TOTAL_KM} km`
                      )
                      .catch(() => {});
                  }
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#00c8eb] px-4 text-sm font-bold text-[#031016] transition hover:bg-[#19d8f5]"
              >
                <Share2 className="h-4 w-4" />
                Share Live Journey
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.alert(
                      routeState.finished
                        ? 'The train has reached Delhi.'
                        : `Destination alarm set for ${routeState.nextStation?.name}.`
                    );
                  }
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-transparent px-4 text-sm font-semibold text-slate-200 transition hover:border-[#00e5ff]/50 hover:text-[#00e5ff]"
              >
                <Bell className="h-4 w-4" />
                Set Destination Alarm
              </button>

            </div>
          </section>
        </div>

        {/* ==================================================
            FULL ROUTE STRIP
        ================================================== */}

        <section className="mt-4 rounded-xl border border-slate-800 bg-[#0b0f14] p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Live Route
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Position calculated from live telemetry distance
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Navigation className="h-3.5 w-3.5 text-[#00e5ff]" />

              {currentLatitude !== undefined &&
              currentLongitude !== undefined
                ? `${currentLatitude.toFixed(
                    4
                  )}, ${currentLongitude.toFixed(4)}`
                : 'GPS waiting'}
            </div>
          </div>

          {/* Route bar */}

          <div className="mt-8 px-2 sm:px-8">

            <div className="relative h-16">

              {/* Background route */}

              <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-slate-800" />

              {/* Completed route */}

              <div
                className="absolute left-0 top-5 h-1 rounded-full bg-[#00e5ff] transition-all duration-700"
                style={{
                  width: `${progress}%`,
                }}
              />

              {/* Stations */}

              {ROUTE.map((station, index) => {

                const stationPosition =
                  (index /
                    (ROUTE.length - 1)) *
                  100;

                const reached =
                  distance >= station.distance;

                const isCurrent =
                  index === routeState.currentIndex;

                return (
                  <div
                    key={station.code}
                    className="absolute top-0 -translate-x-1/2"
                    style={{
                      left: `${stationPosition}%`,
                    }}
                  >

                    <div className="flex justify-center">

                      {isCurrent ? (
                        <div className="relative flex h-11 w-11 items-center justify-center">
                          <div className="absolute h-8 w-8 rounded-full border border-[#00e5ff]/40" />

                          <div className="h-4 w-4 rounded-full bg-[#00e5ff] shadow-[0_0_14px_rgba(0,229,255,0.8)]" />
                        </div>
                      ) : (
                        <div
                          className={`mt-1 h-3 w-3 rounded-full border-2 ${
                            reached
                              ? 'border-[#00e5ff] bg-[#00e5ff]'
                              : 'border-slate-700 bg-[#0b0f14]'
                          }`}
                        />
                      )}

                    </div>

                    <div className="mt-2 min-w-[70px] text-center">

                      <p
                        className={`text-[10px] font-bold uppercase tracking-[0.08em] ${
                          isCurrent
                            ? 'text-[#00e5ff]'
                            : reached
                              ? 'text-slate-300'
                              : 'text-slate-700'
                        }`}
                      >
                        {station.code}
                      </p>

                      <p className="mt-1 text-[8px] font-medium text-slate-600">
                        {station.name}
                      </p>

                    </div>
                  </div>
                );
              })}

              {/* Moving train marker */}

              <div
                className="absolute top-[-2px] -translate-x-1/2 transition-all duration-700"
                style={{
                  left: `${progress}%`,
                }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00e5ff] text-[#031016] shadow-[0_0_18px_rgba(0,229,255,0.55)]">
                  <Train
                    className="h-3.5 w-3.5"
                    strokeWidth={2.4}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==================================================
            DEBUG / TELEMETRY FOOTER
        ================================================== */}

        <div className="mt-5 flex flex-col gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">

          <span>
            TrackNet • Live Telemetry
          </span>

          <span>
            STEP {telemetry?.step ?? '--'}
          </span>

          <span>
            DISTANCE {formatDistance(distance)} / {TOTAL_KM} KM
          </span>

          <span>
            STATUS {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>

        </div>

      </div>
    </main>
  );
}

/* -------------------------------------------------------
 * Metric card
 * ----------------------------------------------------- */

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#0b0f14] p-5">

      <div className="flex items-center justify-between">

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          {label}
        </p>

        <span className="text-slate-700">
          {icon}
        </span>

      </div>

      <p
        className={`mt-3 text-xl font-bold ${
          label === 'System Health'
            ? value === 'Nominal'
              ? 'text-emerald-400'
              : 'text-orange-400'
            : 'text-white'
        }`}
      >
        {value}
      </p>

    </section>
  );
}

export default LiveJourneyView;