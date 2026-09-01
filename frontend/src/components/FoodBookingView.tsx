'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Armchair,
  Bell,
  Calendar,
  Check,
  Laptop,
  MapPin,
  Search,
  ShoppingCart,
  Star,
  Train,
  Utensils,
  WifiOff,
} from 'lucide-react';
import { AppShell } from './AppShell';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

const SEAT = 'B2/42';
const COACH = 'B2';
const SEAT_NO = '42';

const STATIONS = [
  { id: 'cnb', name: 'Kanpur Central', eta: '15:27' },
  { id: 'pryj', name: 'Prayagraj Jn', eta: '18:42' },
  { id: 'bsb', name: 'Varanasi', eta: '22:17' },
];

const CATEGORIES = ['Thali', 'North Indian', 'Healthy', 'South Indian', 'Beverages'] as const;

type Category = (typeof CATEGORIES)[number];

type MenuItem = {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  veg: boolean;
  category: Category;
  accent: string;
};

const MENU: MenuItem[] = [
  { id: 'thali', name: 'Executive Veg Thali', price: 250, rating: 4.8, reviews: 124, veg: true, category: 'Thali', accent: '#2f6b4f' },
  { id: 'biryani', name: 'Paneer Biryani', price: 180, rating: 4.6, reviews: 89, veg: true, category: 'North Indian', accent: '#8a4b1f' },
  { id: 'dal', name: 'Dal Tadka Combo', price: 160, rating: 4.5, reviews: 76, veg: true, category: 'North Indian', accent: '#b45309' },
  { id: 'salad', name: 'Millet Bowl', price: 190, rating: 4.7, reviews: 54, veg: true, category: 'Healthy', accent: '#365314' },
  { id: 'dosa', name: 'Masala Dosa', price: 140, rating: 4.4, reviews: 101, veg: true, category: 'South Indian', accent: '#92400e' },
  { id: 'chai', name: 'Masala Chai', price: 40, rating: 4.9, reviews: 210, veg: true, category: 'Beverages', accent: '#7c2d12' },
  { id: 'lassi', name: 'Sweet Lassi', price: 60, rating: 4.3, reviews: 48, veg: true, category: 'Beverages', accent: '#a16207' },
  { id: 'mini', name: 'Mini Veg Thali', price: 180, rating: 4.4, reviews: 67, veg: true, category: 'Thali', accent: '#166534' },
];

type CartLine = { id: string; qty: number };

