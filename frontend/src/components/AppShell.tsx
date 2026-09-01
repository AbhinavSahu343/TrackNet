'use client';

import { ConnectionBanner } from './ConnectionBanner';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ConnectionBanner />
      <div className="flex min-h-screen bg-[#05070a] text-slate-300">
        <Sidebar />
        <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
