"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useBoothStore, STICKERS, BG_PRESETS } from "@/store/useBoothStore";
import type { PlacedSticker, CustomBackground } from "@/types";
import { applyFilter } from "@/lib/filters";

type EditorTab = "background" | "filter" | "sticker";

// ============================================
// HELPER FUNCTIONS (di luar komponen)
// ============================================
function randomPos() {
  return {
    x: 30 + Math.random() * 40,
    y: 20 + Math.random() * 60,
  };
}

function newSticker(emoji: string, stickerId: string) {
  return {
    instanceId: crypto.randomUUID(),
    stickerId,
    emoji,
    ...randomPos(),
  };
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function StripEditor() {
  const [activeTab, setActiveTab] = useState<EditorTab>("background");

  const TABS: { id: EditorTab; label: string }[] = [
    { id: "background", label: "Background" },
    { id: "filter", label: "Filter" },
    { id: "sticker", label: "Sticker" },
  ];

  return (
    <div className="w-full max-w-sm flex flex-col gap-0">
      {/* Sticky preview */}
      <StickyPreview />

      {/* Tab bar */}
      <div className="flex border-b border-neutral-800 mt-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-3 text-xs font-medium tracking-widest uppercase transition-all
              ${
                activeTab === tab.id
                  ? "text-white border-b-2 border-white -mb-px"
                  : "text-neutral-500 hover:text-neutral-300"
              }
            `}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-5 pb-2 min-h-[200px]">
        {activeTab === "background" && <BackgroundTab />}
        {activeTab === "filter" && <FilterTab />}
        {activeTab === "sticker" && <StickerTab />}
      </div>
    </div>
  );
}

// ============================================
// STICKY PREVIEW
// ============================================
function StickyPreview() {
  const {
    finalSession,
    selectedFilter,
    customBackground,
    bgColor,
    placedStickers,
  } = useBoothStore();

  const containerRef = useRef<HTMLDivElement>(null);

  if (!finalSession) return null;

  return (
    <div className="w-full flex justify-center">
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/60"
        style={{ width: "200px" }}>
        <StripCanvas
          images={finalSession.images}
          filter={selectedFilter}
          customBackgroundUrl={customBackground?.dataUrl ?? null}
          bgColor={bgColor}
          compact
        />

        {/* Sticker overlay di preview kecil */}
        {placedStickers.map((s) => (
          <div
            key={s.instanceId}
            className="absolute pointer-events-none select-none"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: "translate(-50%, -50%)",
              fontSize: "14px",
              lineHeight: 1,
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
            }}>
            {s.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// BACKGROUND TAB
// ============================================
function BackgroundTab() {
  const { customBackground, bgColor, setCustomBackground, setBgColor } =
    useBoothStore();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File terlalu besar. Maks 10MB.");
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

  return (
    <div className="flex flex-col gap-5">
      {/* Preset warna */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-neutral-500 tracking-widest uppercase">
          Warna solid
        </p>
        <div className="grid grid-cols-6 gap-2">
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
                  aspect-square rounded-xl border-2 transition-all duration-150
                  ${
                    isActive
                      ? "border-white scale-110 shadow-lg shadow-white/10"
                      : "border-transparent hover:border-neutral-600"
                  }
                `}
                style={{ backgroundColor: preset.color }}
              />
            );
          })}
        </div>
      </div>

      {/* Upload gambar */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-neutral-500 tracking-widest uppercase">
          Upload gambar
        </p>

        {!customBackground ? (
          <button
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className="w-full border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-6 flex flex-col items-center gap-2 transition-colors group">
            <span className="text-2xl group-hover:scale-110 transition-transform">
              🖼️
            </span>
            <p className="text-sm text-neutral-400">Tap untuk upload</p>
            <p className="text-xs text-neutral-600 text-center">
              JPG, PNG, WebP · Maks 10MB
            </p>
          </button>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={customBackground.dataUrl}
              alt="bg"
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">
                {customBackground.filename}
              </p>
              <p className="text-xs text-neutral-500">
                Custom background aktif
              </p>
            </div>
            <button
              onClick={() => {
                setCustomBackground(null);
                setBgColor("#ffffff");
              }}
              className="text-neutral-500 hover:text-red-400 transition-colors text-xl">
              ×
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="hidden"
        />
      </div>
    </div>
  );
}

// ============================================
// FILTER TAB
// ============================================
function FilterTab() {
  const { finalSession, selectedFilter, setFilter, customBackground, bgColor } =
    useBoothStore();

  const filters = [
    { id: "none", label: "Normal", desc: "No filter" },
    { id: "softglam", label: "Soft Glam", desc: "Bright & dreamy" },
    { id: "summer", label: "Summer Tan", desc: "Golden warm glow" },
    { id: "retroflash", label: "Retro Flash", desc: "Overexposed Y2K" },
    { id: "saturated", label: "Saturated", desc: "Vivid & punchy" },
    { id: "midnight", label: "Midnight", desc: "Dark & moody" },
    { id: "filmgrain", label: "Film Grain", desc: "Analog faded" },
    { id: "grayscale", label: "B&W", desc: "Classic mono" },
    { id: "sepia", label: "Sepia", desc: "Warm brown tone" },
    { id: "vintage", label: "Vintage", desc: "Old film" },
  ] as const;

  if (!finalSession) return null;

  return (
    <div className="grid grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => setFilter(f.id)}
          className={`
            relative flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-150
            ${
              selectedFilter === f.id
                ? "border-white scale-[1.02] shadow-lg shadow-white/10"
                : "border-neutral-800 hover:border-neutral-600"
            }
          `}>
          {/* Mini foto preview dengan filter */}
          <FilterPreviewCanvas dataUrl={finalSession.images[0]} filter={f.id} />

          {/* Label */}
          <div className="p-2 bg-neutral-900 text-left">
            <p
              className={`text-xs font-medium ${selectedFilter === f.id ? "text-white" : "text-neutral-400"}`}>
              {f.label}
            </p>
            <p className="text-xs text-neutral-600">{f.desc}</p>
          </div>

          {/* Checkmark */}
          {selectedFilter === f.id && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <span className="text-black text-xs font-bold">✓</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// Mini canvas untuk preview filter per kartu
function FilterPreviewCanvas({
  dataUrl,
  filter,
}: {
  dataUrl: string;
  filter: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 160;
    const H = 100;
    canvas.width = W;
    canvas.height = H;

    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, W, H);
        if (filter !== "none") {
          applyFilter(ctx, W, H, filter as never);
        }
        resolve();
      };
      img.src = dataUrl;
    });
  }, [dataUrl, filter]);

  useEffect(() => {
    draw();
  }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-auto block" />;
}

