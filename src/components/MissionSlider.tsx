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

const VIDEO_CAPTIONS: Record<string, { en: string; es: string }> = {
  artemis: {
    en: "Artemis I launch — SLS lifts off from Kennedy Space Center, Nov 2022",
    es: "Lanzamiento Artemis I — el SLS despega de Kennedy Space Center, nov. 2022",
  },
  jwst: {
    en: "James Webb Space Telescope — first full-color images revealed, Jul 2022",
    es: "Telescopio James Webb — primeras imágenes en color reveladas, jul. 2022",
  },
  perseverance: {
    en: "Perseverance rover — first drive on Mars after landing in Jezero Crater",
    es: "Rover Perseverance — primer recorrido en Marte tras aterrizar en el Cráter Jezero",
  },
  iss: {
    en: "ISS overview — 25 years of continuous human presence in orbit",
    es: "Resumen de la ISS — 25 años de presencia humana continua en órbita",
  },
};

const IMAGE_CAPTIONS: Record<string, { en: string[]; es: string[] }> = {
  artemis: {
    en: ["Orion capsule over the Moon", "SLS on the launch pad", "Artemis crew training", "Lunar south pole target"],
    es: ["Cápsula Orion sobre la Luna", "SLS en la plataforma de lanzamiento", "Entrenamiento del equipo Artemis", "Polo sur lunar objetivo"],
  },
  jwst: {
    en: ["Deep field galaxy cluster", "Carina Nebula pillars", "Exoplanet atmosphere spectrum", "Stephan's Quintet"],
    es: ["Clúster de galaxias campo profundo", "Pilares de la Nebulosa Carina", "Espectro de atmósfera de exoplaneta", "Quinteto de Stephan"],
  },
  perseverance: {
    en: ["Jezero Crater surface", "Rock sample collection", "Ingenuity helicopter flight", "Mars selfie at Rochette"],
    es: ["Superficie del Cráter Jezero", "Recogida de muestras de roca", "Vuelo del helicóptero Ingenuity", "Selfie de Marte en Rochette"],
  },
  iss: {
    en: ["ISS over Earth's limb", "Crew in microgravity lab", "Solar panel array deployment", "Earth observation window"],
    es: ["ISS sobre el horizonte terrestre", "Tripulación en el laboratorio de microgravedad", "Despliegue de paneles solares", "Ventana de observación de la Tierra"],
  },
};

export default function MissionSlider({ missions, images }: Props) {
  const t = useTranslations("active");
  const locale = useLocale() as "en" | "es";
  const [current, setCurrent] = useState(0);
  const [playingVideo, setPlayingVideo] = useState(false);

  const m = missions[current];
  const mImages = images[m.id] ?? [];
  const videoCaption = VIDEO_CAPTIONS[m.id]?.[locale] ?? "";
  const imageCaptions = IMAGE_CAPTIONS[m.id]?.[locale] ?? [];
  const heroImage = mImages[0] ?? null;

  function handleMissionChange(i: number) {
    setCurrent(i);
    setPlayingVideo(false);
  }

  return (
    <div>
      {/* Mission selector tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
        {missions.map((mission, i) => (
          <button
            key={mission.id}
            onClick={() => handleMissionChange(i)}
            className={`shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              current === i
                ? "text-white shadow-md"
                : "bg-white border border-gray-200 text-foreground/60 hover:border-gray-300 hover:bg-gray-50"
            }`}
            style={current === i ? { background: mission.color } : undefined}
          >
            {mission.name}
          </button>
        ))}
      </div>

      {/* Mission card — clean light container */}
      <div
        key={m.id}
        className="rounded-3xl overflow-hidden border border-gray-200 shadow-xl bg-white"
      >
        {/* ── SECTION 1: HERO IMAGE ─────────────────────────────────────── */}
        <div className="relative h-[420px] w-full bg-gray-900 overflow-hidden">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={m.name}
              fill
              unoptimized
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${m.color}33, #0a0a0f)` }} />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Program tag */}
          <div className="absolute top-6 left-6">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full text-white backdrop-blur-sm"
              style={{ background: `${m.color}cc` }}
            >
              {m.program}
            </span>
          </div>

          {/* Active badge */}
          <div className="absolute top-6 right-6">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-xs font-mono uppercase tracking-wider">Active</span>
            </span>
          </div>

          {/* Mission title at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-8 pt-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">{m.name}</h2>
            <p className="text-white/70 text-lg mt-1">{m.tagline[locale]}</p>
          </div>
        </div>

        {/* ── SECTION 2: DATA PANELS (light) ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* Left: description + stats */}
          <div className="px-6 sm:px-10 py-8 flex flex-col gap-6 bg-white">
            <p className="text-gray-600 leading-relaxed text-sm">{m.description[locale]}</p>

            <div>
              <h3 className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-4">
                {t("stats_title")}
              </h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                {m.stats.map(({ label, value }) => (
                  <div key={label} className="border-l-2 pl-3" style={{ borderColor: m.color }}>
                    <dt className="text-gray-400 text-xs">{label}</dt>
                    <dd className="text-gray-900 font-semibold text-sm mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Right: trajectory (Artemis) or placeholder for others */}
          <div className="px-6 sm:px-10 py-8 bg-gray-50/60">
            {m.hasTrajectory ? (
              <>
                <h3 className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-4">
                  {t("trajectory_title")}
                </h3>
                <TrajectoryMap locale={locale} />
              </>
            ) : (
              <div className="h-full flex flex-col justify-center">
                <h3 className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-4">
                  {t("stats_title")}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {m.stats.slice(0, 4).map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500 text-sm">{label}</span>
                      <span
                        className="font-bold text-sm px-2.5 py-0.5 rounded-full text-white"
                        style={{ background: m.color }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 3: MEDIA GALLERY ─────────────────────────────────── */}
        <div className="px-6 sm:px-10 py-8 bg-gray-50 border-t border-gray-100">
          <h3 className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-6">
            {t("gallery_title")}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Featured video */}
            <div className="flex flex-col gap-2">
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video group">
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
                    <img
                      src={`https://img.youtube.com/vi/${m.youtubeId}/maxresdefault.jpg`}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                    <button
                      onClick={() => setPlayingVideo(true)}
                      className="absolute inset-0 flex items-center justify-center"
                      aria-label="Play video"
                    >
                      <span
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110"
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
              <p className="text-gray-500 text-xs leading-relaxed">{videoCaption}</p>
            </div>

            {/* Image thumbnails grid */}
            <div className="grid grid-cols-2 gap-3">
              {mImages.slice(1, 5).map((src, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="relative rounded-xl overflow-hidden bg-gray-200 aspect-video">
                    <Image
                      src={src}
                      alt={imageCaptions[i] ?? `${m.name} ${i + 1}`}
                      fill
                      unoptimized
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  {imageCaptions[i] && (
                    <p className="text-gray-400 text-[11px] leading-tight line-clamp-2">{imageCaptions[i]}</p>
                  )}
                </div>
              ))}
              {/* Fill empty slots */}
              {Array.from({ length: Math.max(0, 4 - mImages.slice(1, 5).length) }).map((_, i) => (
                <div key={`empty-${i}`} className="rounded-xl bg-gray-100 aspect-video" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dot navigation */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <span className="text-gray-400 text-xs font-mono">
          {current + 1} / {missions.length}
        </span>
        <div className="flex gap-2">
          {missions.map((_, i) => (
            <button
              key={i}
              onClick={() => handleMissionChange(i)}
              className={`rounded-full transition-all ${
                current === i ? "w-6 h-2.5" : "w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300"
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
