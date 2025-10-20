import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orion Dashboard",
  description: "Real-time visibility into your Orion cluster",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Orion</h1>
                <p className="text-sm text-slate-400">Kubernetes for JS Devs</p>
              </div>
              <nav className="flex items-center gap-4 text-sm text-slate-300">
                <a href="#services" className="hover:text-white">Services</a>
                <a href="#nodes" className="hover:text-white">Nodes</a>
                <a href="#logs" className="hover:text-white">Logs</a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8 space-y-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
