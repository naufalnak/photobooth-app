import type { FilterType } from "@/types";

// ============================================
// APPLY FILTER KE CANVAS CONTEXT
// Dipanggil setelah drawImage, sebelum export
// ============================================
export function applyFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: FilterType,
): void {
  if (filter === "none") return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data; // Uint8ClampedArray [R,G,B,A, R,G,B,A, ...]

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (filter === "grayscale") {
      const avg = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }

    if (filter === "sepia") {
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }

    if (filter === "vintage") {
      // Sepia ringan + boost red + kurangi blue
      data[i] = Math.min(255, r * 0.45 + g * 0.35 + b * 0.18 + 40);
      data[i + 1] = Math.min(255, r * 0.28 + g * 0.45 + b * 0.18 + 10);
      data[i + 2] = Math.min(255, r * 0.18 + g * 0.28 + b * 0.38 - 10);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
