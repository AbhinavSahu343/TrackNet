"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export interface TelemetryData {
  timestamp: number;
  trainId: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: string;
}

export const useWebSocketTelemetry = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<TelemetryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messageHandlersRef = useRef<Set<(data: TelemetryData) => void>>(new Set());

  const connect = useCallback(() => {
    if (wsRef.current) return;

    try {
      wsRef.current = new WebSocket("ws://localhost:8000/telemetry");

      wsRef.current.onopen = () => {
        console.log("[WebSocket] Connected to telemetry service");
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: TelemetryData = JSON.parse(event.data);
          setLastMessage(data);
          messageHandlersRef.current.forEach((handler) => handler(data));
          console.log("[WebSocket] Telemetry received:", data);
        } catch (parseError) {
          console.error("[WebSocket] Failed to parse message:", parseError);
        }
      };

      wsRef.current.onerror = () => {
        setError("WebSocket connection error");
        console.error("[WebSocket] Connection error");
      };

      wsRef.current.onclose = () => {
        console.log("[WebSocket] Disconnected from telemetry service");
        setIsConnected(false);
        wsRef.current = null;
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect";
      setError(errorMessage);
      console.error("[WebSocket] Connection failed:", err);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const subscribe = useCallback(
    (handler: (data: TelemetryData) => void) => {
      messageHandlersRef.current.add(handler);
      return () => {
        messageHandlersRef.current.delete(handler);
      };
    },
    []
  );

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    subscribe,
  };
};
