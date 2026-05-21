// components/BackgroundPicker.tsx

"use client";

import { useRef } from "react";
import { useBoothStore, BG_PRESETS } from "@/store/useBoothStore";
import type { CustomBackground } from "@/types";

const ACCEPTED = "image/png,image/jpeg,image/webp";
const MAX_MB = 10;

export default function BackgroundPicker() {
  const { customBackground, bgColor, setCustomBackground, setBgColor } =
    useBoothStore();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`File terlalu besar. Maks ${MAX_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const bg: CustomBackground = { dataUrl, filename: file.name };
      setCustomBackground(bg);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-neutral-500 tracking-widest uppercase">
        Background
      </p>

      {/* Preset warna solid */}
      <div className="flex gap-2 flex-wrap">
        {BG_PRESETS.map((preset) => {
          const isActive = !customBackground && bgColor === preset.color;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setCustomBackground(null);
                setBgColor(preset.color);
              }}
              title={preset.label}
              className={`
                w-9 h-9 rounded-lg border-2 transition-all duration-150
                ${
                  isActive
                    ? "border-white scale-110 shadow-lg"
                    : "border-transparent hover:border-neutral-500"
                }
              `}
              style={{ backgroundColor: preset.color }}
            />
          );
        })}

        {/* Upload custom */}
        <button
          onClick={() => inputRef.current?.click()}
          title="Upload gambar background"
          className={`
            w-9 h-9 rounded-lg border-2 transition-all duration-150 text-base
            flex items-center justify-center bg-white/5 hover:bg-white/15
            ${
              customBackground
                ? "border-white scale-110"
                : "border-transparent hover:border-neutral-500"
            }
          `}>
          🖼️
        </button>
      </div>

      {/* Preview kalau custom background aktif */}
      {customBackground && (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={customBackground.dataUrl}
              alt="bg preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate">
              {customBackground.filename}
            </p>
            <p className="text-xs text-neutral-500">Custom background</p>
          </div>
          <button
            onClick={() => {
              setCustomBackground(null);
              setBgColor("#ffffff");
            }}
            className="text-neutral-500 hover:text-red-400 transition-colors text-xl leading-none">
            ×
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleInputChange}
        className="hidden"
      />

      <p className="text-xs text-neutral-600">
        Upload foto/pattern sebagai background strip
      </p>
    </div>
  );
}
