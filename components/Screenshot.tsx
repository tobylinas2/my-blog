"use client";

import { useState } from "react";

interface ScreenshotProps {
  images: string[];
  alt?: string;
}

export function Screenshot({ images, alt = "" }: ScreenshotProps) {
  const [idx, setIdx] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 my-6">
      <img
        src={images[idx]}
        alt={`${alt} ${idx + 1}/${images.length}`}
        className="w-full object-cover"
      />
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 rounded-full px-2 py-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === idx ? "bg-white" : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`View image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
