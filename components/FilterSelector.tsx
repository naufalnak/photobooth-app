"use client";

import { useBoothStore } from "@/store/useBoothStore";
import type { FilterType } from "@/types";

const FILTERS: { id: FilterType; label: string; style: string }[] = [
  {
    id: "none",
    label: "Normal",
    style: "bg-gradient-to-br from-neutral-300 to-neutral-500",
  },
  {
    id: "grayscale",
    label: "B&W",
    style: "bg-gradient-to-br from-neutral-100 to-neutral-600 grayscale",
  },
  {
    id: "sepia",
    label: "Sepia",
    style: "bg-gradient-to-br from-amber-200 to-amber-800",
  },
  {
    id: "vintage",
    label: "Vintage",
    style: "bg-gradient-to-br from-orange-300 to-rose-800",
  },
];

export default function FilterSelector() {
  const { selectedFilter, setFilter } = useBoothStore();

  return (
    <div className="w-full">
      <p className="text-xs text-neutral-500 mb-2 tracking-widest uppercase">
        Filter
      </p>
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="flex flex-col items-center gap-1.5 flex-1">
            {/* Swatch */}
            <div
              className={`
                w-full h-10 rounded-lg transition-all duration-200
                ${f.style}
                ${
                  selectedFilter === f.id
                    ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-950 scale-105"
                    : "opacity-50 hover:opacity-80"
                }
              `}
            />
            {/* Label */}
            <span
              className={`text-xs transition-colors ${
                selectedFilter === f.id
                  ? "text-white font-medium"
                  : "text-neutral-500"
              }`}>
              {f.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
