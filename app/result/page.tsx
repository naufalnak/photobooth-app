"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useBoothStore, TEMPLATES } from "@/store/useBoothStore";
import { generateImage, downloadImage } from "@/lib/canvas-utils";
import StripEditor from "@/components/StripEditor";

type ResultStep = "editing" | "generating" | "done";

const baseMain: React.CSSProperties = {
  background: "#f5f2ee",
  fontFamily: "var(--font-dm-sans)",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  background: "#1a1a1a",
  color: "#f5f2ee",
  fontSize: 15,
  fontWeight: 600,
  border: "none",
  borderRadius: 14,
  cursor: "pointer",
  fontFamily: "var(--font-dm-sans)",
  transition: "transform 0.15s",
};

const btnSecondary: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  background: "#fff",
  color: "#1a1a1a",
  fontSize: 13,
  fontWeight: 500,
  border: "1px solid #e8e4de",
  borderRadius: 14,
  cursor: "pointer",
  fontFamily: "var(--font-dm-sans)",
  transition: "transform 0.15s",
};

export default function ResultPage() {
  const router = useRouter();

  const {
    finalSession,
    selectedFilter,
    placedStickers,
    customBackground,
    customText,
    bgColor,
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
        customText,
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
      <main
        className="min-h-screen flex flex-col items-center px-4 py-8 gap-5"
        style={baseMain}>
        {/* Header */}
        <div className="w-full max-w-sm flex items-center justify-between">
          <button
            onClick={handleRetake}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "#888",
              fontFamily: "var(--font-dm-sans)",
            }}>
            ← retake
          </button>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1a1a1a",
              fontFamily: "var(--font-dm-sans)",
            }}>
            edit strip
          </span>
          <div style={{ width: 56 }} />
        </div>

        {/* Editor */}
        <div className="w-full max-w-sm">
          <StripEditor />
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm flex flex-col gap-2 pt-1">
          <button
            onClick={handleGenerate}
            style={btnPrimary}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.01)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.98)")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.transform = "scale(1.01)")
            }>
            Generate Strip →
          </button>
          <button
            onClick={handleRetake}
            style={btnSecondary}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.01)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }>
            Retake Photos
          </button>
        </div>
      </main>
    );
  }

  // ---- GENERATING ----
  if (step === "generating") {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={baseMain}>
        {/* Spinner warna gelap */}
        <div
          style={{
            width: 36,
            height: 36,
            border: "2px solid #1a1a1a22",
            borderTopColor: "#1a1a1a",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p
          style={{
            fontSize: 13,
            color: "#888",
            fontFamily: "var(--font-dm-mono)",
          }}>
          developing your strip...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  // ---- DONE ----
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-6"
      style={baseMain}>
      {/* Header */}
      <div className="text-center" style={{ marginBottom: 4 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-1px",
            color: "#1a1a1a",
            fontFamily: "var(--font-dm-sans)",
            marginBottom: 4,
          }}>
          looking good 🎉
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#888",
            fontFamily: "var(--font-dm-sans)",
          }}>
          save or edit again
        </p>
      </div>

      {/* Preview strip */}
      {resultDataUrl && (
        <div
          style={{
            width: "100%",
            maxWidth: 220,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 20px 60px #1a1a1a22",
          }}>
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

      {error && (
        <p
          style={{
            fontSize: 13,
            color: "#e24b4a",
            fontFamily: "var(--font-dm-mono)",
          }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        <button
          onClick={handleDownload}
          style={btnPrimary}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.01)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.01)")}>
          Download PNG
        </button>

        <button
          onClick={() => setStep("editing")}
          style={btnSecondary}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.01)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
          ← Edit lagi
        </button>

        <button
          onClick={handleRetake}
          style={btnSecondary}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.01)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
          Retake Photos
        </button>

        <Link
          href="/"
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#bbb",
            textDecoration: "none",
            padding: "8px 0",
            fontFamily: "var(--font-dm-mono)",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#bbb")}>
          ← kembali ke home
        </Link>
      </div>
    </main>
  );
}
