export async function startCamera(
  videoEl: HTMLVideoElement,
  facingMode: "user" | "environment" = "user",
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
      aspectRatio: { ideal: 4 / 3 },
      width: { ideal: 1280 },
      height: { ideal: 960 },
    },
    audio: false,
  });

  videoEl.srcObject = stream;

  await new Promise<void>((resolve) => {
    videoEl.onloadedmetadata = () => resolve();
  });

  await videoEl.play();
  return stream;
}

export function stopCamera(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

export function captureFrame(
  videoEl: HTMLVideoElement,
  facingMode: "user" | "environment" = "user", // ← tambah parameter
): string {
  const width = videoEl.videoWidth || 1280;
  const height = videoEl.videoHeight || 960;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  if (facingMode !== "environment") {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(videoEl, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}
