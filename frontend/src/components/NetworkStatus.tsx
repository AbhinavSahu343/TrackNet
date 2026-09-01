'use client';

import type { LiveTelemetryData } from '../hooks/useLiveTelemetry';

const PROVIDERS = ['Jio', 'Airtel', 'Vi'] as const;

type Provider = (typeof PROVIDERS)[number];

function SignalGlyph({
  active,
  strength,
}: {
  active: boolean;
  strength: number;
}) {
  const filled = Math.max(
    1,
    Math.min(4, Math.round((strength / 100) * 4))
  );

  return (
    <div className="flex h-4 items-end gap-[3px]">
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
          style={{
            height: `${6 + bar * 3}px`,
          }}
        />
      ))}
    </div>
  );
}

function RiskBadge({
  probability,
  threshold,
}: {
  probability: number | null;
  threshold: number;
}) {
  if (probability == null) {
    return (
      <span className="text-slate-500">
        —
      </span>
    );
  }

  const percentage = probability * 100;

  if (probability >= threshold) {
    return (
      <span className="font-semibold text-amber-400">
        {percentage.toFixed(1)}%
      </span>
    );
  }

  return (
    <span className="font-semibold text-[#00e5ff]">
      {percentage.toFixed(1)}%
    </span>
  );
}

export function NetworkStatus({
  telemetry,
  connected,
}: {
  telemetry: LiveTelemetryData | null;
  connected: boolean;
}) {
  const recommended =
    telemetry?.recommendation?.recommended_network;

  const status =
    telemetry?.recommendation?.status ?? 'WARMING_UP';

  const reason =
    telemetry?.recommendation?.reason ??
    'Collecting telemetry history before prediction.';

  const threshold =
    telemetry?.recommendation?.threshold ?? 0.8;

  const recommendedProvider: Provider =
    PROVIDERS.includes(
      recommended as Provider
    )
      ? (recommended as Provider)
      : 'Jio';

  const recommendedMetrics =
    telemetry?.networks?.[recommendedProvider];

  const recommendedRisk =
    recommendedMetrics?.dropout_probability ?? null;

  /*
   * Determine whether TrackNet is asking the passenger
   * to switch networks.
   */
  const isSwitchRequired =
    status === 'SWITCH_REQUIRED';

  const isAllNetworksAtRisk =
    status === 'ALL_NETWORKS_AT_RISK';

  const isBestAvailableRisky =
    status === 'BEST_AVAILABLE_RISKY';

  const isWarmingUp =
    status === 'WARMING_UP';

  const hasWarning =
    isSwitchRequired ||
    isAllNetworksAtRisk ||
    isBestAvailableRisky;

  /*
   * Find the network currently carrying the highest
   * dropout risk.
   *
   * In the current simulator this will normally be
   * the network that TrackNet is asking the passenger
   * to leave.
   */
  let riskyProvider: Provider | null = null;
  let riskyProbability = 0;

  if (telemetry?.networks) {
    for (const provider of PROVIDERS) {
      const probability =
        telemetry.networks[provider]
          ?.dropout_probability ?? 0;

      if (probability > riskyProbability) {
        riskyProbability = probability;
        riskyProvider = provider;
      }
    }
  }

  /*
   * For the normal dashboard card, show the network
   * TrackNet currently recommends.
   */
  const activeProvider = recommendedProvider;

  const active =
    telemetry?.networks?.[activeProvider];

  const download =
    active?.download_speed_mbps != null
      ? active.download_speed_mbps.toFixed(1)
      : '—';

  const upload =
    active?.upload_speed_mbps != null
      ? active.upload_speed_mbps.toFixed(1)
      : '—';

  const latency =
    active?.latency_ms != null
      ? active.latency_ms.toFixed(1)
      : '—';

  const signal =
    active?.signal_strength != null
      ? active.signal_strength
      : null;

  return (
    <section className="rounded-xl border border-slate-800 bg-[#0d1117] p-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-5 flex items-center justify-between">

        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Network Status
        </h2>

        <span
          className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            connected
              ? 'text-[#00e5ff]'
              : 'text-slate-500'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              connected
                ? 'bg-[#00e5ff]'
                : 'bg-slate-600'
            }`}
          />

          {connected
            ? 'Connected'
            : 'Disconnected'}
        </span>

      </div>


      {/* ================================================= */}
      {/* ML RECOMMENDATION / ALERT */}
      {/* ================================================= */}

      {hasWarning && (
        <div
          className={`mb-6 rounded-lg border p-5 ${
            isAllNetworksAtRisk
              ? 'border-red-500/40 bg-red-500/5'
              : 'border-amber-500/40 bg-amber-500/5'
          }`}
        >

          <div className="flex items-start justify-between gap-4">

            <div className="flex items-start gap-3">

              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-lg ${
                  isAllNetworksAtRisk
                    ? 'border-red-500/40 bg-red-500/10 text-red-400'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                }`}
              >
                !
              </div>

              <div>

                <p
                  className={`text-[11px] font-bold uppercase tracking-[0.18em] ${
                    isAllNetworksAtRisk
                      ? 'text-red-400'
                      : 'text-amber-400'
                  }`}
                >
                  {isAllNetworksAtRisk
                    ? 'All Networks At Risk'
                    : isBestAvailableRisky
                      ? 'Best Available Network Risky'
                      : 'Network Switch Required'}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {reason}
                </p>

              </div>

            </div>

            {riskyProvider && (
              <div className="hidden text-right sm:block">

                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Highest Risk
                </p>

                <p className="mt-1 text-lg font-bold text-amber-400">
                  {(riskyProbability * 100).toFixed(1)}%
                </p>

                <p className="text-[9px] uppercase tracking-[0.15em] text-slate-600">
                  {riskyProvider}
                </p>

              </div>
            )}

          </div>


          {/* Recommendation boxes */}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* Risk */}

            <div className="rounded-md border border-slate-800 bg-[#080b0f] p-4">

              <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                Predicted Dropout
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-400">

                {riskyProvider
                  ? `${(
                      riskyProbability * 100
                    ).toFixed(1)}%`
                  : '—'}

              </p>

              <p className="mt-1 text-[10px] text-slate-600">
                Risk threshold: {(threshold * 100).toFixed(0)}%
              </p>

            </div>


            {/* Recommendation */}

            <div className="rounded-md border border-[#00e5ff]/20 bg-[#00e5ff]/5 p-4">

              <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                TrackNet Recommendation
              </p>

              <p className="mt-1 text-xl font-bold text-[#00e5ff]">
                {recommended
                  ? `${recommended} 4G`
                  : '—'}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Lowest predicted dropout risk
              </p>

            </div>

          </div>

        </div>
      )}


      {/* ================================================= */}
      {/* WARMING UP */}
      {/* ================================================= */}

      {isWarmingUp && (
        <div className="mb-6 rounded-lg border border-slate-800 bg-[#080b0f] p-4">

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            ML Connectivity Prediction
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Collecting telemetry history before prediction.
          </p>

        </div>
      )}


      {/* ================================================= */}
      {/* CURRENT / RECOMMENDED NETWORK */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">

        <div>

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[28px] font-bold tracking-tight text-white">
                {activeProvider} 4G
              </p>

              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {hasWarning
                  ? 'Recommended connection'
                  : 'Active connection'}
              </p>

            </div>

            <SignalGlyph
              active={true}
              strength={signal ?? 0}
            />

          </div>


          {/* Telemetry */}

          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">

            <div>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Download
              </p>

              <p className="mt-1 text-lg font-semibold text-[#00e5ff]">
                {download} Mbps
              </p>

            </div>


            <div>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Upload
              </p>

              <p className="mt-1 text-lg font-semibold text-[#00e5ff]">
                {upload} Mbps
              </p>

            </div>


            <div>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Latency
              </p>

              <p className="mt-1 text-lg font-semibold text-[#00e5ff]">
                {latency} ms
              </p>

            </div>


            <div>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Signal
              </p>

              <p className="mt-1 text-lg font-semibold text-[#00e5ff]">
                {signal != null
                  ? `${signal.toFixed(1)}%`
                  : '—'}
              </p>

            </div>

          </div>


          {/* ML prediction */}

          <div className="mt-6 rounded-lg border border-slate-800 bg-[#080b0f] p-4">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  ML Connectivity Prediction
                </p>

                <p
                  className={`mt-2 text-sm font-semibold ${
                    hasWarning
                      ? 'text-amber-400'
                      : 'text-[#00e5ff]'
                  }`}
                >
                  {hasWarning
                    ? 'Connectivity degradation predicted'
                    : 'No dropout predicted'}
                </p>

              </div>

              <div className="text-right">

                <p className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                  Current risk
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {recommendedRisk != null
                    ? `${(
                        recommendedRisk * 100
                      ).toFixed(1)}%`
                    : '—'}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* PROVIDER COMPARISON */}
        {/* ================================================= */}

        <div className="border-t border-slate-800/80 pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">

          <div className="mb-3 grid grid-cols-[1fr_60px_60px] text-[10px] uppercase tracking-[0.16em] text-slate-500">

            <span>
              Provider
            </span>

            <span className="text-right">
              Risk
            </span>

            <span className="text-right">
              Signal
            </span>

          </div>


          <div className="space-y-2">

            {PROVIDERS.map((name) => {

              const metrics =
                telemetry?.networks?.[name];

              const isActive =
                name === activeProvider;

              const dropout =
                metrics?.dropout_probability ?? null;

              const atRisk =
                dropout != null &&
                dropout >= threshold;

              return (

                <div
                  key={name}
                  className={`grid grid-cols-[1fr_60px_60px] items-center rounded-md px-2 py-2 ${
                    isActive
                      ? 'bg-[#111827]'
                      : ''
                  }`}
                >

                  <div className="flex items-center gap-2">

                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff]" />
                    )}

                    <span
                      className={`text-sm ${
                        isActive
                          ? 'font-semibold text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {name}
                    </span>

                  </div>


                  <div className="text-right text-sm">

                    <RiskBadge
                      probability={dropout}
                      threshold={threshold}
                    />

                  </div>


                  <div className="flex justify-end">

                    <SignalGlyph
                      active={isActive}
                      strength={
                        metrics?.signal_strength ?? 0
                      }
                    />

                  </div>

                </div>

              );

            })}

          </div>


          <div className="mt-4 border-t border-slate-800 pt-3">

            <div className="flex items-center justify-between">

              <span className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
                Risk threshold
              </span>

              <span className="text-[11px] font-semibold text-slate-400">
                {(threshold * 100).toFixed(0)}%
              </span>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}