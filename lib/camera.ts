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

  // Tunggu video siap — dengan fallback timeout
  await new Promise<void>((resolve) => {
    // Kalau sudah ada metadata, langsung resolve
    if (videoEl.readyState >= 2) {
      resolve();
      return;
    }

    const onReady = () => {
      videoEl.removeEventListener("loadedmetadata", onReady);
      videoEl.removeEventListener("loadeddata", onReady);
      resolve();
    };

    videoEl.addEventListener("loadedmetadata", onReady);
    videoEl.addEventListener("loadeddata", onReady);

    // Fallback: kalau 3 detik tidak ada event, tetap lanjut
    setTimeout(resolve, 3000);
  });

  // Play dengan error handling
  try {
    await videoEl.play();
  } catch {
    // Autoplay mungkin diblokir — coba lagi sekali
    videoEl.muted = true;
    await videoEl.play();
  }

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

  const targetRatio = 3 / 2;
  let cropW = vw;
  let cropH = vw / targetRatio;

  if (cropH > vh) {
    cropH = vh;
    cropW = vh * targetRatio;
  }

  const sx = (vw - cropW) / 2;
  const sy = (vh - cropH) / 2;

  const OUTPUT_W = 900;
  const OUTPUT_H = 600;

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_W;
  canvas.height = OUTPUT_H;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  if (facingMode !== "environment") {
    ctx.translate(OUTPUT_W, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(videoEl, sx, sy, cropW, cropH, 0, 0, OUTPUT_W, OUTPUT_H);
  return canvas.toDataURL("image/png");
}
