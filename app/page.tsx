"use client";

import Link from "next/link";
import TemplatePicker from "@/components/TemplatePicker";
import { useBoothStore } from "@/store/useBoothStore";

export default function Home() {
  const { selectedTemplate } = useBoothStore();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-12 space-y-3">
        <div className="text-5xl mb-4">📷</div>
        <h1 className="text-4xl font-bold tracking-tight">Photobooth</h1>
        <p className="text-neutral-400 text-base max-w-xs mx-auto">
          Take 4 photos, pick a frame, download your strip.
        </p>
      </div>

      {/* Template picker */}
      <div className="w-full max-w-sm mb-10">
        <TemplatePicker />
      </div>

      {/* CTA */}
      <Link
        href="/booth"
        className="w-full max-w-sm flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-95"
        style={{
          backgroundColor: selectedTemplate.accentColor,
          color: selectedTemplate.bgColor,
        }}>
        Start Shooting
        <span className="text-lg">→</span>
      </Link>

      {/* Footer note */}
      <p className="text-neutral-600 text-xs mt-8">
        Camera access required · Photos stay on your device
      </p>
    </main>
  );
}
