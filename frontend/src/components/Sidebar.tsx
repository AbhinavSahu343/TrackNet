'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Briefcase,
  Globe,
  Home,
  MapPin,
  Settings,
  Ticket,
  Train,
  User,
  Utensils,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'Live Journey', icon: MapPin, href: '/live-journey' },
  { label: 'Network Status', icon: Globe, href: '/network-status' },
  { label: 'Food Booking', icon: Utensils, href: '/food-booking' },
  { label: 'In-Train Services', icon: Train, href: '/in-train-services' },
  { label: 'SOS / Medical Emergency', icon: Briefcase, href: '#' },
  { label: 'My Bookings', icon: Ticket, href: '#' },
  { label: 'Alerts', icon: Bell, href: '#' },
  { label: 'Profile', icon: User, href: '#' },
  { label: 'Settings', icon: Settings, href: '#' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[280px] shrink-0 flex-col bg-[#0b1121] px-8 py-10 overflow-y-auto">
      <Link href="/" className="text-[22px] font-extrabold tracking-[0.18em] text-white">
        TRACKNET
      </Link>
      <nav className="mt-16 flex flex-col gap-8">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.href !== '#' && pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3.5 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors ${
                active ? 'text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0 stroke-[1.5]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
