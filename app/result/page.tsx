"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useBoothStore, TEMPLATES } from "@/store/useBoothStore";
import { generateImage, downloadImage } from "@/lib/canvas-utils";

export default function ResultPage() {
  const router = useRouter();
  const { finalSession, resetAll } = useBoothStore();
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Guard: kalau tidak ada session, balik ke home
    if (!finalSession) {
      router.replace("/");
      return;
    }

    async function generate() {
      if (!finalSession) return;

      try {
        const template =
          TEMPLATES.find((t) => t.id === finalSession.template) ?? TEMPLATES[0];

        const dataUrl = await generateImage(finalSession, template);
        setResultDataUrl(dataUrl);
      } catch (err) {
        console.error(err);
        setError("Failed to generate photo strip.");
      } finally {
        setIsGenerating(false);
      }
    }

    generate();
  }, [finalSession]);

  const handleDownload = () => {
    if (!resultDataUrl) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadImage(resultDataUrl, `photobooth-${timestamp}.png`);
  };

  const handleRetake = () => {
    resetAll();
    router.push("/booth");
  };

  // ---- Loading state ----
  if (isGenerating) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-neutral-400 text-sm">Developing your strip...</p>
      </main>
    );
  }

  // ---- Error state ----
  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <span className="text-4xl">😵</span>
        <p className="text-red-400 text-sm text-center">{error}</p>
        <button onClick={handleRetake} className="text-white underline text-sm">
          Try again
        </button>
      </main>
    );
  }

  // ---- Result ----
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold">Your Strip</h1>
        <p className="text-neutral-400 text-sm">Looking good 📸</p>
      </div>

      {/* Preview */}
      {resultDataUrl && (
        <div className="relative w-full max-w-[260px] shadow-2xl shadow-black/60 rounded-xl overflow-hidden">
          <Image
            src={resultDataUrl}
            alt="Photo strip result"
            width={400}
            height={1000}
            className="w-full h-auto"
            unoptimized // dataUrl tidak perlu optimasi Next.js
          />
        </div>
      )}

      {/* Actions */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={handleDownload}
          className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-base transition-all active:scale-95">
          Download PNG
        </button>

        <button
          onClick={handleRetake}
          className="w-full py-4 rounded-2xl border border-neutral-700 text-white font-semibold text-base transition-all hover:border-neutral-500 active:scale-95">
          Retake Photos
        </button>

        <Link
          href="/"
          className="text-center text-neutral-500 hover:text-white text-sm transition-colors py-2">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
