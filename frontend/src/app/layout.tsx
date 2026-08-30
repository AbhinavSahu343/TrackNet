import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "TrackNet - Railway System Dashboard",
  description: "Real-time railway network monitoring and optimization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
