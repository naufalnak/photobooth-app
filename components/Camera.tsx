"use client";

import { useEffect, useRef, useState } from "react";
import { startCamera, stopCamera } from "@/lib/camera";

type CameraStatus = "loading" | "ready" | "error";

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

  const [status, setStatus] = useState<CameraStatus>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function init() {
      if (!videoRef.current) return;

      try {
        stream = await startCamera(videoRef.current);
        if (streamRef) streamRef.current = stream;
        setStatus("ready");
        onReady?.();
      } catch (err) {
        const msg =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access."
            : "Could not access camera. Make sure no other app is using it.";
        setErrorMsg(msg);
        setStatus("error");
      }
    }

    init();

    return () => {
      stopCamera(stream);
      if (streamRef) streamRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`
          w-full h-full object-cover scale-x-[-1]
          transition-opacity duration-500
          ${status === "ready" ? "opacity-100" : "opacity-0"}
        `}
      />

      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-neutral-400 text-sm">Starting camera...</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="text-3xl">🚫</span>
          <p className="text-red-400 text-sm">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-neutral-400 underline underline-offset-2 mt-1">
            Try again
          </button>
        </div>
      )}

      {status === "ready" && <ViewfinderGuides />}
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
        <div key={i} className={`absolute w-6 h-6 border-white/40 ${cls}`} />
      ))}
    </>
  );
}
