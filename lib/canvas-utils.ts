// lib/canvas-utils.ts
import { applyFilter } from "@/lib/filters";
import type { PhotoSession, Template, PlacedSticker } from "@/types";

// ============================================
// LAYOUT
// ============================================
const STRIP_WIDTH = 400;
const PHOTO_WIDTH = 340;
const PHOTO_HEIGHT = 255; // rasio 4:3
const PHOTO_GAP = 12;
const PADDING_X = 30; // padding kiri-kanan foto
const PADDING_TOP = 40; // ruang atas (untuk teks/dekorasi)
const PADDING_BOTTOM = 56; // ruang bawah (untuk label)

function getStripHeight(photoCount: number): number {
  return (
    PADDING_TOP +
    photoCount * PHOTO_HEIGHT +
    (photoCount - 1) * PHOTO_GAP +
    PADDING_BOTTOM
  );
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ============================================
// DRAW BACKGROUND
// Bisa gambar custom atau warna solid
// ============================================
async function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  session: PhotoSession,
  bgColor: string,
): Promise<void> {
  if (session.customBackground) {
    // Gambar custom — stretch ke full strip
    try {
      const img = await loadImage(session.customBackground.dataUrl);
      ctx.drawImage(img, 0, 0, width, height);
    } catch {
      // Fallback ke warna solid kalau gagal load
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    // Warna solid
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }
}

// ============================================
// DRAW SATU FOTO
// ============================================
async function drawPhoto(
  ctx: CanvasRenderingContext2D,
  dataUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
  filter: PhotoSession["filter"],
): Promise<void> {
  const img = await loadImage(dataUrl);

  // Tanpa filter
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 6);
  ctx.clip();
  ctx.drawImage(img, x, y, width, height);
  ctx.restore();

  // Dengan filter — pakai offscreen canvas
  if (filter !== "none") {
    const off = document.createElement("canvas");
    off.width = width;
    off.height = height;
    const offCtx = off.getContext("2d")!;
    offCtx.drawImage(img, 0, 0, width, height);
    applyFilter(offCtx, width, height, filter);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 6);
    ctx.clip();
    ctx.drawImage(off, x, y);
    ctx.restore();
  }
}

// ============================================
// DRAW STICKERS
// ============================================
function drawPlacedStickers(
  ctx: CanvasRenderingContext2D,
  stickers: PlacedSticker[],
  canvasWidth: number,
  canvasHeight: number,
): void {
  if (stickers.length === 0) return;
  ctx.font = "32px serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 4;
  for (const s of stickers) {
    const x = (s.x / 100) * canvasWidth;
    const y = (s.y / 100) * canvasHeight;
    ctx.fillText(s.emoji, x, y);
  }
  ctx.shadowBlur = 0;
}

// ============================================
// GENERATE IMAGE — fungsi utama
// ============================================
export async function generateImage(
  session: PhotoSession,
  template: Template,
  bgColor = "#ffffff",
): Promise<string> {
  const photoCount = session.images.length;
  const stripHeight = getStripHeight(photoCount);

  const canvas = document.createElement("canvas");
  canvas.width = STRIP_WIDTH;
  canvas.height = stripHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  // 1. Background (gambar atau warna solid)
  await drawBackground(ctx, STRIP_WIDTH, stripHeight, session, bgColor);

  // 2. Foto di atas background
  for (let i = 0; i < photoCount; i++) {
    const x = PADDING_X;
    const y = PADDING_TOP + i * (PHOTO_HEIGHT + PHOTO_GAP);
    await drawPhoto(
      ctx,
      session.images[i],
      x,
      y,
      PHOTO_WIDTH,
      PHOTO_HEIGHT,
      session.filter,
    );
  }

  // 3. Stickers
  drawPlacedStickers(ctx, session.placedStickers, STRIP_WIDTH, stripHeight);

  return canvas.toDataURL("image/png");
}

export function downloadImage(dataUrl: string, filename = "photobooth.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
