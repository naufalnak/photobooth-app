"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #e879f9, transparent 70%)",
        }}
      />

      <div
        className="relative w-full max-w-sm flex flex-col items-center gap-8"
        style={{ animation: "fadeUp 0.5s ease-out both" }}>
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="text-6xl mb-2">📷</div>
          <h1 className="text-4xl font-bold tracking-tight">Photobooth</h1>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto">
            Ambil 4 foto, pilih background,
            <br />
            tambah stiker & filter, download strip-mu.
          </p>
        </div>

        {/* Steps */}
        <div className="w-full flex flex-col gap-2">
          {[
            { step: "01", label: "Ambil 4 foto" },
            { step: "02", label: "Pilih background & filter" },
            { step: "03", label: "Download strip" },
          ].map(({ step, label }) => (
            <div
              key={step}
              className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5">
              <span className="text-xs text-neutral-500 font-mono">{step}</span>
              <span className="text-sm text-neutral-300">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/booth"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base bg-white text-black transition-all duration-200 active:scale-95 hover:bg-neutral-100">
          Mulai Foto
          <span>→</span>
        </Link>

        <p className="text-neutral-600 text-xs">
          Akses kamera diperlukan · Foto tersimpan di perangkatmu
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
