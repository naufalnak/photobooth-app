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
        customText: null,
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
  const countdown = useBoothStore((s) => s.countdown);

  // Shared camera area — satu instance, layout berubah via CSS
  const cameraArea = (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Camera
        videoRef={videoRef}
        streamRef={streamRef}
        onReady={() => setIsCameraReady(true)}
      />
      <CountdownDisplay
        count={countdown}
        isActive={captureStatus === "countdown"}
      />
      {isFlashing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#fff",
            borderRadius: 16,
            zIndex: 20,
            pointerEvents: "none",
          }}
        />
      )}
      {captureStatus === "processing" && <ProcessingOverlay />}
    </div>
  );

  const captureBtn = (
    <CaptureButton
      onClick={handleStartCapture}
      disabled={!isCameraReady || isCapturing}
      isCapturing={isCapturing}
      photoCount={photoCount}
    />
  );

  const progressDots = (
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
  );

  const backLink = (
    <Link
      href="/"
      style={{
        fontSize: 13,
        color: "#888",
        textDecoration: "none",
        fontFamily: "var(--font-dm-sans)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}>
      ← back
    </Link>
  );

  const counter = (
    <span
      style={{
        fontSize: 12,
        color: "#888",
        fontFamily: "var(--font-dm-mono)",
      }}>
      {photoCount}/4
    </span>
  );

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#f5f2ee",
        fontFamily: "var(--font-dm-sans)",
      }}>
      {/* == PORTRAIT == */}
      <div
        className="booth-portrait"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 16px",
          gap: 20,
          minHeight: "100dvh",
        }}>
        {/* Header */}
        <div
          style={{
            width: "100%",
            maxWidth: 384,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          {backLink}
          {progressDots}
          {counter}
        </div>

        {/* Camera */}
        <div style={{ width: "100%", maxWidth: 384 }}>{cameraArea}</div>

        {/* Strip */}
        <div style={{ width: "100%", maxWidth: 384 }}>
          <PhotoStrip photos={photos} />
        </div>

        {/* CTA */}
        <div style={{ width: "100%", maxWidth: 384 }}>{captureBtn}</div>
      </div>

      {/* == LANDSCAPE == */}
      <div
        className="booth-landscape"
        style={{
          display: "none",
          padding: "12px 20px",
          gap: 20,
          minHeight: "100dvh",
          alignItems: "stretch",
        }}>
        {/* Kiri — kamera */}
        <div
          style={{
            flex: "0 0 55%",
            display: "flex",
            flexDirection: "column",
          }}>
          {cameraArea}
        </div>

        {/* Kanan — kontrol */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 12,
          }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            {backLink}
            {counter}
          </div>

          {/* Dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: i < photoCount ? 28 : 10,
                  height: 10,
                  borderRadius: 100,
                  background: i < photoCount ? "#1a1a1a" : "#1a1a1a22",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Strip */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <PhotoStrip photos={photos} />
          </div>

          {/* CTA */}
          {captureBtn}
        </div>
      </div>

      <style>{`
        @media (orientation: landscape) and (max-height: 500px) {
          .booth-portrait  { display: none !important; }
          .booth-landscape { display: flex !important; }
        }
        @media (orientation: portrait) {
          .booth-portrait  { display: flex !important; }
          .booth-landscape { display: none !important; }
        }
      `}</style>
    </main>
  );
}

// ============================================
// SUB COMPONENTS
// ============================================

function ProcessingOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 16,
        zIndex: 20,
        background: "rgba(245,242,238,0.85)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}>
      <div
        style={{
          width: 28,
          height: 28,
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
  );
}

function CaptureButton({
  onClick,
  disabled,
  isCapturing,
  photoCount,
}: {
  onClick: () => void;
  disabled: boolean;
  isCapturing: boolean;
  photoCount: number;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "15px",
        background: disabled ? "#1a1a1a44" : "#1a1a1a",
        color: "#f5f2ee",
        fontSize: 15,
        fontWeight: 600,
        border: "none",
        borderRadius: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-dm-sans)",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(1.01)";
      }}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.98)";
      }}
      onMouseUp={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(1.01)";
      }}>
      {isCapturing ? `taking photo ${photoCount + 1} of 4...` : "Mulai Foto →"}
    </button>
  );
}
