import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "TrackNet | Intelligent Railway Connectivity Gateway",
  description: "Multi-carrier aggregation & local offline captive portal for railway journeys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full bg-slate-50 text-slate-900 antialiased flex flex-col">
        {/* Semantic HTML Header */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
                🚆 Track<span className="text-emerald-600 font-extrabold">Net</span>
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wide border border-emerald-200">
                Edge-AI Gateway
              </span>
            </div>
            <nav className="flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <a href="#" className="hover:text-emerald-600 transition-colors">Passenger Portal</a>
              <span className="text-slate-300">|</span>
              <a href="#" className="hover:text-emerald-600 transition-colors">Admin Telemetry</a>
            </nav>
          </div>
        </header>

        {/* Dynamic page contents nested directly here */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>

        {/* Semantic HTML Footer */}
        <footer className="w-full border-t border-slate-200 bg-white py-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 TrackNet Systems. All rights reserved.</p>
            <p className="flex items-center gap-2 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gateway Operations Normal
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

