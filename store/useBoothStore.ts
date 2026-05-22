// store/useBoothStore.ts
import { create } from "zustand";
import {
  type Photo,
  type Template,
  type FilterType,
  type PhotoSession,
  type CaptureStatus,
  type PlacedSticker,
  type CustomBackground,
  type CustomText,
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

export const BG_PRESETS = [
  { id: "white", color: "#ffffff", label: "White" },
  { id: "black", color: "#1a1a1a", label: "Black" },
  { id: "pink", color: "#fdf2f8", label: "Pink" },
  { id: "cream", color: "#fef9ef", label: "Cream" },
  { id: "mint", color: "#f0fdf4", label: "Mint" },
  { id: "lavender", color: "#f5f3ff", label: "Lavender" },
];

// Ukuran teks → pixel di canvas
export const TEXT_SIZE_MAP: Record<CustomText["size"], number> = {
  sm: 24,
  md: 36,
  lg: 52,
  xl: 68,
};

interface BoothState {
  photos: Photo[];
  selectedTemplate: Template;
  selectedFilter: FilterType;
  placedStickers: PlacedSticker[];
  customBackground: CustomBackground | null;
  customText: CustomText | null;
  bgColor: string;
  captureStatus: CaptureStatus;
  countdown: number;
  finalSession: PhotoSession | null;

  setTemplate: (template: Template) => void;
  setFilter: (filter: FilterType) => void;

  addPlacedSticker: (sticker: PlacedSticker) => void;
  movePlacedSticker: (instanceId: string, x: number, y: number) => void;
  removePlacedSticker: (instanceId: string) => void;
  clearPlacedStickers: () => void;

  setCustomBackground: (bg: CustomBackground | null) => void;
  setBgColor: (color: string) => void;

  setCustomText: (text: CustomText | null) => void;

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
  customBackground: null,
  customText: null,
  bgColor: "#ffffff",
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

  setCustomBackground: (bg) => set({ customBackground: bg }),
  setBgColor: (color) => set({ bgColor: color }),

  setCustomText: (text) => set({ customText: text }),

  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),

  clearPhotos: () => set({ photos: [] }),
  setCaptureStatus: (status) => set({ captureStatus: status }),
  setCountdown: (n) => set({ countdown: n }),

  buildSession: (): PhotoSession => {
    const {
      photos,
      selectedTemplate,
      selectedFilter,
      placedStickers,
      customBackground,
      customText,
    } = get();
    return {
      id: crypto.randomUUID(),
      images: photos.map((p) => p.dataUrl),
      template: selectedTemplate.id,
      filter: selectedFilter,
      placedStickers,
      customBackground,
      customText,
      createdAt: new Date(),
    };
  },

  setFinalSession: (session) => set({ finalSession: session }),
  resetAll: () => set({ ...defaultState }),
}));
