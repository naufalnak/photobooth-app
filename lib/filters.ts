import type { FilterType } from "@/types";

export function applyFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: FilterType,
): void {
  if (filter === "none") return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (filter === "grayscale") {
      const avg = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = data[i + 1] = data[i + 2] = avg;
    }

    if (filter === "sepia") {
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }

    if (filter === "vintage") {
      data[i] = Math.min(255, r * 0.45 + g * 0.35 + b * 0.18 + 40);
      data[i + 1] = Math.min(255, r * 0.28 + g * 0.45 + b * 0.18 + 10);
      data[i + 2] = Math.min(255, r * 0.18 + g * 0.28 + b * 0.38 - 10);
    }

    // ✦ SUMMER TAN
    // Golden hour — boost warm tones, skin terlihat tan & glowing
    if (filter === "summer") {
      data[i] = Math.min(255, r * 1.15 + 15); // boost red
      data[i + 1] = Math.min(255, g * 1.05 + 5); // sedikit boost green
      data[i + 2] = Math.max(0, b * 0.8 - 10); // kurangi blue
    }

    // ✦ SOFT GLAM
    // Bright, soft, dreamy — contrast turun, highlight naik
    if (filter === "softglam") {
      // Lift shadows (raise blacks)
      const lift = 20;
      r = Math.min(255, r * 0.88 + lift);
      g = Math.min(255, g * 0.88 + lift);
      b = Math.min(255, b * 0.9 + lift);
      // Slight pink tint
      data[i] = Math.min(255, r + 8);
      data[i + 1] = Math.min(255, g + 2);
      data[i + 2] = Math.min(255, b + 6);
    }

    // ✦ RETRO FLASH
    // Overexposed, washed out, harsh flash — Instagram viral 2026
    if (filter === "retroflash") {
      // Boost brightness drastis + flatten contrast
      const flash = 45;
      data[i] = Math.min(255, r * 0.85 + flash);
      data[i + 1] = Math.min(255, g * 0.85 + flash);
      data[i + 2] = Math.min(255, b * 0.8 + flash + 10);
      // Slight blue-white cast
    }

    // ✦ MIDNIGHT
    // Dark, moody, cinematic — blue shadows, crushed blacks
    if (filter === "midnight") {
      // Crush shadows
      r = r * 0.75;
      g = g * 0.72;
      b = b * 0.85;
      // Blue tint di shadows
      data[i] = Math.max(0, r - 10);
      data[i + 1] = Math.max(0, g - 5);
      data[i + 2] = Math.min(255, b + 20);
    }

    // ✦ FILM GRAIN (warna, bukan noise — noise ditambah terpisah)
    // Faded, analog — lift blacks, kurangi saturation sedikit
    if (filter === "filmgrain") {
      // Faded look: lift shadows, compress highlights
      const faded = (v: number) => v * 0.82 + 22;
      r = faded(r);
      g = faded(g);
      b = faded(b);
      // Slight warm cast
      data[i] = Math.min(255, r + 6);
      data[i + 1] = Math.min(255, g + 2);
      data[i + 2] = Math.max(0, b - 4);
    }

    // ✦ SATURATED
    // Vivid, punchy, pop — boost saturation tinggi
    if (filter === "saturated") {
      const avg = (r + g + b) / 3;
      const factor = 1.6; // saturation multiplier
      data[i] = Math.min(255, Math.max(0, avg + (r - avg) * factor));
      data[i + 1] = Math.min(255, Math.max(0, avg + (g - avg) * factor));
      data[i + 2] = Math.min(255, Math.max(0, avg + (b - avg) * factor));
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Film grain — tambah noise overlay setelah putImageData
  if (filter === "filmgrain") {
    ctx.save();
    ctx.globalAlpha = 0.08;
    for (let x = 0; x < width; x += 2) {
      for (let y = 0; y < height; y += 2) {
        if (Math.random() > 0.5) {
          ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
