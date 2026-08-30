/**
 * Lanzamientos: datos horneados + refresco en cliente.
 *
 * El sitio es estático (`output: "export"`), así que `src/data/launches.json`
 * es la foto que deja el cron (scripts/sync-space-data.mjs). Pinta al instante,
 * es indexable y funciona sin red.
 *
 * Encima, `fetchLaunches()` vuelve a pedir los datos a Launch Library desde el
 * navegador en cada visita. LL2 manda `access-control-allow-origin: *`, así que
 * se puede: es lo que evita que un lanzamiento de hace diez minutos tarde
 * quince días en aparecer.
 */

import launchesData from "@/data/launches.json";

export type LaunchStatus = {
  id: number | null;
  name: string | null;
  abbrev: string | null;
  description: string | null;
};

export type LaunchMission = {
  name: string | null;
  type: string | null;
  description: string | null;
  orbit: string | null;
};

export type LaunchVideo = {
  url: string;
  title: string | null;
  source: string | null;
};

export type Launch = {
  id: string;
  name: string;
  slug: string | null;
  net: string;
  windowStart: string | null;
  status: LaunchStatus;
  provider: string | null;
  providerType: string | null;
  rocket: string | null;
  pad: string | null;
  location: string | null;
  country: string | null;
  image: string | null;
  imageCredit: string | null;
  mission: LaunchMission | null;
  webcastLive: boolean;
  videos: LaunchVideo[];
};

export type LaunchFeed = {
  checkedAt: string;
  source?: string;
  upcoming: Launch[];
  previous: Launch[];
};

/** Instantánea horneada por el cron. Nunca es null: el hub siempre pinta algo. */
export const BAKED_LAUNCHES = launchesData as LaunchFeed;

const LL2 = "https://ll.thespacedevs.com/2.3.0";

/** Forma cruda de LL2 — solo los campos que consumimos. */
type RawLaunch = {
  id: string;
  name: string;
  slug?: string | null;
  net: string;
  window_start?: string | null;
  status?: { id?: number; name?: string; abbrev?: string; description?: string } | null;
  launch_service_provider?: { name?: string; type?: { name?: string } | string | null } | null;
  rocket?: { configuration?: { full_name?: string; name?: string } | null } | null;
  pad?: {
    name?: string;
    location?: { name?: string; country?: { name?: string } | null } | null;
    country?: { name?: string } | null;
  } | null;
  image?: { image_url?: string; thumbnail_url?: string; credit?: string | null } | string | null;
  mission?: { name?: string; type?: string; description?: string; orbit?: { name?: string } | null } | null;
  webcast_live?: boolean;
  vidURLs?: { url: string; title?: string | null; source?: string | null }[] | null;
};

function launchImage(raw: RawLaunch): { url: string | null; credit: string | null } {
  const img = raw.image;
  if (!img) return { url: null, credit: null };
  if (typeof img === "string") return { url: img, credit: null };
  return { url: img.image_url ?? img.thumbnail_url ?? null, credit: img.credit ?? null };
}

function mapLaunch(raw: RawLaunch): Launch {
  const { url, credit } = launchImage(raw);
  const providerType = raw.launch_service_provider?.type;
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug ?? null,
    net: raw.net,
    windowStart: raw.window_start ?? null,
    status: {
      id: raw.status?.id ?? null,
      name: raw.status?.name ?? null,
      abbrev: raw.status?.abbrev ?? null,
      description: raw.status?.description ?? null,
    },
    provider: raw.launch_service_provider?.name ?? null,
    providerType: typeof providerType === "string" ? providerType : providerType?.name ?? null,
    rocket: raw.rocket?.configuration?.full_name ?? raw.rocket?.configuration?.name ?? null,
    pad: raw.pad?.name ?? null,
    location: raw.pad?.location?.name ?? null,
    country: raw.pad?.country?.name ?? raw.pad?.location?.country?.name ?? null,
    image: url,
    imageCredit: credit,
    mission: raw.mission
      ? {
          name: raw.mission.name ?? null,
          type: raw.mission.type ?? null,
          description: raw.mission.description ?? null,
          orbit: raw.mission.orbit?.name ?? null,
        }
      : null,
    webcastLive: Boolean(raw.webcast_live),
    videos: (raw.vidURLs ?? []).map((v) => ({
      url: v.url,
      title: v.title ?? null,
      source: v.source ?? null,
    })),
  };
}

async function getLaunches(path: "upcoming" | "previous", limit: number): Promise<Launch[]> {
  const res = await fetch(`${LL2}/launches/${path}/?limit=${limit}&mode=detailed`, {
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Launch Library ${res.status}`);
  const data = (await res.json()) as { results?: RawLaunch[] };
  return (data.results ?? []).map(mapLaunch);
}

/**
 * Refresca desde el navegador. Si falla (LL2 limita a ~15 peticiones/hora por
 * IP anónima), quien llama se queda con los datos horneados.
 */
export async function fetchLaunches(): Promise<LaunchFeed> {
  const [upcoming, previous] = await Promise.all([
    getLaunches("upcoming", 12),
    getLaunches("previous", 8),
  ]);
  return {
    checkedAt: new Date().toISOString(),
    source: "Launch Library 2 (thespacedevs.com)",
    upcoming,
    previous,
  };
}

// ── Derivados ──────────────────────────────────────────────────────────────

/** Ids de estado de LL2 que significan "está pasando ahora mismo". */
const IN_FLIGHT_STATUS = new Set([6]); // 6 = Launch in Flight

export function isInFlight(l: Launch): boolean {
  return (l.status.id !== null && IN_FLIGHT_STATUS.has(l.status.id)) || l.webcastLive;
}

/** Un lanzamiento cuenta como "reciente" si despegó en las últimas 72 h. */
export function isRecent(l: Launch, now = Date.now()): boolean {
  const t = new Date(l.net).getTime();
  return Number.isFinite(t) && now - t >= 0 && now - t < 72 * 3600 * 1000;
}

/**
 * Lo que merece ir arriba del todo: lo que está en vuelo, y si no, lo que
 * acaba de despegar. Es la respuesta a "ha lanzado el Roman y no sale nada".
 */
export function getHighlight(feed: LaunchFeed, now = Date.now()): Launch | null {
  const pool = [...feed.previous, ...feed.upcoming];
  return (
    pool.find(isInFlight) ??
    pool.filter((l) => isRecent(l, now)).sort((a, b) => +new Date(b.net) - +new Date(a.net))[0] ??
    null
  );
}

/** Tono de color por estado, para no repetir el switch en cada componente. */
export function statusTone(l: Launch): { text: string; bg: string; ring: string } {
  const id = l.status.id;
  if (id === 6 || l.webcastLive) return { text: "text-red-300", bg: "bg-red-500/15", ring: "ring-red-500/40" };
  if (id === 3) return { text: "text-emerald-300", bg: "bg-emerald-500/15", ring: "ring-emerald-500/40" }; // Success
  if (id === 4 || id === 7) return { text: "text-rose-300", bg: "bg-rose-500/15", ring: "ring-rose-500/40" }; // Failure
  if (id === 1) return { text: "text-sky-300", bg: "bg-sky-500/15", ring: "ring-sky-500/40" }; // Go
  if (id === 2 || id === 5) return { text: "text-amber-300", bg: "bg-amber-500/15", ring: "ring-amber-500/40" }; // TBD/Hold
  return { text: "text-white/70", bg: "bg-white/10", ring: "ring-white/20" };
}
