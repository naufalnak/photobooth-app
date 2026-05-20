import { applyFilter } from "@/lib/filters";
import type { PhotoSession, Template, PlacedSticker } from "@/types";

const STRIP_WIDTH = 400;
const PHOTO_WIDTH = 360;
const PHOTO_HEIGHT = 270;
const PHOTO_GAP = 12;
const PADDING_X = 20;
const PADDING_TOP = 28;
const PADDING_BOTTOM = 48;

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

// Posisi sticker dalam persen → koordinat canvas absolut
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
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 4;

  for (const sticker of stickers) {
    const x = (sticker.x / 100) * canvasWidth;
    const y = (sticker.y / 100) * canvasHeight;
    ctx.fillText(sticker.emoji, x, y);
  }

  ctx.shadowBlur = 0;
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  template: Template,
  stripHeight: number,
): void {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = template.accentColor + "88";
  ctx.font = "11px monospace";
  ctx.fillText(
    "✦  photobooth  ✦",
    STRIP_WIDTH / 2,
    stripHeight - PADDING_BOTTOM / 2 - 4,
  );
}

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

  ctx.fillStyle = template.bgColor;
  ctx.fillRect(0, 0, STRIP_WIDTH, stripHeight);

  ctx.strokeStyle = template.accentColor + "33";
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, STRIP_WIDTH - 16, stripHeight - 16);

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

  drawPlacedStickers(ctx, session.placedStickers, STRIP_WIDTH, stripHeight);
  drawLabel(ctx, template, stripHeight);

  return canvas.toDataURL("image/png");
}

export function downloadImage(dataUrl: string, filename = "photobooth.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
