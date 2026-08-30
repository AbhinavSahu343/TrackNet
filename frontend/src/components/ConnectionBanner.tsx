
'use client';

import { useEffect, useState } from 'react';

export function ConnectionBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`w-full text-center py-2.5 text-xs font-bold text-white transition-colors duration-300 ${
      isOnline ? 'bg-emerald-600' : 'bg-amber-600'
    }`}>
      {isOnline ? '🟢 ONBOARD EDGE SYSTEM ONLINE (WAN Aggregation Active)' : '🟠 ONBOARD EDGE SYSTEM OFFLINE (Local Intranet Mode)'}
    </div>
  );
}