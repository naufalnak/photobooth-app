export async function startCamera(
  videoEl: HTMLVideoElement,
  facingMode: "user" | "environment" = "user",
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
      width: { ideal: 1280 },
      height: { ideal: 1280 },
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
  facingMode: "user" | "environment" = "user",
): string {
  const vw = videoEl.videoWidth || 1280;
  const vh = videoEl.videoHeight || 720;

  const size = Math.min(vw, vh);
  const sx = (vw - size) / 2;
  const sy = (vh - size) / 2;

  const OUTPUT = 640;
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT;
  canvas.height = OUTPUT;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  if (facingMode !== "environment") {
    ctx.translate(OUTPUT, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(videoEl, sx, sy, size, size, 0, 0, OUTPUT, OUTPUT);

  return canvas.toDataURL("image/png");
}
