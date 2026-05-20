import { create } from "zustand";
import {
  type Photo,
  type Template,
  type FilterType,
  type PhotoSession,
  type CaptureStatus,
  type PlacedSticker,
} from "@/types";

export const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Timeless black & white strip",
    bgColor: "#1a1a1a",
    accentColor: "#ffffff",
    textColor: "#ffffff",
  },
  {
    id: "pastel",
    name: "Pastel Dream",
    description: "Soft pink & lavender vibes",
    bgColor: "#fdf2f8",
    accentColor: "#e879f9",
    textColor: "#86198f",
  },
  {
    id: "retro",
    name: "Retro",
    description: "Warm vintage film look",
    bgColor: "#1c1917",
    accentColor: "#f59e0b",
    textColor: "#fef3c7",
  },
];

export const STICKERS = [
  { id: "heart", emoji: "❤️", label: "Heart" },
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "sparkle", emoji: "✨", label: "Sparkle" },
  { id: "rainbow", emoji: "🌈", label: "Rainbow" },
  { id: "camera", emoji: "📷", label: "Camera" },
];

interface BoothState {
  photos: Photo[];
  selectedTemplate: Template;
  selectedFilter: FilterType;
  placedStickers: PlacedSticker[];
  captureStatus: CaptureStatus;
  countdown: number;
  finalSession: PhotoSession | null;

  setTemplate: (template: Template) => void;
  setFilter: (filter: FilterType) => void;

  addPlacedSticker: (sticker: PlacedSticker) => void;
  movePlacedSticker: (instanceId: string, x: number, y: number) => void;
  removePlacedSticker: (instanceId: string) => void;
  clearPlacedStickers: () => void;

  addPhoto: (photo: Photo) => void;
  clearPhotos: () => void;
  setCaptureStatus: (status: CaptureStatus) => void;
  setCountdown: (n: number) => void;

  buildSession: () => PhotoSession;
  setFinalSession: (session: PhotoSession) => void;
  resetAll: () => void;
}

const defaultState = {
  photos: [],
  selectedTemplate: TEMPLATES[0],
  selectedFilter: "none" as FilterType,
  placedStickers: [],
  captureStatus: "idle" as CaptureStatus,
  countdown: 3,
  finalSession: null,
};

export const useBoothStore = create<BoothState>((set, get) => ({
  ...defaultState,

  setTemplate: (template) => set({ selectedTemplate: template }),
  setFilter: (filter) => set({ selectedFilter: filter }),

  addPlacedSticker: (sticker) =>
    set((state) => ({ placedStickers: [...state.placedStickers, sticker] })),

  movePlacedSticker: (instanceId, x, y) =>
    set((state) => ({
      placedStickers: state.placedStickers.map((s) =>
        s.instanceId === instanceId ? { ...s, x, y } : s,
      ),
    })),

  removePlacedSticker: (instanceId) =>
    set((state) => ({
      placedStickers: state.placedStickers.filter(
        (s) => s.instanceId !== instanceId,
      ),
    })),

  clearPlacedStickers: () => set({ placedStickers: [] }),

  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),

  clearPhotos: () => set({ photos: [] }),

  setCaptureStatus: (status) => set({ captureStatus: status }),
  setCountdown: (n) => set({ countdown: n }),

  buildSession: (): PhotoSession => {
    const { photos, selectedTemplate, selectedFilter, placedStickers } = get();
    return {
      id: crypto.randomUUID(),
      images: photos.map((p) => p.dataUrl),
      template: selectedTemplate.id,
      filter: selectedFilter,
      placedStickers,
      createdAt: new Date(),
    };
  },

  setFinalSession: (session) => set({ finalSession: session }),

  resetAll: () => set({ ...defaultState }),
}));
