"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import TrajectoryMap from "./TrajectoryMap";
import type { ActiveMission } from "@/lib/nasa";

type Props = {
  missions: ActiveMission[];
  images: Record<string, string[]>;
};

// Local hero assets — add more as you generate them with Midjourney
// Prompt reference for each:
// jwst:          "James Webb Space Telescope in deep space, gold hexagonal mirrors, Milky Way background, photorealistic, 16:9"
// perseverance:  "NASA Perseverance rover on Mars surface, red dust, dramatic sunset, photorealistic, 16:9"
// iss:           "International Space Station orbiting Earth, blue oceans below, sunlight glare, photorealistic, 16:9"
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const LOCAL_HEROES: Record<string, string> = {
  artemis: `${BASE}/assets/artemis-hero.png`,
};

export default function MissionSlider({ missions, images }: Props) {
  const t = useTranslations("active");
  const locale = useLocale() as "en" | "es";
  const [current, setCurrent] = useState(0);
  const [playingVideo, setPlayingVideo] = useState(false);

  const m = missions[current];
  const mImages = images[m.id] ?? [];
  const heroSrc = LOCAL_HEROES[m.id] ?? mImages[0] ?? null;
  // Gallery images: skip index 0 (used as hero fallback), take up to 4
  const galleryImages = LOCAL_HEROES[m.id] ? mImages.slice(0, 4) : mImages.slice(1, 5);

  function handleMissionChange(i: number) {
    setCurrent(i);
    setPlayingVideo(false);
  }

  return (
    <div>
      {/* ── Mission selector tabs ─────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {missions.map((mission, i) => (
          <button
            key={mission.id}
            onClick={() => handleMissionChange(i)}
            className={`shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
              current === i
                ? "text-white shadow-lg"
                : "bg-white/80 border-white/60 text-foreground/60 hover:bg-white hover:text-foreground/80 backdrop-blur-sm"
            }`}
            style={current === i ? { background: mission.color, borderColor: mission.color } : undefined}
          >
            {mission.name}
          </button>
        ))}
      </div>

      {/* ── Glassmorphism card ────────────────────────────────────────── */}
      <div
        key={m.id}
        className="rounded-3xl overflow-hidden bg-white/65 backdrop-blur-2xl border border-white/80 shadow-2xl ring-1 ring-inset ring-white/50"
        style={{ boxShadow: `0 25px 60px -10px ${m.color}18, 0 10px 30px -5px rgba(11,61,145,0.08)` }}
      >

        {/* ── SECTION 1: HERO IMAGE ────────────────────────────────────── */}
        <div className="relative h-[400px] w-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${m.color}22 0%, #0B3D9122 100%)` }}
          />
          {heroSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroSrc}
              alt={m.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(160deg, #0B3D91 0%, ${m.color} 100%)` }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

          {/* Badges */}
          <div className="absolute top-5 left-6">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full text-white backdrop-blur-sm"
              style={{ background: `${m.color}cc` }}
            >
              {m.program}
            </span>
          </div>
          <div className="absolute top-5 right-6">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-sm border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-xs font-mono uppercase tracking-wider">Active</span>
            </span>
          </div>

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 px-7 sm:px-10 pb-7">
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight drop-shadow-lg">
              {m.name}
            </h2>
            <p className="text-white/75 text-lg mt-1 drop-shadow">{m.tagline[locale]}</p>
          </div>
        </div>

        {/* ── SECTION 2: DATA PANELS ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-white/40">
          {/* Description */}
          <div className="lg:col-span-3 px-7 sm:px-10 py-8">
            <p className="text-foreground/65 leading-relaxed text-sm">{m.description[locale]}</p>
            {m.hasTrajectory && (
              <div className="mt-6">
                <h3 className="text-foreground/35 text-xs font-mono uppercase tracking-widest mb-3">
                  {t("trajectory_title")}
                </h3>
                <TrajectoryMap locale={locale} />
              </div>
            )}
          </div>

          {/* Telemetry */}
          <div className="lg:col-span-2 px-7 sm:px-10 py-8 bg-white/40">
            <h3 className="text-foreground/35 text-xs font-mono uppercase tracking-widest mb-5">
              {t("stats_title")}
            </h3>
            <dl className="space-y-0">
              {m.stats.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 py-2.5 border-b border-white/50 last:border-0"
                >
                  <dt className="text-foreground/45 text-xs uppercase tracking-wide shrink-0">{label}</dt>
                  <dd className="font-semibold text-sm text-right leading-tight" style={{ color: m.color }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* ── SECTION 3: MEDIA GALLERY ─────────────────────────────────── */}
        <div className="px-7 sm:px-10 py-8 bg-white/30 border-t border-white/40">
          <h3 className="text-foreground/35 text-xs font-mono uppercase tracking-widest mb-6">
            {t("gallery_title")}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* — YouTube video card — */}
            <div className="flex flex-col gap-2">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-900 group shadow-md">
                {playingVideo ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${m.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                    title={m.name}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    {/* YouTube thumbnail */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${m.youtubeId}/maxresdefault.jpg`}
                      alt={`${m.name} video`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
                    {/* YouTube branding strip */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 rounded-md px-2 py-1 backdrop-blur-sm">
                      <svg viewBox="0 0 24 24" fill="#FF0000" className="w-4 h-4">
                        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8z"/>
                        <polygon fill="white" points="9.75,15.02 15.5,12 9.75,8.98"/>
                      </svg>
                      <span className="text-white text-xs font-bold">NASA</span>
                    </div>
                    {/* Play button */}
                    <button
                      onClick={() => setPlayingVideo(true)}
                      className="absolute inset-0 flex items-center justify-center"
                      aria-label="Play video"
                    >
                      <span
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-200 group-hover:scale-110"
                        style={{ background: m.color }}
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
                {locale === "es" ? "Video oficial NASA · YouTube" : "Official NASA video · YouTube"}
              </p>
            </div>

            {/* — Image grid (2×2) — */}
            <div className="grid grid-cols-2 gap-3">
              {galleryImages.length > 0
                ? galleryImages.map((src, i) => (
                    <div
                      key={i}
                      className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 shadow-sm group"
                    >
                      <Image
                        src={src}
                        alt={`${m.name} ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      {/* Subtle number badge */}
                      <span className="absolute bottom-1.5 right-2 text-white/50 text-[10px] font-mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  ))
                : Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl aspect-video bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                      <span className="text-gray-300 text-xs font-mono">img {i + 1}</span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dot navigation ───────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <span className="text-foreground/30 text-xs font-mono">{current + 1} / {missions.length}</span>
        <div className="flex gap-2">
          {missions.map((_, i) => (
            <button
              key={i}
              onClick={() => handleMissionChange(i)}
              className={`rounded-full transition-all ${
                current === i ? "w-6 h-2.5" : "w-2.5 h-2.5 bg-foreground/15 hover:bg-foreground/30"
              }`}
              style={current === i ? { background: missions[i].color } : undefined}
              aria-label={missions[i].name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
