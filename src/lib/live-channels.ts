/**
 * Canales en directo.
 *
 * Los ids de vídeo NO se escriben a mano: los resuelve el cron
 * (scripts/sync-space-data.mjs) contra /@handle/live y el RSS del canal.
 *
 * Motivo: el hub tenía ids fijos y los directos de YouTube caducan. Los dos
 * que había murieron (uno en 2024, otro en junio de 2026) y el reproductor
 * servía vídeos `UNPLAYABLE` mientras anunciaba "ON AIR". Un id fijo siempre
 * acaba así; hay que resolverlo cada pocos minutos.
 *
 * No se puede resolver en el navegador: el RSS y la página /live de YouTube
 * no mandan cabeceras CORS. Por eso se hornea en CI.
 */

import liveData from "@/data/live-channels.json";

export type ChannelVideo = {
  id: string;
  title: string;
  published: string | null;
};

export type LiveChannel = {
  id: string;
  labelKey: string;
  /** Nombre de icono en `src/components/Icon.tsx`. */
  icon: string;
  accent: string;
  handle: string;
  channelId: string;
  /** true solo si YouTube confirmó `isLiveNow` al pasar el cron. */
  isLive: boolean;
  liveVideoId: string | null;
  liveTitle: string | null;
  /** Último vídeo del canal: lo que se reproduce cuando no hay directo. */
  fallbackVideoId: string | null;
  recent: ChannelVideo[];
};

export type LiveSnapshot = {
  checkedAt: string;
  channels: LiveChannel[];
};

export const LIVE_SNAPSHOT = liveData as LiveSnapshot;

/** Vídeo a reproducir: el directo si lo hay, si no el último publicado. */
export function playableVideoId(ch: LiveChannel): string | null {
  return ch.liveVideoId ?? ch.fallbackVideoId ?? ch.recent[0]?.id ?? null;
}

export function embedUrl(videoId: string, { autoplay = true } = {}): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    autoplay: autoplay ? "1" : "0",
    mute: autoplay ? "1" : "0",
  });
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}

export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Canales ordenados: primero los que están emitiendo. */
export function sortedChannels(snapshot: LiveSnapshot = LIVE_SNAPSHOT): LiveChannel[] {
  return [...snapshot.channels].sort((a, b) => Number(b.isLive) - Number(a.isLive));
}
