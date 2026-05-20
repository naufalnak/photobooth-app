import { create } from "zustand";
import {
  type Photo,
  type Template,
  type FilterType,
  type Sticker,
  type PhotoSession,
  type CaptureStatus,
} from "@/types";

// ============================================
// TEMPLATE DATA (3 template bawaan)
// ============================================
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

// ============================================
// STICKER DATA
// ============================================
export const STICKERS: Sticker[] = [
  { id: "heart", emoji: "❤️", label: "Heart" },
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "sparkle", emoji: "✨", label: "Sparkle" },
  { id: "rainbow", emoji: "🌈", label: "Rainbow" },
  { id: "camera", emoji: "📷", label: "Camera" },
];

// ============================================
// STORE INTERFACE
// ============================================
interface BoothState {
  // Data
  photos: Photo[];
  selectedTemplate: Template;
  selectedFilter: FilterType;
  activeStickers: Sticker[];
  captureStatus: CaptureStatus;
  countdown: number;
  finalSession: PhotoSession | null;

  // Actions — Template
  setTemplate: (template: Template) => void;

  // Actions — Filter
  setFilter: (filter: FilterType) => void;

  // Actions — Sticker
  toggleSticker: (sticker: Sticker) => void;

  // Actions — Photos
  addPhoto: (photo: Photo) => void;
  clearPhotos: () => void;

  // Actions — Capture flow
  setCaptureStatus: (status: CaptureStatus) => void;
  setCountdown: (n: number) => void;

  // Actions — Session
  buildSession: () => PhotoSession;
  setFinalSession: (session: PhotoSession) => void;
  resetAll: () => void;
}

// ============================================
// DEFAULT STATE
// ============================================
const defaultState = {
  photos: [],
  selectedTemplate: TEMPLATES[0],
  selectedFilter: "none" as FilterType,
  activeStickers: [],
  captureStatus: "idle" as CaptureStatus,
  countdown: 3,
  finalSession: null,
};

// ============================================
// STORE
// ============================================
export const useBoothStore = create<BoothState>((set, get) => ({
  ...defaultState,

  setTemplate: (template) => set({ selectedTemplate: template }),

  setFilter: (filter) => set({ selectedFilter: filter }),

  toggleSticker: (sticker) =>
    set((state) => {
      const exists = state.activeStickers.find((s) => s.id === sticker.id);
      return {
        activeStickers: exists
          ? state.activeStickers.filter((s) => s.id !== sticker.id)
          : [...state.activeStickers, sticker],
      };
    }),

  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),

  clearPhotos: () => set({ photos: [] }),

  setCaptureStatus: (status) => set({ captureStatus: status }),

  setCountdown: (n) => set({ countdown: n }),

  // Fungsi ini nanti yang dikirim ke API
  buildSession: (): PhotoSession => {
    const { photos, selectedTemplate, selectedFilter, activeStickers } = get();
    return {
      id: crypto.randomUUID(),
      images: photos.map((p) => p.dataUrl),
      template: selectedTemplate.id,
      filter: selectedFilter,
      stickers: activeStickers,
      createdAt: new Date(),
    };
  },

  setFinalSession: (session) => set({ finalSession: session }),

  resetAll: () => set({ ...defaultState }),
}));
