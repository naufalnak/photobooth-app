"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { startCamera, stopCamera } from "@/lib/camera";

type CameraStatus = "loading" | "ready" | "error";
type FacingMode = "user" | "environment";

interface CameraProps {
  onReady?: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  streamRef?: React.MutableRefObject<MediaStream | null>;
}

export default function Camera({
  onReady,
  videoRef: externalRef,
  streamRef,
}: CameraProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalRef ?? internalRef;
  const facingModeRef = useRef<FacingMode>("user");

  const [status, setStatus] = useState<CameraStatus>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [isSwitching, setIsSwitching] = useState(false);
  const currentStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!videoRef.current) return;

      stopCamera(currentStreamRef.current);
      currentStreamRef.current = null;

      try {
        const stream = await startCamera(videoRef.current, facingMode);
        if (cancelled) return;

        facingModeRef.current = facingMode;
        currentStreamRef.current = stream;
        if (streamRef) streamRef.current = stream;

        setStatus("ready");
        setIsSwitching(false);
        onReady?.();
      } catch (err) {
        if (cancelled) return;

        const msg =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access."
            : "Could not access camera. Make sure no other app is using it.";

        setErrorMsg(msg);
        setStatus("error");
        setIsSwitching(false);
      }
    };

    // schedule status update and camera start asynchronously to avoid
    // triggering a synchronous setState within the effect body
    const id = window.setTimeout(() => {
      setStatus("loading");
      run();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(id);
      stopCamera(currentStreamRef.current);
      if (streamRef) streamRef.current = null;
    };
  }, [facingMode]);

  const handleFlip = useCallback(() => {
    if (isSwitching || status !== "ready") return;
    setIsSwitching(true);
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, [isSwitching, status]);

  return (
    <div className="relative w-full aspect-video bg-neutral-100 rounded-2xl overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transition-opacity duration-500"
        style={{
          opacity: status === "ready" ? 1 : 0,
          transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
        }}
      />

      {/* Loading */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
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
            {isSwitching ? "switching camera..." : "starting camera..."}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="text-3xl">🚫</span>
          <p
            style={{
              fontSize: 12,
              color: "#e24b4a",
              fontFamily: "var(--font-dm-sans)",
            }}>
            {errorMsg}
          </p>
          <button
            onClick={() => {
              setStatus("loading");
              setFacingMode((prev) => prev); // trigger re-run effect
            }}
            style={{
              fontSize: 11,
              color: "#888",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              fontFamily: "var(--font-dm-mono)",
            }}>
            try again
          </button>
        </div>
      )}

      {/* Viewfinder guides */}
      {status === "ready" && <ViewfinderGuides />}

      {/* Flip camera button */}
      {status === "ready" && (
        <button
          onClick={handleFlip}
          disabled={isSwitching}
          className="absolute bottom-3 right-3 z-10 transition-all active:scale-90"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.85)",
            border: "none",
            cursor: isSwitching ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            opacity: isSwitching ? 0.5 : 1,
            backdropFilter: "blur(4px)",
          }}
          title="Flip camera"
          aria-label="Switch camera">
          🔄
        </button>
      )}
    </div>
  );
}

function ViewfinderGuides() {
  const corners = [
    "top-3 left-3 border-t-2 border-l-2 rounded-tl-lg",
    "top-3 right-3 border-t-2 border-r-2 rounded-tr-lg",
    "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg",
    "bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg",
  ];

  return (
    <>
      {corners.map((cls, i) => (
        <div key={i} className={`absolute w-5 h-5 border-black/20 ${cls}`} />
      ))}
    </>
  );
}
