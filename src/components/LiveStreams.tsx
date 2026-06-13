"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Channel = {
  id: string;
  labelKey: string;
  emoji: string;
  accent: string; // tailwind gradient for the channel tile
  ytId?: string; // YouTube live video id (preferred — stable perpetual stream)
  ytChannel?: string; // YouTube channel id (current featured live)
};

// NASA's public HLS endpoints were retired, so every channel streams via the
// (reliable) YouTube live embed.
const CHANNELS: Channel[] = [
  { id: "nasa-tv", labelKey: "nasa_channel", emoji: "🛰️", accent: "from-blue-500/40 to-indigo-600/10", ytId: "FuuC4dpSQ1M" },
  { id: "nasa-es", labelKey: "nasa_es_channel", emoji: "🌎", accent: "from-amber-500/40 to-orange-600/10", ytId: "21X5lGlDOfg" },
  { id: "nasa-yt", labelKey: "nasa_yt", emoji: "📺", accent: "from-red-500/40 to-rose-600/10", ytChannel: "UCLA_DiR1FfKNvjuUpBHmylQ" },
  { id: "esa", labelKey: "esa_channel", emoji: "🇪🇺", accent: "from-emerald-500/40 to-teal-600/10", ytChannel: "UCIBaDdAbGlFDeS33shmlD0A" },
];

function embedSrc(ch: Channel): string {
  return ch.ytId
    ? `https://www.youtube.com/embed/${ch.ytId}?rel=0&modestbranding=1&autoplay=1&mute=1`
    : `https://www.youtube.com/embed/live_stream?channel=${ch.ytChannel}&autoplay=1&mute=1`;
}

export default function LiveStreams() {
  const t = useTranslations("live");
  const [activeId, setActiveId] = useState(CHANNELS[0].id);
  const [theater, setTheater] = useState(false);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const active = CHANNELS.find((c) => c.id === activeId)!;

  function toggleFullscreen() {
    const el = playerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }

  const ctrlBtn =
    "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/90 backdrop-blur transition hover:bg-white/20";

  const player = (
    <div ref={playerRef} className={theater ? "relative z-10 w-full max-w-6xl" : "relative"}>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
        <iframe
          key={active.id}
          src={embedSrc(active)}
          title={t(active.labelKey)}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Control bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10">
          <span className="pointer-events-auto flex items-center gap-2 text-sm font-semibold text-white/90">
            <span>{active.emoji}</span>
            <span className="truncate">{t(active.labelKey)}</span>
          </span>
          <span className="ml-auto flex items-center gap-2">
            <button onClick={toggleFullscreen} title={t("fullscreen")} className={ctrlBtn}>⛶</button>
            <button onClick={() => setTheater((v) => !v)} title={theater ? t("exit_theater") : t("theater")} className={ctrlBtn}>
              {theater ? "✕" : "🎬"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#040D21]/40 p-5 sm:p-6">
      <div className="live-starfield" aria-hidden />

      <div className="relative z-10">
        {/* ON AIR + title */}
        <div className="mb-5 flex items-center gap-3">
          <span className="onair-dot flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {t("on_air")}
          </span>
          <h2 className="text-2xl font-bold tracking-[0.02em] text-white">{t("live_title")}</h2>
          <span className="ml-auto hidden font-mono text-[10px] tracking-wider text-white/35 sm:inline">NASA TV · 24/7</span>
        </div>

        <div className={`grid gap-6 ${theater ? "" : "lg:grid-cols-[1fr_300px]"}`}>
          {/* PLAYER (becomes a fixed ambient overlay in theater mode) */}
          {theater ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#02060f]/95 p-4 backdrop-blur-md">
              <div className="live-starfield" aria-hidden />
              {player}
            </div>
          ) : (
            player
          )}

          {/* CHANNEL GUIDE */}
          {!theater && (
            <aside>
              <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-white/40">{t("channels_title")}</div>
              <div className="flex flex-col gap-2">
                {CHANNELS.map((c) => {
                  const activeOn = c.id === activeId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={`group flex items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                        activeOn
                          ? "border-white/30 bg-white/10"
                          : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/5"
                      }`}
                    >
                      <span className={`flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${c.accent} text-xl`}>
                        {c.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white/90">{t(c.labelKey)}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-white/45">
                          <span className={`h-1.5 w-1.5 rounded-full ${activeOn ? "bg-red-500 onair-dot" : "bg-white/30"}`} />
                          {activeOn ? t("on_air") : "live"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
