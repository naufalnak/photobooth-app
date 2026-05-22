"use client";

import { useBoothStore } from "@/store/useBoothStore";
import type { CustomText } from "@/types";

const COLOR_PRESETS = [
  "#1a1a1a",
  "#ffffff",
  "#e24b4a",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#e879f9",
  "#888888",
];

const SIZE_OPTIONS: {
  value: CustomText["size"];
  label: string;
  preview: string;
}[] = [
  { value: "sm", label: "S", preview: "text-sm" },
  { value: "md", label: "M", preview: "text-base" },
  { value: "lg", label: "L", preview: "text-xl" },
  { value: "xl", label: "XL", preview: "text-3xl" },
];

export default function CustomTextEditor() {
  const { customText, setCustomText } = useBoothStore();

  const text = customText ?? {
    value: "",
    color: "#1a1a1a",
    size: "lg" as const,
  };

  const update = (patch: Partial<CustomText>) => {
    const updated = { ...text, ...patch };
    // Kalau teks kosong, clear
    setCustomText(updated.value.trim() === "" ? null : updated);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Input teks */}
      <div className="flex flex-col gap-2">
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "#888", fontFamily: "var(--font-dm-mono)" }}>
          Teks
        </p>
        <input
          type="text"
          value={text.value}
          onChange={(e) => update({ value: e.target.value })}
          placeholder="Tulis sesuatu..."
          maxLength={40}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 15,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 500,
            color: "#1a1a1a",
            background: "#fff",
            border: "1px solid #e8e4de",
            borderRadius: 12,
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e4de")}
        />
        <p
          style={{
            fontSize: 11,
            color: "#bbb",
            fontFamily: "var(--font-dm-mono)",
          }}>
          {text.value.length}/40
        </p>
      </div>

      {/* Ukuran */}
      <div className="flex flex-col gap-2">
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "#888", fontFamily: "var(--font-dm-mono)" }}>
          Ukuran
        </p>
        <div className="flex gap-2">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => update({ size: s.value })}
              style={{
                flex: 1,
                padding: "10px 0",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--font-dm-sans)",
                borderRadius: 10,
                border: "1px solid",
                borderColor: text.size === s.value ? "#1a1a1a" : "#e8e4de",
                background: text.size === s.value ? "#1a1a1a" : "#fff",
                color: text.size === s.value ? "#f5f2ee" : "#888",
                cursor: "pointer",
                transition: "all 0.15s",
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warna */}
      <div className="flex flex-col gap-2">
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "#888", fontFamily: "var(--font-dm-mono)" }}>
          Warna
        </p>
        <div className="flex gap-2 flex-wrap items-center">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => update({ color })}
              title={color}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: color,
                border:
                  text.color === color
                    ? "3px solid #1a1a1a"
                    : "2px solid #e8e4de",
                cursor: "pointer",
                transition: "transform 0.15s",
                transform: text.color === color ? "scale(1.15)" : "scale(1)",
                boxShadow:
                  color === "#ffffff" ? "inset 0 0 0 1px #e8e4de" : "none",
              }}
            />
          ))}

          {/* Custom color picker */}
          <label
            title="Pilih warna lain"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "2px dashed #ccc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              overflow: "hidden",
              position: "relative",
            }}>
            🎨
            <input
              type="color"
              value={text.color}
              onChange={(e) => update({ color: e.target.value })}
              style={{
                position: "absolute",
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            />
          </label>
        </div>
      </div>

      {/* Preview live */}
      {text.value.trim() !== "" && (
        <div
          style={{
            padding: "16px",
            background: "#fff",
            border: "1px solid #e8e4de",
            borderRadius: 12,
            textAlign: "center",
          }}>
          <p
            style={{
              color: text.color,
              fontSize:
                text.size === "sm"
                  ? 20
                  : text.size === "md"
                    ? 28
                    : text.size === "lg"
                      ? 38
                      : 50,
              fontFamily: "var(--font-italiana), serif", // ← Italiana
              lineHeight: 1.1,
              wordBreak: "break-word",
            }}>
            {text.value}
          </p>
        </div>
      )}

      {/* Clear button */}
      {customText && (
        <button
          onClick={() => setCustomText(null)}
          style={{
            fontSize: 12,
            color: "#e24b4a",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-dm-mono)",
            textAlign: "left",
            padding: 0,
          }}>
          × hapus teks
        </button>
      )}
    </div>
  );
}
