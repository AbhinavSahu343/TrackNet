import { useEffect, useState } from 'react';

export interface NetworkMetrics {
  signal_strength: number;
  latency_ms: number;
  packet_loss_percent: number;
  download_speed_mbps: number;
  upload_speed_mbps: number;
  dropout_probability: number | null;
  dropout_predicted: boolean | null;
}

export interface LiveTelemetryData {
  ready: boolean;
  step: number;
  timestamp: string;
  train: {
    route: string;
    location: string;
    latitude: number;
    longitude: number;
    distance_km: number;
    speed_kmph: number;
  };
  networks: {
    Jio: NetworkMetrics;
    Airtel: NetworkMetrics;
    Vi: NetworkMetrics;
  };
  recommendation: {
    recommended_network: string | null;
    dropout_probability: number | null;
    status: string;
    reason: string;
    threshold: number | null;
  };
}

export function useLiveTelemetry(url: string = 'http://127.0.0.1:8000/live', pollInterval: number = 2000) {
  const [data, setData] = useState<LiveTelemetryData | null>(null);
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function fetchTelemetry() {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Gateway server offline');
        const parsed: LiveTelemetryData = await response.json();
        if (active) {
          setData(parsed);
          setStatus('connected');
        }
      } catch (err) {
        if (active) setStatus('disconnected');
      } finally {
        if (active) {
          timer = setTimeout(fetchTelemetry, pollInterval);
        }
      }
    }

    fetchTelemetry();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [url, pollInterval]);

  return { data, status };
}