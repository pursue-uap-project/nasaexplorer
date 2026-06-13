"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Channel = {
  id: string;
  labelKey: string;
  emoji: string;
  accent: string; // tailwind gradient for the channel tile
  kind: "hls" | "yt";
  hlsUrl?: string;
  ytId?: string; // YouTube video id (HLS fallback)
  ytChannel?: string; // YouTube channel id (perpetual live embed)
};

const CHANNELS: Channel[] = [
  {
    id: "nasa-tv",
    labelKey: "nasa_channel",
    emoji: "🛰️",
    accent: "from-blue-500/40 to-indigo-600/10",
    kind: "hls",
    hlsUrl: "https://nasa-otd.akamaized.net/hls/live/2032332/NASA-OTD1-HD/master.m3u8",
    ytId: "FuuC4dpSQ1M",
  },
  {
    id: "nasa-es",
    labelKey: "nasa_es_channel",
    emoji: "🌎",
    accent: "from-amber-500/40 to-orange-600/10",
    kind: "hls",
    hlsUrl: "https://nasa-otd.akamaized.net/hls/live/2032334/NASA-OTD2-HD/master.m3u8",
    ytId: "21X5lGlDOfg",
  },
  {
    id: "nasa-yt",
    labelKey: "nasa_yt",
    emoji: "📺",
    accent: "from-red-500/40 to-rose-600/10",
    kind: "yt",
    ytChannel: "UCLA_DiR1FfKNvjuUpBHmylQ",
  },
  {
    id: "esa",
    labelKey: "esa_channel",
    emoji: "🇪🇺",
    accent: "from-emerald-500/40 to-teal-600/10",
    kind: "yt",
    ytChannel: "UCIBaDdAbGlFDeS33shmlD0A",
  },
];

type Status = "connecting" | "live" | "offline";

export default function LiveStreams() {
  const t = useTranslations("live");

  const [activeId, setActiveId] = useState(CHANNELS[0].id);
  const [hlsLoaded, setHlsLoaded] = useState(false);
  const [status, setStatus] = useState<Status>("connecting");
  const [muted, setMuted] = useState(true);
  const [theater, setTheater] = useState(false);
  const [ytFallback, setYtFallback] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [pipOk, setPipOk] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const active = CHANNELS.find((c) => c.id === activeId)!;
  const isVideo = active.kind === "hls" && !ytFallback;

  useEffect(() => {
    setPipOk(typeof document !== "undefined" && (document as Document).pictureInPictureEnabled);
  }, []);

  // Load hls.js once
  useEffect(() => {
    if (typeof window === "undefined" || (window as any).Hls) {
      setHlsLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js";
    script.async = true;
    script.onload = () => setHlsLoaded(true);
    script.onerror = () => setYtFallback(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // Attach HLS to the single active video (re-runs on channel / reload change)
  useEffect(() => {
    if (active.kind !== "hls" || ytFallback) return;
    setStatus("connecting");
    if (!hlsLoaded) return;
    const video = videoRef.current;
    if (!video) return;

    const onPlaying = () => setStatus("live");
    video.addEventListener("playing", onPlaying);

    let hls: any;
    const Hls = (window as any).Hls;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = active.hlsUrl!;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({ liveDurationInfinity: true });
      hls.loadSource(active.hlsUrl!);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
        if (data.fatal) {
          setStatus("offline");
          try { hls.destroy(); } catch {}
        }
      });
    } else {
      setStatus("offline");
    }

    return () => {
      video.removeEventListener("playing", onPlaying);
      if (hls) { try { hls.destroy(); } catch {} }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, hlsLoaded, ytFallback, reloadKey]);

  function selectChannel(id: string) {
    if (id === activeId) return;
    setActiveId(id);
    setYtFallback(false);
    setMuted(true);
    setStatus("connecting");
  }

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  async function togglePip() {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {}
  }

  function toggleFullscreen() {
    const el = playerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }

  const ytSrc = ytFallback
    ? `https://www.youtube.com/embed/${active.ytId}?rel=0&modestbranding=1&autoplay=1&mute=1`
    : `https://www.youtube.com/embed/live_stream?channel=${active.ytChannel}&autoplay=1&mute=1`;

  const ctrlBtn =
    "flex items-center justify-center h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition backdrop-blur";

  const player = (
    <div ref={playerRef} className={theater ? "w-full max-w-6xl relative z-10" : "relative"}>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
        {isVideo ? (
          <video
            key={`${activeId}-${reloadKey}`}
            ref={(el) => { videoRef.current = el; }}
            autoPlay
            muted={muted}
            playsInline
            className="absolute inset-0 h-full w-full bg-black"
            onError={() => setStatus("offline")}
          />
        ) : (
          <iframe
            key={ytSrc}
            src={ytSrc}
            title={t(active.labelKey)}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {/* Connecting overlay (HLS only) */}
        {isVideo && status === "connecting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-white/70">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
            <span className="text-sm font-mono tracking-wider">{t("connecting")}</span>
          </div>
        )}

        {/* Offline overlay (HLS only) */}
        {isVideo && status === "offline" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#040D21]/90 px-6 text-center">
            <div className="text-4xl opacity-70">📡</div>
            <p className="text-white/80">{t("offline")}</p>
            <div className="flex gap-2">
              <button onClick={() => setReloadKey((k) => k + 1)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 transition hover:bg-white/20">
                ↻ {t("retry")}
              </button>
              {active.ytId && (
                <button onClick={() => setYtFallback(true)} className="rounded-lg bg-red-500/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500">
                  ▶ {t("watch_youtube")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tap for sound (HLS, live, muted) */}
        {isVideo && status === "live" && muted && (
          <button
            onClick={toggleSound}
            className="absolute inset-0 flex items-end justify-center pb-16 sm:pb-20"
            aria-label={t("unmute")}
          >
            <span className="rounded-full bg-black/70 px-4 py-2 text-sm text-white/90 backdrop-blur transition hover:bg-black/90">
              🔇 {t("unmute")}
            </span>
          </button>
        )}

        {/* Control bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10">
          <span className="pointer-events-auto flex items-center gap-2 text-sm font-semibold text-white/90">
            <span>{active.emoji}</span>
            <span className="truncate">{t(active.labelKey)}</span>
          </span>
          <span className="ml-auto flex items-center gap-2">
            {isVideo && (
              <button onClick={toggleSound} title={t("unmute")} className={ctrlBtn + " pointer-events-auto"}>
                {muted ? "🔇" : "🔊"}
              </button>
            )}
            {isVideo && pipOk && (
              <button onClick={togglePip} title={t("pip")} className={ctrlBtn + " pointer-events-auto"}>⧉</button>
            )}
            <button onClick={toggleFullscreen} title={t("fullscreen")} className={ctrlBtn + " pointer-events-auto"}>⛶</button>
            <button
              onClick={() => setTheater((v) => !v)}
              title={theater ? t("exit_theater") : t("theater")}
              className={ctrlBtn + " pointer-events-auto"}
            >
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
          {/* PLAYER (becomes a fixed overlay in theater mode) */}
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
                      onClick={() => selectChannel(c.id)}
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
