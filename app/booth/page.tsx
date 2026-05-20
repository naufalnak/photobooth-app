"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Camera from "@/components/Camera";
import CountdownDisplay from "@/components/CountdownDisplay";
import PhotoStrip from "@/components/PhotoStrip";
import { captureSequence } from "@/lib/capture";
import { useBoothStore } from "@/store/useBoothStore";
import type { Photo } from "@/types";

export default function BoothPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const {
    photos,
    addPhoto,
    clearPhotos,
    captureStatus,
    setCaptureStatus,
    setCountdown,
    selectedFilter,
    selectedTemplate,
    buildSession,
    setFinalSession,
  } = useBoothStore();

  const isCapturing =
    captureStatus === "countdown" || captureStatus === "capturing";

  const triggerFlash = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);
  }, []);

  const handleStartCapture = useCallback(async () => {
    const videoEl = videoRef.current;
    if (!videoEl || isCapturing) return;

    clearPhotos();
    setCaptureStatus("countdown");

    try {
      await captureSequence(videoEl, {
        filter: selectedFilter,
        onCountdownTick: (n) => setCountdown(n),
        onPhotoTaken: (photo: Photo) => addPhoto(photo),
        onFlash: triggerFlash,
      });

      setCaptureStatus("processing");
      const session = buildSession();
      setFinalSession(session);

      setTimeout(() => router.push("/result"), 600);
    } catch (err) {
      console.error("Capture failed:", err);
      setCaptureStatus("idle");
    }
  }, [isCapturing, selectedFilter]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-5">
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between">
        <Link
          href="/"
          className="text-neutral-500 hover:text-white text-sm transition-colors">
          ← Back
        </Link>
        <span className="text-neutral-400 text-sm">
          {photos.length} / 4 photos
        </span>
      </div>

      {/* Camera */}
      <div className="relative w-full max-w-sm">
        <Camera
          videoRef={videoRef}
          streamRef={streamRef}
          onReady={() => setIsCameraReady(true)}
        />

        <CountdownDisplay
          count={useBoothStore((s) => s.countdown)}
          isActive={captureStatus === "countdown"}
        />

        {isFlashing && (
          <div className="absolute inset-0 bg-white rounded-2xl z-20 pointer-events-none" />
        )}

        {captureStatus === "processing" && (
          <div className="absolute inset-0 bg-black/60 rounded-2xl z-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white text-sm">Developing film...</p>
            </div>
          </div>
        )}
      </div>

      {/* Photo strip */}
      <div className="w-full max-w-sm">
        <PhotoStrip photos={photos} />
      </div>

      {/* Template info */}
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: selectedTemplate.accentColor }}
        />
        <span className="text-neutral-400 text-xs">
          {selectedTemplate.name} frame
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={handleStartCapture}
        disabled={!isCameraReady || isCapturing}
        className="w-full max-w-sm py-4 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          backgroundColor: selectedTemplate.accentColor,
          color: selectedTemplate.bgColor,
        }}>
        {isCapturing
          ? `Taking photo ${photos.length + 1} of 4...`
          : "Take Photos"}
      </button>
    </main>
  );
}
