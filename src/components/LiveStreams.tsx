"use client";

import { useMemo, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import Icon, { type IconName } from "@/components/Icon";
import {
  LIVE_SNAPSHOT,
  embedUrl,
  playableVideoId,
  sortedChannels,
  watchUrl,
  type LiveChannel,
} from "@/lib/live-channels";

/**
 * Hub de directos.
 *
 * El estado de cada canal viene horneado por el cron, no escrito a mano: los
 * ids fijos que había aquí llevaban meses muertos. Si un canal no emite, se
 * dice y se ofrece su último vídeo — antes se pintaba "ON AIR" siempre.
 */
export default function LiveStreams() {
  const t = useTranslations("live");
  const format = useFormatter();

  const channels = useMemo(() => sortedChannels(), []);
  const [activeId, setActiveId] = useState(() => channels[0]?.id ?? "");
  const [pickedVideo, setPickedVideo] = useState<string | null>(null);
  const [theater, setTheater] = useState(false);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const active: LiveChannel | undefined =
    channels.find((c) => c.id === activeId) ?? channels[0];

  const videoId = pickedVideo ?? (active ? playableVideoId(active) : null);
  const showingLive = Boolean(active?.isLive && videoId === active?.liveVideoId);

  const anyLive = channels.some((c) => c.isLive);
  const checkedAt = new Date(LIVE_SNAPSHOT.checkedAt);

  function selectChannel(id: string) {
    setActiveId(id);
    setPickedVideo(null);
  }

  function toggleFullscreen() {
    const el = playerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }

  const ctrlBtn =
    "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/90 backdrop-blur-sm transition hover:bg-white/20";

  const currentTitle = showingLive
    ? active?.liveTitle ?? (active ? t(active.labelKey) : "")
    : active?.recent.find((v) => v.id === videoId)?.title ?? (active ? t(active.labelKey) : "");

  const player = (
    <div ref={playerRef} className={theater ? "relative z-10 w-full max-w-6xl" : "relative"}>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
        {videoId ? (
          <iframe
            key={videoId}
            src={embedUrl(videoId)}
            title={currentTitle}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-3xl" aria-hidden>
              <Icon name="antenna" className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-white/70">{t("offline")}</p>
            {active && (
              <a
                href={`https://www.youtube.com/@${active.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/20"
              >
                {t("watch_youtube")}
              </a>
            )}
          </div>
        )}

        {/* Barra de control */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t from-black/80 to-transparent px-4 pb-3 pt-10">
          <span className="pointer-events-auto flex min-w-0 items-center gap-2 text-sm font-semibold text-white/90">
            <Icon name={(active?.icon ?? "satellite") as IconName} className="h-4 w-4" />
            <span className="truncate">{currentTitle}</span>
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-2">
            {videoId && (
              <a
                href={watchUrl(videoId)}
                target="_blank"
                rel="noopener noreferrer"
                title={t("watch_youtube")}
                className={ctrlBtn}
              >
                <Icon name="arrowUpRight" label={t("open_youtube")} />
              </a>
            )}
            <button onClick={toggleFullscreen} title={t("fullscreen")} className={ctrlBtn}>
              <Icon name="expand" label={t("fullscreen")} />
            </button>
            <button
              onClick={() => setTheater((v) => !v)}
              title={theater ? t("exit_theater") : t("theater")}
              className={ctrlBtn}
            >
              {theater ? (
                <Icon name="close" label={t("exit_theater")} />
              ) : (
                <Icon name="film" label={t("theater")} />
              )}
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
        {/* Cabecera: el badge refleja el estado real, no un adorno fijo */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          {anyLive ? (
            <span className="onair-dot flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {t("on_air")}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-widest text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" /> {t("no_live_now")}
            </span>
          )}
          <h2 className="text-2xl font-bold tracking-[0.02em] text-white">{t("live_title")}</h2>
          <span className="ml-auto hidden font-mono text-[10px] tracking-wider text-white/35 sm:inline">
            {t("checked_at", { time: format.dateTime(checkedAt, { dateStyle: "medium", timeStyle: "short" }) })}
          </span>
        </div>

        <div className={`grid gap-6 ${theater ? "" : "lg:grid-cols-[1fr_320px]"}`}>
          {theater ? (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#02060f]/95 p-4 backdrop-blur-md">
              <div className="live-starfield" aria-hidden />
              {player}
            </div>
          ) : (
            player
          )}

          {!theater && (
            <aside className="min-w-0">
              <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-white/40">
                {t("channels_title")}
              </div>
              <div className="flex flex-col gap-2">
                {channels.map((c) => {
                  const selected = c.id === active?.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectChannel(c.id)}
                      aria-pressed={selected}
                      className={`group flex items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                        selected
                          ? "border-white/30 bg-white/10"
                          : "border-white/5 bg-white/2 hover:border-white/15 hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${c.accent} text-xl`}
                      >
                        <Icon name={(c.icon ?? "satellite") as IconName} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white/90">
                          {t(c.labelKey)}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider">
                          {c.isLive ? (
                            <>
                              <span className="onair-dot h-1.5 w-1.5 rounded-full bg-red-500" />
                              <span className="text-red-400">{t("on_air")}</span>
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
                              <span className="text-white/40">{t("offline_short")}</span>
                            </>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Últimos vídeos del canal activo: da algo que ver cuando nadie emite */}
              {active && active.recent.length > 0 && (
                <div className="mt-5">
                  <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-white/40">
                    {t("recent_title")}
                  </div>
                  <ul className="flex flex-col gap-1">
                    {active.recent.map((v) => (
                      <li key={v.id}>
                        <button
                          onClick={() => setPickedVideo(v.id)}
                          aria-pressed={videoId === v.id}
                          className={`w-full rounded-lg px-2 py-1.5 text-left text-xs leading-snug transition ${
                            videoId === v.id
                              ? "bg-white/10 text-white"
                              : "text-white/55 hover:bg-white/5 hover:text-white/85"
                          }`}
                        >
                          <span className="line-clamp-2">{v.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