export function FoodBookingView() {
  const { queue, addToQueue } = useOfflineQueue();
  const [stationId, setStationId] = useState('cnb');
  const [category, setCategory] = useState<Category>('Thali');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([
    { id: 'thali', qty: 2 },
    { id: 'chai', qty: 1 },
  ]);
  const [headerTab, setHeaderTab] = useState<'dashboard' | 'orders'>('orders');
  const [activeOrder, setActiveOrder] = useState<{ id: string; station: string } | null>({
    id: 'FD2048',
    station: 'Kanpur Central',
  });
  const [notice, setNotice] = useState('');

  const station = STATIONS.find((s) => s.id === stationId) ?? STATIONS[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter((item) => {
      const matchesCat = item.category === category;
      const matchesQ = !q || item.name.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [category, query]);

  const cartDetails = cart
    .map((line) => {
      const item = MENU.find((m) => m.id === line.id);
      if (!item) return null;
      return { ...item, qty: line.qty, lineTotal: item.price * line.qty };
    })
    .filter(Boolean) as Array<MenuItem & { qty: number; lineTotal: number }>;

  const total = cartDetails.reduce((sum, line) => sum + line.lineTotal, 0);

  function addItem(id: string) {
    setCart((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { id, qty: 1 }];
    });
    setHeaderTab('orders');
  }

  function confirmOrder() {
    if (cartDetails.length === 0) return;
    const summary = cartDetails.map((l) => `${l.qty}x ${l.name}`).join(', ');
    addToQueue(`${summary} → ${station.name}`, SEAT);
    setActiveOrder({
      id: `FD${Math.floor(1000 + Math.random() * 9000)}`,
      station: station.name,
    });
    setCart([]);
    setNotice('Order queued locally. It will sync when connectivity is restored.');
  }

  return (
    <AppShell>
      <div className="min-h-full px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <h1 className="text-lg font-extrabold tracking-[0.12em] text-white uppercase">Food Booking</h1>
          <p className="text-xs text-slate-400">Train 22436 &gt; Seat {SEAT}</p>
          <div className="flex items-center gap-5">
            <Link
              href="/"
              onClick={() => setHeaderTab('dashboard')}
              className={`text-sm ${headerTab === 'dashboard' ? 'text-cyan-300 border-b-2 border-cyan-400 pb-0.5' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                setHeaderTab('orders');
                document.getElementById('your-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`text-sm ${headerTab === 'orders' ? 'text-cyan-300 border-b-2 border-cyan-400 pb-0.5' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Orders
            </button>
            <span className="relative">
              <Bell className="h-4 w-4 text-slate-400" />
              {queue.length > 0 && (
                <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
              )}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-4xl font-extrabold tracking-tight text-white uppercase">Food Menu</h2>
                <p className="mt-1 text-sm text-slate-400">Order meals directly to your seat</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/50 bg-emerald-950/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Offline Booking Available
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-[#0d1117] px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-slate-200">
                <Train className="h-4 w-4 text-slate-400" />
                Vande Bharat Express • 22436
              </p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  New Delhi → Varanasi
                </span>
                <span className="inline-flex items-center gap-2">
                  <Armchair className="h-3.5 w-3.5" />
                  Coach {COACH} • Seat {SEAT_NO}
                </span>
              </div>
            </div>

            <p className="mt-6 mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              Delivery Station
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STATIONS.map((s) => {
                const selected = s.id === stationId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStationId(s.id)}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                      selected
                        ? 'border-cyan-400/70 border-l-4 bg-[#0d1520] text-white'
                        : 'border-slate-800 bg-[#0d1117] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${selected ? 'text-white' : 'text-slate-400'}`}>{s.name}</p>
                      {selected && <Check className="h-4 w-4 text-cyan-400" strokeWidth={2.4} />}
                    </div>
                    <p className={`mt-1 text-xs ${selected ? 'text-cyan-400' : 'text-slate-500'}`}>ETA: {s.eta}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = cat === category;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                        active
                          ? 'border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                          : 'border border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              <div className="relative lg:ml-auto lg:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search menu..."
                  className="w-full rounded-lg border border-slate-800 bg-[#0d1117] py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.length === 0 && (
                <p className="col-span-full rounded-xl border border-dashed border-slate-800 py-10 text-center text-sm text-slate-500">
                  No dishes match this filter.
                </p>
              )}
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-slate-800 bg-[#0d1117] p-3"
                >
                  <div
                    className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-lg"
                    style={{ background: `linear-gradient(145deg, ${item.accent}, #0b1220)` }}
                  >
                    <Utensils className="absolute inset-0 m-auto h-7 w-7 text-white/50" />
                    {item.veg && (
                      <span className="absolute left-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border border-emerald-500 bg-[#0d1117]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-white">{item.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-amber-400">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {item.rating.toFixed(1)} <span className="text-slate-500">({item.reviews})</span>
                    </p>
                    <div className="mt-3 flex items-end justify-between">
                      <p className="text-lg font-bold text-cyan-300">₹{item.price}</p>
                      <button
                        type="button"
                        onClick={() => addItem(item.id)}
                        className="rounded-md border border-cyan-400/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300 hover:bg-cyan-400/10"
                      >
                        Add +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-4 self-start">
            <section id="your-order" className="rounded-xl border border-slate-800 bg-[#0d1117] p-5">
              <h3 className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-slate-200">
                <ShoppingCart className="h-4 w-4 text-cyan-400" />
                Your Order
              </h3>
              {cartDetails.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">Your cart is empty. Add items from the menu.</p>
              ) : (
                <ul className="space-y-4">
                  {cartDetails.map((line) => (
                    <li key={line.id} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-200">
                          <span className="mr-2 rounded bg-cyan-500/15 px-1.5 py-0.5 text-[11px] font-bold text-cyan-300">
                            {line.qty}x
                          </span>
                          {line.name}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">₹{line.price} each</p>
                      </div>
                      <p className="text-sm font-semibold text-cyan-300">₹{line.lineTotal}</p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-5 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                Delivery to: Seat {SEAT}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-slate-400">Total</p>
                <p className="rounded-md border border-cyan-400/70 px-3 py-1 text-lg font-bold text-cyan-300">₹{total}</p>
              </div>
              <button
                type="button"
                disabled={cartDetails.length === 0}
                onClick={confirmOrder}
                className="mt-4 w-full rounded-lg border border-cyan-400 py-3 text-sm font-bold uppercase tracking-[0.12em] text-cyan-300 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm Order →
              </button>
              {notice && <p className="mt-3 text-[11px] text-emerald-400">{notice}</p>}
            </section>

            {activeOrder && (
              <section className="rounded-xl border border-slate-800 bg-[#0d1117] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Active Order</p>
                  <p className="text-xs font-semibold text-cyan-400">#{activeOrder.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-700/50 text-cyan-300">
                    <Utensils className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm text-slate-200">Restaurant preparing</p>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                      Delivery at {activeOrder.station}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-xl border border-emerald-700/40 bg-[#0d1117] p-5">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-emerald-400">
                <WifiOff className="h-4 w-4" />
                Offline Module
              </p>
              <p className="mt-3 text-sm text-slate-400">
                Orders sync automatically when connectivity is restored.
              </p>
              <p className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
                <Laptop className="h-3.5 w-3.5" />
                <Calendar className="h-3.5 w-3.5" />
                Menu cached locally
              </p>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
