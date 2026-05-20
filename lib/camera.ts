// ============================================
// START CAMERA
// ============================================
export async function startCamera(
  videoEl: HTMLVideoElement,
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user", // kamera depan
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });

  videoEl.srcObject = stream;

  // Tunggu sampai video siap diplay
  await new Promise<void>((resolve) => {
    videoEl.onloadedmetadata = () => resolve();
  });

  await videoEl.play();
  return stream;
}

// ============================================
// STOP CAMERA
// ============================================
export function stopCamera(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

// ============================================
// CAPTURE FRAME → dataUrl
// ============================================
export function captureFrame(
  videoEl: HTMLVideoElement,
  width = 640,
  height = 480,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  // Mirror horizontal (efek selfie)
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoEl, 0, 0, width, height);

  return canvas.toDataURL("image/png");
}
