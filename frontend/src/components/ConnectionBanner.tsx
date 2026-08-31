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

  if (isOnline) return null;

  return (
    <div className="w-full text-center py-2 text-[10px] font-bold tracking-[0.2em] uppercase text-amber-100 bg-[#3a2418] border-b border-amber-900/60">
      Onboard edge system offline — local intranet mode
    </div>
  );
}
