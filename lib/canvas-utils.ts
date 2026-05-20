import { applyFilter } from "@/lib/filters";
import type { PhotoSession, Template } from "@/types";

// ============================================
// LAYOUT CONSTANTS
// ============================================
const STRIP_WIDTH = 400;
const PHOTO_WIDTH = 360;
const PHOTO_HEIGHT = 270; // rasio 4:3
const PHOTO_GAP = 12;
const PADDING_X = 20;
const PADDING_TOP = 28;
const PADDING_BOTTOM = 48;
const HEADER_HEIGHT = 0; // bisa diisi nanti

// Total tinggi strip
function getStripHeight(photoCount: number): number {
  return (
    PADDING_TOP +
    HEADER_HEIGHT +
    photoCount * PHOTO_HEIGHT +
    (photoCount - 1) * PHOTO_GAP +
    PADDING_BOTTOM
  );
}

// ============================================
// LOAD IMAGE DARI dataUrl → HTMLImageElement
// ============================================
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ============================================
// DRAW SATU FOTO KE CANVAS
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

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 6);
  ctx.clip();
  ctx.drawImage(img, x, y, width, height);
  ctx.restore();

  // Apply filter di area foto — pakai offscreen canvas
  // supaya koordinat selalu mulai dari 0,0
  if (filter !== "none") {
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext("2d")!;
    offCtx.drawImage(img, 0, 0, width, height);
    applyFilter(offCtx, width, height, filter);

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 6);
    ctx.clip();
    ctx.drawImage(offscreen, x, y);
    ctx.restore();
  }
}

// ============================================
// DRAW LABEL BAWAH STRIP
// ============================================
function drawLabel(
  ctx: CanvasRenderingContext2D,
  template: Template,
  stripHeight: number,
): void {
  const centerX = STRIP_WIDTH / 2;
  const y = stripHeight - PADDING_BOTTOM / 2 - 4;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Titik dekorasi kiri kanan
  ctx.fillStyle = template.accentColor + "88";
  ctx.font = "11px monospace";
  ctx.fillText("✦  photobooth  ✦", centerX, y);
}

// ============================================
// GENERATE IMAGE — fungsi utama
// Ini yang nanti bisa dikirim ke API
// ============================================
export async function generateImage(
  session: PhotoSession,
  template: Template,
): Promise<string> {
  const photoCount = session.images.length;
  const stripHeight = getStripHeight(photoCount);

  const canvas = document.createElement("canvas");
  canvas.width = STRIP_WIDTH;
  canvas.height = stripHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  // 1. Background strip
  ctx.fillStyle = template.bgColor;
  ctx.fillRect(0, 0, STRIP_WIDTH, stripHeight);

  // 2. Border/frame tipis
  ctx.strokeStyle = template.accentColor + "33";
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, STRIP_WIDTH - 16, stripHeight - 16);

  // 3. Gambar tiap foto
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

  // 4. Label bawah
  drawLabel(ctx, template, stripHeight);

  return canvas.toDataURL("image/png");
}

// ============================================
// DOWNLOAD HELPER
// ============================================
export function downloadImage(dataUrl: string, filename = "photobooth.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
