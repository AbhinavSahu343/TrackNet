"use client";

// Relative imports to resolve path bugs
import { ConnectionBanner } from "../components/ConnectionBanner";
import { SignalCard } from "../components/SignalCard";
import { useLiveTelemetry } from "../hooks/useLiveTelemetry";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { useEffect, useState } from "react";

export default function Home() {
  // Extracting matching REST variables from hooks
  const { data: telemetry, status: liveStatus } = useLiveTelemetry();
  const { queue, addToQueue, clearQueue } = useOfflineQueue();

  const [trainCount, setTrainCount] = useState(0);
  const [item, setItem] = useState('');
  const [seat, setSeat] = useState('');

  useEffect(() => {
    if (telemetry) {
      setTrainCount((prev) => prev + 1);
    }
  }, [telemetry]);

  const isConnected = liveStatus === "connected";

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !seat) return;
    addToQueue(item, seat);
    setItem('');
    setSeat('');
  };

  return (
    <>
      <ConnectionBanner />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            TrackNet Passenger Portal
          </h1>
          <p className="text-slate-600 mt-2">
            Real-time railway network monitoring and edge connectivity optimization
          </p>
        </header>

        {/* System Overview Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SignalCard 
              title="Gateway Connection" 
              status={isConnected ? "healthy" : "critical"} 
              value={isConnected ? "Connected" : "Disconnected"} 
              description="HTTP status of Edge Gateway polling" 
            />
            <SignalCard 
              title="Telemetry Updates" 
              status={telemetry ? "healthy" : "warning"} 
              value={trainCount} 
              description="Total live simulation frames processed" 
            />
            <SignalCard 
              title="Optimal AI Link" 
              status="healthy" 
              value={telemetry?.recommendation?.recommended_network || "Scanning..."} 
              description="Mathematically optimal network route chosen by Edge-AI" 
            />
          </div>
        </div>

        {/* Live Positions from FastAPI Simulation */}
        {telemetry?.train && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Onboard Telemetry Stream
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Route</p>
                  <p className="text-md font-bold text-slate-800 mt-1">{telemetry.train.route}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Speed</p>
                  <p className="text-md font-bold text-slate-800 mt-1">{telemetry.train.speed_kmph} km/h</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Latitude</p>
                  <p className="text-md font-bold text-slate-800 mt-1">{telemetry.train.latitude?.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Longitude</p>
                  <p className="text-md font-bold text-slate-800 mt-1">{telemetry.train.longitude?.toFixed(4)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Commerce and Logs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Cellular Signal Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">Jio Signal</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-1">{telemetry?.networks?.Jio?.signal_strength ?? 0}%</p>
                  <p className="text-[10px] text-slate-400 mt-1">Latency: {telemetry?.networks?.Jio?.latency_ms ?? 0}ms</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">Airtel Signal</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-1">{telemetry?.networks?.Airtel?.signal_strength ?? 0}%</p>
                  <p className="text-[10px] text-slate-400 mt-1">Latency: {telemetry?.networks?.Airtel?.latency_ms ?? 0}ms</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">Vi Signal</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-1">{telemetry?.networks?.Vi?.signal_strength ?? 0}%</p>
                  <p className="text-[10px] text-slate-400 mt-1">Latency: {telemetry?.networks?.Vi?.latency_ms ?? 0}ms</p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Offline Order Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
              Offline Food Booking
            </h2>
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block font-semibold mb-1">Item Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Tea, Samosa" 
                  value={item} 
                  onChange={(e) => setItem(e.target.value)} 
                  className="w-full text-slate-800 text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all" 
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block font-semibold mb-1">Seat Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. B2 - Seat 44" 
                  value={seat} 
                  onChange={(e) => setSeat(e.target.value)} 
                  className="w-full text-slate-800 text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all" 
                />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm">
                Queue Order Locally
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs text-slate-400 uppercase font-bold">Local Queue</h3>
                <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">{queue.length} Pending</span>
              </div>
              {queue.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  All transactions synchronized!
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {queue.map((order) => (
                      <div key={order.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{order.item}</p>
                          <p className="text-[10px] text-slate-400">Seat: {order.seatNumber}</p>
                        </div>
                        <span className="text-[9px] font-bold text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded tracking-wide animate-pulse">Cached</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={clearQueue}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors mt-2"
                  >
                    Clear Local Queue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}