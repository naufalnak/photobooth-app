// types/index.ts
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
  x: number;
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

export interface CustomBackground {
  dataUrl: string;
  filename: string;
}

export interface PhotoSession {
  id: string;
  images: string[];
  template: string;
  filter: FilterType;
  placedStickers: PlacedSticker[];
  customBackground: CustomBackground | null;
  createdAt: Date;
}

export type CaptureStatus =
  | "idle"
  | "countdown"
  | "capturing"
  | "processing"
  | "done";
