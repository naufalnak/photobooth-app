"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Camera from "@/components/Camera";
import CountdownDisplay from "@/components/CountdownDisplay";
import PhotoStrip from "@/components/PhotoStrip";
import { captureSequence } from "@/lib/capture";
import { useBoothStore } from "@/store/useBoothStore";
import type { Photo, PhotoSession } from "@/types";

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
      const capturedPhotos = await captureSequence(videoEl, {
        filter: selectedFilter,
        onCountdownTick: (n) => setCountdown(n),
        onPhotoTaken: (photo: Photo) => addPhoto(photo),
        onFlash: triggerFlash,
      });

      setCaptureStatus("processing");

      const session: PhotoSession = {
        id: crypto.randomUUID(),
        images: capturedPhotos.map((p) => p.dataUrl),
        template: selectedTemplate.id,
        filter: selectedFilter,
        placedStickers: [],
        customBackground: null,
        createdAt: new Date(),
      };

      setFinalSession(session);
      await new Promise((r) => setTimeout(r, 300));
      router.push("/result");
    } catch (err) {
      console.error("Capture failed:", err);
      setCaptureStatus("idle");
    }
  }, [isCapturing, selectedFilter, selectedTemplate]);

  const photoCount = photos.length;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-5"
      style={{ background: "#f5f2ee", fontFamily: "var(--font-dm-sans)" }}>
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between">
        <Link
          href="/"
          style={{
            fontSize: 13,
            color: "#888",
            textDecoration: "none",
            fontFamily: "var(--font-dm-sans)",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}>
          ← back
        </Link>

        {/* Progress dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: i < photoCount ? 20 : 8,
                height: 8,
                borderRadius: 100,
                background: i < photoCount ? "#1a1a1a" : "#1a1a1a22",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        <span
          style={{
            fontSize: 12,
            color: "#888",
            fontFamily: "var(--font-dm-mono)",
            minWidth: 48,
            textAlign: "right",
          }}>
          {photoCount}/4
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

        {/* Flash */}
        {isFlashing && (
          <div
            className="absolute inset-0 rounded-2xl z-20 pointer-events-none"
            style={{ background: "#fff" }}
          />
        )}

        {/* Processing overlay */}
        {captureStatus === "processing" && (
          <div
            className="absolute inset-0 rounded-2xl z-20 flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(245,242,238,0.85)" }}>
            <div
              style={{
                width: 32,
                height: 32,
                border: "2px solid #1a1a1a22",
                borderTopColor: "#1a1a1a",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p
              style={{
                fontSize: 12,
                color: "#888",
                fontFamily: "var(--font-dm-mono)",
              }}>
              developing film...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>

      {/* Photo strip preview */}
      <div className="w-full max-w-sm">
        <PhotoStrip photos={photos} />
      </div>

      {/* CTA */}
      <button
        onClick={handleStartCapture}
        disabled={!isCameraReady || isCapturing}
        style={{
          width: "100%",
          maxWidth: 384,
          padding: "16px",
          background: !isCameraReady || isCapturing ? "#1a1a1a44" : "#1a1a1a",
          color: "#f5f2ee",
          fontSize: 15,
          fontWeight: 600,
          border: "none",
          borderRadius: 14,
          cursor: !isCameraReady || isCapturing ? "not-allowed" : "pointer",
          fontFamily: "var(--font-dm-sans)",
          transition: "all 0.15s",
          letterSpacing: "0.2px",
        }}
        onMouseEnter={(e) => {
          if (isCameraReady && !isCapturing)
            e.currentTarget.style.transform = "scale(1.01)";
        }}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseDown={(e) => {
          if (isCameraReady && !isCapturing)
            e.currentTarget.style.transform = "scale(0.98)";
        }}
        onMouseUp={(e) => {
          if (isCameraReady && !isCapturing)
            e.currentTarget.style.transform = "scale(1.01)";
        }}>
        {isCapturing
          ? `taking photo ${photoCount + 1} of 4...`
          : "Mulai Foto →"}
      </button>
    </main>
  );
}
