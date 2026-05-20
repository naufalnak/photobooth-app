"use client";

import { useRef, useEffect, useCallback } from "react";
import { useBoothStore, STICKERS } from "@/store/useBoothStore";
import type { PlacedSticker } from "@/types";
import { applyFilter } from "@/lib/filters";

// ============================================
// STRIP EDITOR
// Preview live dengan filter + sticker draggable
// ============================================
export default function StripEditor() {
  const {
    finalSession,
    selectedFilter,
    placedStickers,
    addPlacedSticker,
    movePlacedSticker,
    removePlacedSticker,
  } = useBoothStore();

  const containerRef = useRef<HTMLDivElement>(null);

  if (!finalSession) return null;

  const handleAddSticker = (emoji: string, stickerId: string) => {
    const newSticker: PlacedSticker = {
      instanceId: crypto.randomUUID(),
      stickerId,
      emoji,
      x: 50, // tengah
      y: 50,
    };
    addPlacedSticker(newSticker);
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-5">
      {/* Preview strip dengan filter live */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden"
        style={{ background: "#111" }}>
        <StripPreviewCanvas
          images={finalSession.images}
          filter={selectedFilter}
        />

        {/* Sticker layer — di atas canvas */}
        {placedStickers.map((sticker) => (
          <DraggableSticker
            key={sticker.instanceId}
            sticker={sticker}
            containerRef={containerRef}
            onMove={movePlacedSticker}
            onRemove={removePlacedSticker}
          />
        ))}
      </div>

      {/* Filter selector */}
      <FilterButtons />

      {/* Sticker picker */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-neutral-500 tracking-widest uppercase">
          Add Sticker
        </p>
        <div className="flex gap-2 flex-wrap">
          {STICKERS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleAddSticker(s.emoji, s.id)}
              className="w-10 h-10 rounded-xl text-xl bg-white/5 hover:bg-white/15 transition-all active:scale-90"
              title={`Add ${s.label}`}>
              {s.emoji}
            </button>
          ))}
        </div>
        {placedStickers.length > 0 && (
          <p className="text-xs text-neutral-600">
            Drag stickers to reposition · Double tap to remove
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// STRIP PREVIEW — render foto dengan filter
// ============================================
function StripPreviewCanvas({
  images,
  filter,
}: {
  images: string[];
  filter: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 360;
    const PHOTO_H = 200;
    const GAP = 8;
    const PAD = 12;
    const totalH =
      PAD + images.length * PHOTO_H + (images.length - 1) * GAP + PAD;

    canvas.width = W;
    canvas.height = totalH;

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, W, totalH);

    for (let i = 0; i < images.length; i++) {
      const y = PAD + i * (PHOTO_H + GAP);

      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          // Rounded clip
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(0, y, W, PHOTO_H, 6);
          ctx.clip();
          ctx.drawImage(img, 0, y, W, PHOTO_H);
          ctx.restore();

          // Filter via offscreen
          if (filter !== "none") {
            const off = document.createElement("canvas");
            off.width = W;
            off.height = PHOTO_H;
            const offCtx = off.getContext("2d")!;
            offCtx.drawImage(img, 0, 0, W, PHOTO_H);
            applyFilter(offCtx, W, PHOTO_H, filter as never);

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(0, y, W, PHOTO_H, 6);
            ctx.clip();
            ctx.drawImage(off, 0, y);
            ctx.restore();
          }

          resolve();
        };
        img.src = images[i];
      });
    }
  }, [images, filter]);

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
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(2, Math.min(98, x)),
      y: Math.max(2, Math.min(98, y)),
    };
  };

  // ----- Mouse -----
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

  // ----- Touch -----
  const handleTouchStart = (e: React.TouchEvent) => {
    // Double tap → remove
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onRemove(sticker.instanceId);
      return;
    }
    lastTap.current = now;

    const touch = e.touches[0];
    isDragging.current = true;

    const handleMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDragging.current) return;
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
        fontSize: "32px",
        lineHeight: 1,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
        zIndex: 10,
      }}>
      {sticker.emoji}
    </div>
  );
}

// ============================================
// FILTER BUTTONS
// ============================================
function FilterButtons() {
  const { selectedFilter, setFilter } = useBoothStore();

  const filters = [
    { id: "none", label: "Normal" },
    { id: "grayscale", label: "B&W" },
    { id: "sepia", label: "Sepia" },
    { id: "vintage", label: "Vintage" },
  ] as const;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-neutral-500 tracking-widest uppercase">
        Filter
      </p>
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`
              flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-150
              ${
                selectedFilter === f.id
                  ? "bg-white text-black scale-105"
                  : "bg-white/10 text-neutral-400 hover:bg-white/15"
              }
            `}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
