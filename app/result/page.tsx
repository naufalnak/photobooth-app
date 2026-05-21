// app/result/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useBoothStore, TEMPLATES } from "@/store/useBoothStore";
import { generateImage, downloadImage } from "@/lib/canvas-utils";
import StripEditor from "@/components/StripEditor";

type ResultStep = "editing" | "generating" | "done";

export default function ResultPage() {
  const router = useRouter();

  const {
    finalSession,
    selectedFilter,
    placedStickers,
    customBackground,
    bgColor,
    selectedTemplate,
    setFinalSession,
    resetAll,
  } = useBoothStore();

  const [step, setStep] = useState<ResultStep>("editing");
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!finalSession) router.replace("/");
    }, 500);
    return () => clearTimeout(timer);
  }, [finalSession]);

  const handleGenerate = useCallback(async () => {
    if (!finalSession) return;
    setStep("generating");
    setError("");

    try {
      const template =
        TEMPLATES.find((t) => t.id === finalSession.template) ?? TEMPLATES[0];

      const updatedSession = {
        ...finalSession,
        filter: selectedFilter,
        placedStickers,
        customBackground,
      };

      setFinalSession(updatedSession);

      const dataUrl = await generateImage(updatedSession, template, bgColor);
      setResultDataUrl(dataUrl);
      setStep("done");
    } catch (err) {
      console.error(err);
      setError("Gagal generate foto strip.");
      setStep("editing");
    }
  }, [finalSession, selectedFilter, placedStickers, customBackground, bgColor]);

  const handleDownload = () => {
    if (!resultDataUrl) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadImage(resultDataUrl, `photobooth-${timestamp}.png`);
  };

  const handleRetake = () => {
    resetAll();
    router.push("/booth");
  };

  if (!finalSession) return null;

  // ---- EDITING ----
  if (step === "editing") {
    return (
      <main className="min-h-screen flex flex-col items-center px-4 py-8 gap-5">
        <div className="w-full max-w-sm flex items-center justify-between">
          <button
            onClick={handleRetake}
            className="text-neutral-500 hover:text-white text-sm transition-colors">
            ← Retake
          </button>
          <span className="text-white text-sm font-medium">Edit strip</span>
          <div className="w-16" />
        </div>

        <div className="w-full max-w-sm">
          <StripEditor />
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3 pt-2">
          <button
            onClick={handleGenerate}
            className="w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-95 bg-white text-black hover:bg-neutral-100">
            Generate Strip →
          </button>
          <button
            onClick={handleRetake}
            className="w-full py-3 rounded-2xl border border-neutral-800 text-neutral-400 text-sm transition-all hover:border-neutral-600 active:scale-95">
            Retake Photos
          </button>
        </div>
      </main>
    );
  }

  // ---- GENERATING ----
  if (step === "generating") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-neutral-400 text-sm">Developing your strip...</p>
      </main>
    );
  }

  // ---- DONE ----
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold">Strip siap! 🎉</h1>
        <p className="text-neutral-400 text-sm">Simpan atau edit lagi</p>
      </div>

      {resultDataUrl && (
        <div className="relative w-full max-w-[220px] shadow-2xl shadow-black/60 rounded-xl overflow-hidden">
          <Image
            src={resultDataUrl}
            alt="Photo strip result"
            width={400}
            height={1148}
            className="w-full h-auto"
            unoptimized
          />
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={handleDownload}
          className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-base transition-all active:scale-95">
          Download PNG
        </button>
        <button
          onClick={() => setStep("editing")}
          className="w-full py-3 rounded-2xl border border-neutral-800 text-neutral-400 text-sm transition-all hover:border-neutral-600 active:scale-95">
          ← Edit lagi
        </button>
        <button
          onClick={handleRetake}
          className="w-full py-3 rounded-2xl border border-neutral-800 text-neutral-400 text-sm transition-all hover:border-neutral-600 active:scale-95">
          Retake Photos
        </button>
        <Link
          href="/"
          className="text-center text-neutral-600 hover:text-white text-sm transition-colors py-2">
          ← Kembali ke home
        </Link>
      </div>
    </main>
  );
}
