import { captureFrame } from "@/lib/camera";
import type { Photo, FilterType } from "@/types";

// ============================================
// COUNTDOWN
// Jalankan callback tiap detik, resolve saat 0
// ============================================
export function runCountdown(
  seconds: number,
  onTick: (remaining: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    let remaining = seconds;
    onTick(remaining);

    const interval = setInterval(() => {
      remaining -= 1;
      onTick(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}

// ============================================
// CAPTURE SEQUENCE
// Ambil 4 foto dengan jeda countdown tiap foto
// ============================================
export async function captureSequence(
  videoEl: HTMLVideoElement,
  options: {
    totalPhotos?: number;
    countdownSeconds?: number;
    filter: FilterType;
    onCountdownTick: (n: number) => void;
    onPhotoTaken: (photo: Photo, index: number) => void;
    onFlash: () => void;
  },
): Promise<Photo[]> {
  const {
    totalPhotos = 4,
    countdownSeconds = 3,
    filter,
    onCountdownTick,
    onPhotoTaken,
    onFlash,
  } = options;

  const photos: Photo[] = [];

  for (let i = 0; i < totalPhotos; i++) {
    // Countdown sebelum tiap foto
    await runCountdown(countdownSeconds, onCountdownTick);

    // Flash effect
    onFlash();

    // Jeda singkat biar flash keliatan
    await new Promise((r) => setTimeout(r, 150));

    // Capture
    const dataUrl = captureFrame(videoEl);
    const photo: Photo = {
      id: crypto.randomUUID(),
      dataUrl,
      filter,
      takenAt: new Date(),
    };

    photos.push(photo);
    onPhotoTaken(photo, i);

    // Jeda antar foto (kecuali foto terakhir)
    if (i < totalPhotos - 1) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  return photos;
}
