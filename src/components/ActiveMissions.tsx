"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import TrajectoryMap from "./TrajectoryMap";
import MissionLive from "./MissionLive";
import Lightbox from "./Lightbox";
import type { ActiveMission, MissionImage, MarsLatest } from "@/lib/nasa";

type Props = {
  missions: ActiveMission[];
  images: Record<string, MissionImage[]>;
  videoIds: Record<string, string>;
  mars: MarsLatest;
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const LOCAL_HEROES: Record<string, string> = {
  artemis: `${BASE}/assets/artemis-hero.png`,
  jwst: `${BASE}/assets/jwst-hero.png`,
  perseverance: `${BASE}/assets/perseverance-hero.png`,
  iss: `${BASE}/assets/iss-hero.png`,
};

export default function ActiveMissions({ missions, images, videoIds, mars }: Props) {
  const t = useTranslations("active");
  const locale = useLocale() as "en" | "es";
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [thumbBroken, setThumbBroken] = useState(false);

  // Deep-link: #mission-<id>
  useEffect(() => {
    const fromHash = () => {
      const m = window.location.hash.match(/#mission-([\w-]+)/);
      const i = m ? missions.findIndex((x) => x.id === m[1]) : -1;
      if (i >= 0) setCurrent(i);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [missions]);

  function select(i: number) {
    setCurrent(i);
    setPlaying(false);
    setThumbBroken(false);
    setLightbox(null);
    history.replaceState(null, "", `#mission-${missions[i].id}`);
  }

  const m = missions[current];
  const gallery = images[m.id] ?? [];
  const heroSrc = LOCAL_HEROES[m.id] ?? gallery[0]?.url ?? null;
  const videoId = videoIds[m.id] || m.youtubeId;
  const statusLabel = m.status ? m.status[locale] : (locale === "es" ? "Activa" : "Active");

  const sectionTitle = "mb-3 text-[11px] font-mono uppercase tracking-widest text-white/40";
  const cardCls = "rounded-2xl border border-white/10 bg-white/[0.03] p-5";

  return (
    <div>
      {/* ── Mission selector ── */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {missions.map((mission, i) => (
          <button
            key={mission.id}
            onClick={() => select(i)}
            className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              current === i ? "text-white" : "border-white/10 bg-white/[0.02] text-white/55 hover:bg-white/5 hover:text-white/80"
            }`}
            style={current === i ? { background: `${mission.color}22`, borderColor: mission.color } : undefined}
          >
            {mission.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* ── HERO ── */}
          <div className="relative h-[360px] overflow-hidden rounded-3xl border border-white/10 sm:h-[420px]">
            {heroSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroSrc} alt={m.name} className="kenburns absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, #0B3D91, ${m.color})` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#040D21] via-[#040D21]/35 to-transparent" />

            <div className="absolute left-6 top-5 flex gap-2">
              <span className="rounded-full px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm" style={{ background: `${m.color}cc` }}>
                {m.program}
              </span>
              {m.agency && (
                <span className="rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-mono text-white/70 backdrop-blur-sm">
                  {m.agency}
                </span>
              )}
            </div>
            <div className="absolute right-6 top-5">
              <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-emerald-300">{statusLabel}</span>
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 px-7 pb-7 sm:px-10">
              <h2 className="text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl">{m.name}</h2>
              <p className="mt-1 text-lg text-white/75 drop-shadow">{m.tagline[locale]}</p>
              {m.since && <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-white/45">{m.since}</p>}
            </div>
          </div>

          {/* ── LIVE ── */}
          {m.live && (
            <div className="mt-4">
              <MissionLive mission={m} mars={mars} color={m.color} />
            </div>
          )}

          {/* ── DETAILS GRID ── */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className={cardCls}>
                <p className="leading-relaxed text-white/70">{m.description[locale]}</p>

                {m.objectives && m.objectives.length > 0 && (
                  <div className="mt-5">
                    <h3 className={sectionTitle}>{t("objectives_title")}</h3>
                    <ul className="space-y-2">
                      {m.objectives.map((o, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-white/70">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: m.color }} />
                          {o[locale]}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {m.instruments && m.instruments.length > 0 && (
                  <div className="mt-5">
                    <h3 className={sectionTitle}>{t("instruments_title")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {m.instruments.map((ins) => (
                        <span
                          key={ins.name}
                          title={ins[locale]}
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/75"
                        >
                          <span className="font-semibold text-white/90">{ins.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {m.timeline && m.timeline.length > 0 && (
                <div className={cardCls}>
                  <h3 className={sectionTitle}>{t("timeline_title")}</h3>
                  <ol className="relative ml-1 space-y-4 border-l border-white/10 pl-5">
                    {m.timeline.map((ev, i) => (
                      <li key={i} className="relative">
                        <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-[#040D21]" style={{ background: m.color }} />
                        <div className="font-mono text-[11px] uppercase tracking-wider text-white/40">{ev.date}</div>
                        <div className="text-sm text-white/75">{ev[locale]}</div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {m.hasTrajectory && (
                <div className={cardCls}>
                  <h3 className={sectionTitle}>{t("trajectory_title")}</h3>
                  <TrajectoryMap locale={locale} />
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className={cardCls}>
                <h3 className={sectionTitle}>{t("stats_title")}</h3>
                <dl>
                  {m.stats.map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 border-b border-white/8 py-2.5 last:border-0">
                      <dt className="shrink-0 text-xs uppercase tracking-wide text-white/45">{label}</dt>
                      <dd className="text-right text-sm font-semibold leading-tight" style={{ color: m.color }}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {m.links && m.links.length > 0 && (
                <div className={cardCls}>
                  <h3 className={sectionTitle}>{t("links_title")}</h3>
                  <div className="flex flex-col gap-2">
                    {m.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:border-white/25 hover:text-white">
                        {l.label}<span className="text-white/40">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* ── VIDEO + GALLERY ── */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Video */}
            <div className={cardCls}>
              <h3 className={sectionTitle}>{t("video_title")}</h3>
              <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                {playing ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                    title={m.name}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={m.name}>
                    {!thumbBroken ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt={m.name}
                        onError={() => setThumbBroken(true)}
                        className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, #0B3D91, ${m.color})` }} />
                    )}
                    <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/15" />
                    <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-2xl transition group-hover:scale-110" style={{ background: m.color }}>
                      <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-7 w-7"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </button>
                )}
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/45 transition hover:text-white/80"
              >
                ▶ {t("watch_youtube")} ↗
              </a>
            </div>

            {/* Gallery */}
            <div className={cardCls}>
              <h3 className={sectionTitle}>{t("gallery_title")}</h3>
              {gallery.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {gallery.slice(0, 8).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox(i)}
                      className="group relative aspect-square overflow-hidden rounded-lg bg-white/5"
                      title={img.title}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-110" />
                      <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square animate-pulse rounded-lg bg-white/5" />
                  ))}
                </div>
              )}
              {gallery.length > 0 && (
                <p className="mt-2 text-[11px] text-white/35">{t("gallery_hint")}</p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <span className="font-mono text-xs text-white/30">{current + 1} / {missions.length}</span>
        <div className="flex gap-2">
          {missions.map((mm, i) => (
            <button
              key={i}
              onClick={() => select(i)}
              className={`h-2.5 rounded-full transition-all ${current === i ? "w-6" : "w-2.5 bg-white/15 hover:bg-white/30"}`}
              style={current === i ? { background: mm.color } : undefined}
              aria-label={mm.name}
            />
          ))}
        </div>
      </div>

      {lightbox !== null && gallery.length > 0 && (
        <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />
      )}
    </div>
  );
}