// ============================================
// STICKER TAB
// ============================================
function StickerTab() {
  const {
    placedStickers,
    addPlacedSticker,
    removePlacedSticker,
    movePlacedSticker,
  } = useBoothStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { finalSession, selectedFilter, customBackground, bgColor } =
    useBoothStore();

  if (!finalSession) return null;

  // ✅ Fix: pakai newSticker() yang ada di luar komponen
  const handleAdd = (emoji: string, stickerId: string) => {
    addPlacedSticker(newSticker(emoji, stickerId));
  };

  // ✅ Update: Lock scroll saat touch di area strip
  const handleContainerTouchStart = () => {
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  };
  const handleContainerTouchEnd = () => {
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Sticker picker */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-neutral-500 tracking-widest uppercase">
          Pilih stiker
        </p>
        <div className="flex gap-2 flex-wrap">
          {STICKERS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleAdd(s.emoji, s.id)}
              className="w-12 h-12 rounded-xl text-2xl bg-white/5 hover:bg-white/15 transition-all active:scale-90 flex items-center justify-center"
              title={s.label}>
              {s.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Preview area dengan sticker draggable */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-neutral-500 tracking-widest uppercase">
          Atur posisi
        </p>
        {/* ✅ Update: Lock scroll saat interaksi di sini */}
        <div
          ref={containerRef}
          className="relative w-full rounded-xl overflow-hidden"
          style={{ aspectRatio: "440 / 1156" }}
          onTouchStart={handleContainerTouchStart}
          onTouchEnd={handleContainerTouchEnd}
          onTouchCancel={handleContainerTouchEnd}>
          <StripCanvas
            images={finalSession.images}
            filter={selectedFilter}
            customBackgroundUrl={customBackground?.dataUrl ?? null}
            bgColor={bgColor}
          />

          {placedStickers.map((s) => (
            <DraggableSticker
              key={s.instanceId}
              sticker={s}
              containerRef={containerRef}
              onMove={movePlacedSticker}
              onRemove={removePlacedSticker}
            />
          ))}
        </div>

        {placedStickers.length > 0 ? (
          <p className="text-xs text-neutral-600 text-center">
            Drag untuk pindah · Double tap untuk hapus
          </p>
        ) : (
          <p className="text-xs text-neutral-600 text-center">
            Tap stiker di atas untuk menambahkan
          </p>
        )}
      </div>

      {/* List stiker aktif */}
      {placedStickers.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-neutral-500 tracking-widest uppercase">
            Stiker aktif
          </p>
          <div className="flex gap-2 flex-wrap">
            {placedStickers.map((s) => (
              <div
                key={s.instanceId}
                className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                <span className="text-sm">{s.emoji}</span>
                <button
                  onClick={() => removePlacedSticker(s.instanceId)}
                  className="text-neutral-600 hover:text-red-400 transition-colors text-xs leading-none ml-1">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// STRIP CANVAS — dipakai di beberapa tempat
// ============================================
export function StripCanvas({
  images,
  filter,
  customBackgroundUrl,
  bgColor,
  compact = false,
}: {
  images: string[];
  filter: string;
  customBackgroundUrl: string | null;
  bgColor: string;
  compact?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 440;
    const PHOTO_W = 400;
    const PHOTO_H = 267; // 3:2 landscape
    const GAP = 10;
    const PAD_X = 20;
    const PAD_TOP = 36;
    const PAD_BOT = 52;
    const totalH =
      PAD_TOP + images.length * PHOTO_H + (images.length - 1) * GAP + PAD_BOT;

    canvas.width = W;
    canvas.height = totalH;

    // Background
    if (customBackgroundUrl) {
      await new Promise<void>((resolve) => {
        const bg = new Image();
        bg.onload = () => {
          ctx.drawImage(bg, 0, 0, W, totalH);
          resolve();
        };
        bg.onerror = () => {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, W, totalH);
          resolve();
        };
        bg.src = customBackgroundUrl;
      });
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, totalH);
    }

    // Foto
    for (let i = 0; i < images.length; i++) {
      const x = PAD_X;
      const y = PAD_TOP + i * (PHOTO_H + GAP);
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, PHOTO_W, PHOTO_H, 6);
          ctx.clip();
          ctx.drawImage(img, x, y, PHOTO_W, PHOTO_H);
          ctx.restore();

          if (filter !== "none") {
            const off = document.createElement("canvas");
            off.width = PHOTO_W;
            off.height = PHOTO_H;
            const offCtx = off.getContext("2d")!;
            offCtx.drawImage(img, 0, 0, PHOTO_W, PHOTO_H);
            applyFilter(offCtx, PHOTO_W, PHOTO_H, filter as never);
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, PHOTO_W, PHOTO_H, 6);
            ctx.clip();
            ctx.drawImage(off, x, y);
            ctx.restore();
          }
          resolve();
        };
        img.src = images[i];
      });
    }
  }, [images, filter, customBackgroundUrl, bgColor]);

  useEffect(() => {
    draw();
  }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-auto block" />;
}

// ============================================
// DRAGGABLE STICKER
// ============================================
function DraggableSticker({
  sticker,
  containerRef,
  onMove,
  onRemove,
}: {
  sticker: PlacedSticker;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}) {
  const isDragging = useRef(false);
  const lastTap = useRef(0);

  const getPercent = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(2, Math.min(98, ((clientY - rect.top) / rect.height) * 100)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const handleMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const pos = getPercent(e.clientX, e.clientY);
      if (pos) onMove(sticker.instanceId, pos.x, pos.y);
    };
    const handleUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onRemove(sticker.instanceId);
      return;
    }
    lastTap.current = now;
    isDragging.current = true;
    const handleMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const pos = getPercent(t.clientX, t.clientY);
      if (pos) onMove(sticker.instanceId, pos.x, pos.y);
    };
    const handleEnd = () => {
      isDragging.current = false;
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={() => onRemove(sticker.instanceId)}
      className="absolute select-none cursor-grab active:cursor-grabbing touch-none"
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        transform: "translate(-50%, -50%)",
        fontSize: "28px",
        lineHeight: 1,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
        zIndex: 10,
      }}>
      {sticker.emoji}
    </div>
  );
}
