// ============================================
// FILTER
// ============================================
export type FilterType = "none" | "grayscale" | "sepia" | "vintage";

export interface Sticker {
  id: string;
  emoji: string;
  label: string;
}

export interface PlacedSticker {
  instanceId: string;
  stickerId: string;
  emoji: string;
  x: number; // persen 0–100 relatif terhadap preview container
  y: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
}

export interface Photo {
  id: string;
  dataUrl: string;
  filter: FilterType;
  takenAt: Date;
}

export interface PhotoSession {
  id: string;
  images: string[];
  template: string;
  filter: FilterType;
  placedStickers: PlacedSticker[];
  createdAt: Date;
}

export type CaptureStatus =
  | "idle"
  | "countdown"
  | "capturing"
  | "processing"
  | "done";
