"use client";

import { useEffect, useCallback } from "react";
import type { MissionImage } from "@/lib/nasa";

type Props = {
  images: MissionImage[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
};

export default function Lightbox({ images, index, onClose, onIndex }: Props) {
  const img = images[index];

  const go = useCallback(
    (dir: number) => {
      const n = (index + dir + images.length) % images.length;
      onIndex(n);
    },
    [index, images.length, onIndex]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  if (!img) return null;
  const date = img.date ? new Date(img.date).toLocaleDateString() : null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={img.title}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white/90 transition hover:bg-white/20"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white/90 transition hover:bg-white/20 sm:left-6"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white/90 transition hover:bg-white/20 sm:right-6"
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}

      {/* Figure */}
      <figure className="flex max-h-full w-full max-w-5xl flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.hd}
          alt={img.title}
          className="max-h-[72vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />
        <figcaption className="w-full max-w-3xl text-center">
          <p className="text-sm font-semibold text-white">{img.title}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-white/45">
            {[img.center, date].filter(Boolean).join(" · ")} · {index + 1}/{images.length}
          </p>
          {img.description && (
            <p className="mx-auto mt-2 line-clamp-3 max-w-2xl text-xs leading-relaxed text-white/55">
              {img.description}
            </p>
          )}
        </figcaption>
      </figure>
    </div>
  );
}
