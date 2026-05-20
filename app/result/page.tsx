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
    selectedTemplate,
    setFinalSession,
    resetAll,
  } = useBoothStore();

  const [step, setStep] = useState<ResultStep>("editing");
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!finalSession) router.replace("/");
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
      };

      setFinalSession(updatedSession);

      const dataUrl = await generateImage(updatedSession, template);
      setResultDataUrl(dataUrl);
      setStep("done");
    } catch (err) {
      console.error(err);
      setError("Failed to generate photo strip.");
      setStep("editing");
    }
  }, [finalSession, selectedFilter, placedStickers]);

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
      <main className="min-h-screen flex flex-col items-center px-4 py-10 gap-6">
        <div className="w-full max-w-sm flex items-center justify-between">
          <button
            onClick={handleRetake}
            className="text-neutral-500 hover:text-white text-sm transition-colors">
            ← Retake
          </button>
          <span className="text-white text-sm font-medium">
            Edit your strip
          </span>
          <div className="w-12" />
        </div>

        <StripEditor />

        <button
          onClick={handleGenerate}
          className="w-full max-w-sm py-4 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: selectedTemplate.accentColor,
            color: selectedTemplate.bgColor,
          }}>
          Generate Strip →
        </button>
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
        <h1 className="text-xl font-semibold">Your Strip</h1>
        <p className="text-neutral-400 text-sm">Looking good 📸</p>
      </div>

      {resultDataUrl && (
        <div className="relative w-full max-w-[260px] shadow-2xl shadow-black/60 rounded-xl overflow-hidden">
          <Image
            src={resultDataUrl}
            alt="Photo strip result"
            width={400}
            height={1000}
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
          className="w-full py-4 rounded-2xl border border-neutral-700 text-white font-semibold text-base transition-all hover:border-neutral-500 active:scale-95">
          ← Edit Again
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
