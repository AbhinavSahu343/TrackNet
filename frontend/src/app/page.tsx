"use client";

import { AppShell } from "../components/AppShell";
import { NetworkStatus } from "../components/NetworkStatus";
import { TelemetryRoute } from "../components/TelemetryRoute";
import { useLiveTelemetry } from "../hooks/useLiveTelemetry";
import { Clock, Signal } from "lucide-react";

export default function Home() {
  const { data: telemetry, status: liveStatus } = useLiveTelemetry();
  const isConnected = liveStatus === "connected";

  return (
    <AppShell>
      <main className="px-4 py-6 sm:px-8 lg:px-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-[#7eefff]">
                TrackNet — Mumbai to Delhi
              </h1>
              <span className="rounded-full border border-slate-700 bg-[#161b22] px-3 py-1 text-[11px] text-slate-400">
                Live Railway Connectivity Monitoring
              </span>
            </div>
            <p className="mt-1 text-[11px] tracking-wide text-slate-500">V3.4 Precision-Active</p>
          </div>
          <div className="flex items-center gap-4 text-slate-500 pt-2">
            <Signal className="h-4 w-4" strokeWidth={1.6} />
            <Clock className="h-4 w-4" strokeWidth={1.6} />
          </div>
        </header>

        <div className="space-y-5">
          <NetworkStatus telemetry={telemetry} connected={isConnected} />
          <TelemetryRoute telemetry={telemetry} />
        </div>
      </main>
    </AppShell>
  );
}
