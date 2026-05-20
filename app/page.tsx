"use client";

import Link from "next/link";
import TemplatePicker from "@/components/TemplatePicker";
import { useBoothStore } from "@/store/useBoothStore";

export default function Home() {
  const { selectedTemplate } = useBoothStore();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Ambient background glow — ikut warna template */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${selectedTemplate.accentColor}, transparent 70%)`,
        }}
      />

      <div className="relative w-full max-w-sm flex flex-col items-center gap-8">
        {/* Hero */}
        <div
          className="text-center space-y-3"
          style={{ animation: "fadeUp 0.5s ease-out both" }}>
          <div className="text-5xl">📷</div>
          <h1 className="text-4xl font-bold tracking-tight">Photobooth</h1>
          <p className="text-neutral-400 text-sm max-w-xs mx-auto leading-relaxed">
            Take 4 photos, pick a frame,
            <br />
            download your strip.
          </p>
        </div>

        {/* Template picker */}
        <div
          className="w-full"
          style={{ animation: "fadeUp 0.5s ease-out 0.1s both" }}>
          <TemplatePicker />
        </div>

        {/* CTA */}
        <div
          className="w-full"
          style={{ animation: "fadeUp 0.5s ease-out 0.2s both" }}>
          <Link
            href="/booth"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-95 hover:brightness-110"
            style={{
              backgroundColor: selectedTemplate.accentColor,
              color: selectedTemplate.bgColor,
            }}>
            Start Shooting
            <span>→</span>
          </Link>
        </div>

        <p className="text-neutral-600 text-xs">
          Camera access required · Photos stay on your device
        </p>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
