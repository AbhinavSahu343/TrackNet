"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export const ConnectionBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-2 text-white font-semibold ${
        isOnline ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-5 h-5" />
          <span>ONLINE (Aggregated Mode)</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5" />
          <span>OFFLINE (Local Edge Mode)</span>
        </>
      )}
    </div>
  );
};
