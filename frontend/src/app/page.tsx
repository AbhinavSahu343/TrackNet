"use client";

import { ConnectionBanner } from "@/components/ConnectionBanner";
import { SignalCard } from "@/components/SignalCard";
import { useWebSocketTelemetry } from "@/hooks/useWebSocketTelemetry";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { useEffect, useState } from "react";

export default function Home() {
  const { isConnected, lastMessage } = useWebSocketTelemetry();
  const { processQueue } = useOfflineQueue();
  const [trainCount, setTrainCount] = useState(0);

  useEffect(() => {
    if (lastMessage) {
      setTrainCount((prev) => prev + 1);
    }
  }, [lastMessage]);

  return (
    <>
      <ConnectionBanner />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            TrackNet Passenger Portal
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time railway network monitoring and optimization
          </p>
        </header>

        {/* WebSocket Status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SignalCard
              title="Telemetry Connection"
              status={isConnected ? "healthy" : "critical"}
              value={isConnected ? "Connected" : "Disconnected"}
              description="WebSocket telemetry service status"
            />
            <SignalCard
              title="Trains Tracked"
              status="healthy"
              value={trainCount}
              description="Live telemetry signals received"
            />
            <SignalCard
              title="Last Update"
              status={lastMessage ? "healthy" : "warning"}
              value={
                lastMessage
                  ? new Date(lastMessage.timestamp).toLocaleTimeString()
                  : "Waiting..."
              }
              description="Latest telemetry timestamp"
            />
          </div>
        </div>

        {/* Latest Telemetry */}
        {lastMessage && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Latest Train Data
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Train ID</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {lastMessage.trainId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Speed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {lastMessage.speed} km/h
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Latitude</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {lastMessage.latitude.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Longitude</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {lastMessage.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Telemetry
              </h3>
              <p className="text-gray-600">
                Live WebSocket connection to train coordinate streams via the
                Python telemetry service.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Offline Capabilities
              </h3>
              <p className="text-gray-600">
                IndexedDB-based offline queue for syncing transactions when
                connectivity is restored.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aggregated Mode
              </h3>
              <p className="text-gray-600">
                When online, aggregate data from central backend for
                comprehensive network insights.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Edge Mode
              </h3>
              <p className="text-gray-600">
                When offline, operate in local edge mode using cached data and
                local computations.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
