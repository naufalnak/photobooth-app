"use client";

interface CountdownDisplayProps {
  count: number;
  isActive: boolean;
}

export default function CountdownDisplay({
  count,
  isActive,
}: CountdownDisplayProps) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      {/* Backdrop blur ringan */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Angka */}
      <div
        key={count} // key berubah → trigger re-mount → animasi ulang
        className="relative text-white font-bold select-none"
        style={{
          fontSize: "clamp(80px, 25vw, 140px)",
          animation: "countPop 0.9s ease-out forwards",
          textShadow: "0 0 40px rgba(255,255,255,0.4)",
        }}>
        {count}
      </div>

      {/* Animasi via style tag — hindari config tambahan */}
      <style>{`
        @keyframes countPop {
          0%   { transform: scale(1.4); opacity: 0; }
          20%  { transform: scale(1);   opacity: 1; }
          80%  { transform: scale(1);   opacity: 1; }
          100% { transform: scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
