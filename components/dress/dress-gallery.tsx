"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface DressGalleryProps {
  images: { id: string; url: string; alt_text?: string | null }[];
  title: string;
}

/**
 * Image gallery with a main 4:5 frame and a thumbnail strip. Click a thumb to
 * swap the main image. Plain — no lightbox tonight; that's a polish iteration.
 */
export function DressGallery({ images, title }: DressGalleryProps) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [{ id: "placeholder", url: "", alt_text: title }];
  const current = list[active] ?? list[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-soft-blush">
        {current.url ? (
          <Image
            src={current.url}
            alt={current.alt_text ?? title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-charcoal/40">
            No image
          </div>
        )}
      </div>
      {list.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {list.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border bg-soft-blush",
                active === i ? "border-rose-gold" : "border-charcoal/10",
              )}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={img.alt_text ?? `${title} ${i + 1}`}
                  fill
                  sizes="20vw"
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
