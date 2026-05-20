// ============================================
// FILTER
// ============================================
export type FilterType = "none" | "grayscale" | "sepia" | "vintage";

// ============================================
// STICKER
// ============================================
export interface Sticker {
  id: string;
  emoji: string;
  label: string;
}

// ============================================
// TEMPLATE / FRAME
// ============================================
export interface Template {
  id: string;
  name: string;
  description: string;
  bgColor: string; // warna background strip
  accentColor: string; // warna border/frame
  textColor: string; // warna teks label
}

// ============================================
// PHOTO
// ============================================
export interface Photo {
  id: string;
  dataUrl: string; // base64 hasil canvas capture
  filter: FilterType;
  takenAt: Date;
}

// ============================================
// SESSION (ini yang nanti dikirim ke API)
// ============================================
export interface PhotoSession {
  id: string;
  images: string[]; // array of dataUrl
  template: string; // template id
  filter: FilterType;
  stickers: Sticker[];
  createdAt: Date;
}

// ============================================
// CAPTURE STATE (progress saat ambil foto)
// ============================================
export type CaptureStatus =
  | "idle"
  | "countdown"
  | "capturing"
  | "processing"
  | "done";
