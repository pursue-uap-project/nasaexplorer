"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  youtubeId?: string;
  missionName: string;
  color: string;
  galleryTitle: string;
};

export default function MissionDetailGallery({
  images,
  youtubeId,
  missionName,
  color,
  galleryTitle,
}: Props) {
  const [playingVideo, setPlayingVideo] = useState(false);
  const galleryImages = images.slice(0, 4);
  const hasVideo = Boolean(youtubeId);

  return (
    <div className="bg-white/30 border-t border-white/40 px-4 sm:px-6 lg:px-10 py-8">
      <h3 className="text-foreground/35 text-xs font-mono uppercase tracking-widest mb-6">
        {galleryTitle}
      </h3>

      <div className={`grid gap-5 ${hasVideo ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>

        {/* ── YouTube player (only if youtubeId exists) ── */}
        {hasVideo && (
          <div className="flex flex-col gap-2">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-900 group shadow-md">
              {playingVideo ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={missionName}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                    alt={`${missionName} video`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 rounded-md px-2 py-1 backdrop-blur-sm">
                    <svg viewBox="0 0 24 24" fill="#FF0000" className="w-4 h-4">
                      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8z" />
                      <polygon fill="white" points="9.75,15.02 15.5,12 9.75,8.98" />
                    </svg>
                    <span className="text-white text-xs font-bold">NASA</span>
                  </div>
                  <button
                    onClick={() => setPlayingVideo(true)}
                    className="absolute inset-0 flex items-center justify-center"
                    aria-label="Play video"
                  >
                    <span
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-200 group-hover:scale-110"
                      style={{ background: color }}
                    >
                      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </button>
                </>
              )}
            </div>
            <p className="text-foreground/40 text-xs leading-snug px-0.5">
              Official NASA video · YouTube
            </p>
          </div>
        )}

        {/* ── Image grid ── */}
        <div className={`grid gap-3 ${hasVideo ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
          {galleryImages.length > 0
            ? galleryImages.map((src, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 shadow-sm group"
                >
                  <Image
                    src={src}
                    alt={`${missionName} ${i + 1}`}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <span className="absolute bottom-1.5 right-2 text-white/50 text-[10px] font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl aspect-video bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center"
                >
                  <span className="text-gray-300 text-xs font-mono">img {i + 1}</span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
