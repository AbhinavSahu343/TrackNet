'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BedDouble,
  Briefcase,
  Check,
  Clock,
  FileText,
  Headphones,
  Paintbrush,
  Target,
  Utensils,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppShell } from './AppShell';

type RequestStatus = {
  id: string;
  title: string;
  status: string;
  tone: 'cyan' | 'green' | 'amber';
  progress: number;
  icon: 'food' | 'clean' | 'aid' | 'bed' | 'assist' | 'issue';
};

const STORAGE_KEY = 'tracknet_intrain_requests';

const ICONS: Record<RequestStatus['icon'], LucideIcon> = {
  food: Utensils,
  clean: Paintbrush,
  aid: Briefcase,
  bed: BedDouble,
  assist: Headphones,
  issue: AlertTriangle,
};

const INITIAL_REQUESTS: RequestStatus[] = [
  {
    id: 'FD2048',
    title: 'Food Order #FD2048',
    status: 'Preparing (Pantry)',
    tone: 'cyan',
    progress: 72,
    icon: 'food',
  },
  {
    id: 'CL-01',
    title: 'Cleaning Request',
    status: 'Staff Assigned',
    tone: 'green',
    progress: 18,
    icon: 'clean',
  },
];

export function InTrainServicesView() {
  const [requests, setRequests] = useState<RequestStatus[]>(INITIAL_REQUESTS);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueText, setIssueText] = useState('');
  const [aidOpen, setAidOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch {
        setRequests(INITIAL_REQUESTS);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }, [requests, ready]);

  function upsertRequest(next: RequestStatus) {
    setRequests((prev) => {
      const without = prev.filter((r) => r.id !== next.id && r.icon !== next.icon);
      return [next, ...without].slice(0, 6);
    });
    setNotice(`${next.title} updated.`);
  }

  function submitIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!issueText.trim()) return;
    upsertRequest({
      id: `IS-${Date.now().toString().slice(-4)}`,
      title: 'Complaint filed',
      status: issueText.trim().slice(0, 42),
      tone: 'amber',
      progress: 10,
      icon: 'issue',
    });
    setIssueText('');
    setIssueOpen(false);
  }

  const services: Array<{
    key: string;
    title: string;
    subtitle: string;
    icon: LucideIcon;
    href?: string;
    available?: boolean;
    highlight?: boolean;
    onClick?: () => void;
  }> = [
    {
      key: 'food',
      title: 'Food Booking',
      subtitle: 'Pantry car bookings only',
      icon: Utensils,
      href: '/food-booking',
      available: true,
      highlight: true,
    },
    {
      key: 'aid',
      title: 'First Aid',
      subtitle: 'Basic medical kits',
      icon: Briefcase,
      available: true,
      highlight: true,
      onClick: () => setAidOpen(true),
    },
    {
      key: 'clean',
      title: 'Cleanliness',
      subtitle: '~5m ETA',
      icon: Paintbrush,
      onClick: () =>
        upsertRequest({
          id: 'CL-01',
          title: 'Cleaning Request',
          status: 'Staff Assigned',
          tone: 'green',
          progress: 18,
          icon: 'clean',
        }),
    },
    {
      key: 'bed',
      title: 'Bedding Issue',
      subtitle: 'Available',
      icon: BedDouble,
      onClick: () =>
        upsertRequest({
          id: 'BD-01',
          title: 'Bedding Issue',
          status: 'Attendant notified',
          tone: 'cyan',
          progress: 35,
          icon: 'bed',
        }),
    },
    {
      key: 'assist',
      title: 'Coach Assistant',
      subtitle: 'On Duty',
      icon: Headphones,
      onClick: () =>
        upsertRequest({
          id: 'CA-01',
          title: 'Coach Assistant',
          status: 'On the way to B2',
          tone: 'green',
          progress: 40,
          icon: 'assist',
        }),
    },
    {
      key: 'issue',
      title: 'Report Issue',
      subtitle: 'File Complaint',
      icon: AlertTriangle,
      onClick: () => setIssueOpen(true),
    },
  ];

  return (
    <AppShell>
      <main className="px-4 py-6 sm:px-7 lg:px-8 pb-10">
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase drop-shadow-[0_0_18px_rgba(56,189,248,0.25)]">
              In-Train Services
            </h1>
            <p className="mt-2 text-sm text-slate-400">Everything you need during your journey</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-cyan-300">Vande Bharat Express • 22436</p>
            <p className="mt-1 text-sm text-white">New Delhi → Varanasi</p>
            <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-600/50 bg-emerald-950/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Services Available Offline
            </span>
          </div>
        </header>

        {notice && (
          <p className="mb-4 rounded-lg border border-cyan-900/50 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-300">
            {notice}
          </p>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const Icon = service.icon;
              const className = `relative rounded-xl border p-5 text-left transition-colors ${
                service.highlight
                  ? 'border-cyan-500/40 bg-[#0d1117] hover:border-cyan-400/70'
                  : 'border-slate-800 bg-[#0d1117] hover:border-slate-600'
              }`;
              const body = (
                <>
                  {service.available && (
                    <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                  <Icon className="h-6 w-6 text-cyan-400" strokeWidth={1.6} />
                  <h2 className="mt-4 text-lg font-bold text-white">{service.title}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                    {service.key === 'clean' && <Clock className="h-3.5 w-3.5" />}
                    {service.key === 'bed' && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    {service.key === 'assist' && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    {service.key === 'issue' && <FileText className="h-3.5 w-3.5" />}
                    {service.subtitle}
                  </p>
                </>
              );

              if (service.href) {
                return (
                  <Link key={service.key} href={service.href} className={className}>
                    {body}
                  </Link>
                );
              }

              return (
                <button key={service.key} type="button" onClick={service.onClick} className={className}>
                  {body}
                </button>
              );
            })}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-4 self-start">
            <section className="rounded-xl border border-slate-800 bg-[#0d1117] p-5">
              <h2 className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                <Briefcase className="h-4 w-4" />
                My Journey
              </h2>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <p className="text-slate-300">
                  Coach <span className="font-bold text-white">B2</span>
                </p>
                <p className="text-right text-slate-300">
                  Seat <span className="font-bold text-cyan-300">42</span>
                </p>
                <p className="text-slate-500">Class: EC</p>
                <p className="text-right text-slate-500">PNR: 2489012345</p>
              </div>
              <Link
                href="/live-journey"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/60 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cyan-300 hover:bg-cyan-400/10"
              >
                <Target className="h-4 w-4" />
                View Live Journey
              </Link>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#0d1117] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-cyan-300">Active Requests</h2>
                <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-sky-600 px-1.5 text-xs font-bold text-white">
                  {requests.length}
                </span>
              </div>
              {requests.length === 0 ? (
                <p className="text-xs text-slate-500">No active requests.</p>
              ) : (
                <ul className="space-y-5">
                  {requests.map((req) => {
                    const Icon = ICONS[req.icon];
                    const bar = req.tone === 'green' ? 'bg-emerald-400' : req.tone === 'amber' ? 'bg-amber-400' : 'bg-cyan-400';
                    const statusColor =
                      req.tone === 'green' ? 'text-emerald-400' : req.tone === 'amber' ? 'text-amber-400' : 'text-cyan-400';
                    return (
                      <li key={req.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{req.title}</p>
                            <p className={`mt-1 text-[11px] uppercase tracking-[0.12em] ${statusColor}`}>{req.status}</p>
                          </div>
                          <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div className={`h-full rounded-full ${bar}`} style={{ width: `${req.progress}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </main>

      {aidOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setAidOpen(false)}>
          <div
            className="w-full max-w-md rounded-xl border border-slate-800 bg-[#0d1117] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white">First Aid</h3>
            <p className="mt-2 text-sm text-slate-400">
              A basic medical kit is available with the coach attendant in B2. Request assistance if you need it brought to seat 42.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  upsertRequest({
                    id: 'FA-01',
                    title: 'First Aid Request',
                    status: 'Attendant notified',
                    tone: 'green',
                    progress: 25,
                    icon: 'aid',
                  });
                  setAidOpen(false);
                }}
                className="flex-1 rounded-lg bg-cyan-400 py-2.5 text-sm font-bold text-slate-950"
              >
                Request kit
              </button>
              <button
                type="button"
                onClick={() => setAidOpen(false)}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {issueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setIssueOpen(false)}>
          <form
            onSubmit={submitIssue}
            className="w-full max-w-md rounded-xl border border-slate-800 bg-[#0d1117] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white">File a complaint</h3>
            <textarea
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              rows={4}
              placeholder="Describe the issue in your coach..."
              className="mt-4 w-full rounded-lg border border-slate-800 bg-[#05070a] p-3 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
            />
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={!issueText.trim()}
                className="flex-1 rounded-lg bg-cyan-400 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setIssueOpen(false)}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
