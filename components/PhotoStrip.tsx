"use client";

import Image from "next/image";
import type { Photo } from "@/types";

interface PhotoStripProps {
  photos: Photo[];
  totalSlots?: number;
}

export default function PhotoStrip({
  photos,
  totalSlots = 4,
}: PhotoStripProps) {
  return (
    <div className="w-full flex gap-2">
      {[...Array(totalSlots)].map((_, i) => {
        const photo = photos[i];

        return (
          <div
            key={i}
            className={`
              relative flex-1 aspect-[4/3] rounded-lg overflow-hidden
              transition-all duration-300
              ${photo ? "opacity-100 scale-100" : "opacity-40 scale-95"}
            `}>
            {photo ? (
              <Image
                src={photo.dataUrl}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
              />
            ) : (
              /* Slot kosong */
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                <span className="text-neutral-600 text-xs font-medium">
                  {i + 1}
                </span>
              </div>
            )}

            {/* Badge nomor foto */}
            {photo && (
              <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">
                {i + 1}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
