"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-14"
      style={{
        background: "#f5f2ee",
        position: "relative",
        overflow: "hidden",
      }}>
      {/* Dekorasi lingkaran */}
      <div
        className="pointer-events-none"
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          border: "1px solid #1a1a1a18",
          top: -140,
          right: -100,
        }}
      />
      <div
        className="pointer-events-none"
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: "1px solid #1a1a1a18",
          bottom: -80,
          left: -60,
        }}
      />

      <div
        className="relative w-full max-w-sm flex flex-col items-center"
        style={{ animation: "fadeUp 0.4s ease-out both" }}>
        {/* Live pill */}
        <div
          className="flex items-center gap-2 mb-7"
          style={{
            background: "#1a1a1a",
            color: "#f5f2ee",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.5px",
            padding: "5px 14px",
            borderRadius: 100,
          }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#a8ff78",
              display: "inline-block",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          ready to shoot
        </div>

        {/* Hero */}
        <div className="text-center mb-9">
          <p
            style={{
              fontSize: 13,
              fontStyle: "italic",
              color: "#888",
              marginBottom: 4,
              fontFamily: "var(--font-dm-sans)",
            }}>
            your instant
          </p>
          <h1
            style={{
              fontSize: "clamp(52px, 16vw, 72px)",
              fontWeight: 700,
              lineHeight: 0.92,
              letterSpacing: "-3px",
              color: "#1a1a1a",
              fontFamily: "var(--font-dm-sans)",
            }}>
            photo<em style={{ fontStyle: "italic" }}>booth</em>
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#888",
              marginTop: 14,
              lineHeight: 1.6,
              fontFamily: "var(--font-dm-sans)",
            }}>
            4 shots. your vibe.
            <br />
            download in seconds.
          </p>
        </div>

        {/* Steps */}
        <div className="flex gap-2 w-full mb-7">
          {[
            { num: "01", label: "Ambil 4 foto" },
            { num: "02", label: "Edit & filter" },
            { num: "03", label: "Download strip" },
          ].map(({ num, label }) => (
            <div
              key={num}
              className="flex-1 flex flex-col gap-1.5"
              style={{
                background: "#fff",
                border: "1px solid #e8e4de",
                borderRadius: 16,
                padding: "14px 12px",
              }}>
              <span
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 10,
                  color: "#bbb",
                }}>
                {num}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#1a1a1a",
                  lineHeight: 1.3,
                }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/booth"
          className="w-full flex items-center justify-center gap-2 transition-transform active:scale-95 hover:scale-[1.01]"
          style={{
            background: "#1a1a1a",
            color: "#f5f2ee",
            fontSize: 15,
            fontWeight: 600,
            padding: "16px",
            borderRadius: 14,
            fontFamily: "var(--font-dm-sans)",
            textDecoration: "none",
          }}>
          Mulai Foto <span style={{ transition: "transform 0.15s" }}>→</span>
        </Link>

        {/* Footer */}
        <p
          style={{
            fontSize: 11,
            color: "#bbb",
            marginTop: 20,
            textAlign: "center",
            fontFamily: "var(--font-dm-mono)",
          }}>
          kamera diperlukan · foto tersimpan di perangkatmu
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </main>
  );
}
