#!/usr/bin/env node
/**
 * sync-space-data.mjs — refresca los datos volátiles del portal.
 *
 * Se ejecuta desde GitHub Actions (ver .github/workflows/sync-space-data.yml)
 * y escribe dos JSON que se commitean al repo:
 *
 *   src/data/live-channels.json  ← qué canal está EN DIRECTO ahora mismo
 *   src/data/launches.json       ← lanzamientos próximos y recientes
 *   src/data/apod.json           ← imagen astronómica del día
 *
 * Por qué un script y no un fetch en el navegador:
 *   - El sitio es `output: "export"` (GitHub Pages). No hay servidor.
 *   - Los feeds de YouTube (RSS y la página /live) NO mandan cabeceras CORS,
 *     así que el navegador no puede resolver el vídeo en directo. Hay que
 *     hacerlo aquí, en CI, y hornear el resultado.
 *   - Launch Library sí manda `access-control-allow-origin: *`, por eso
 *     además se refresca en cliente (src/lib/launches.ts). Este JSON es la
 *     foto inicial: pinta al instante, es indexable y funciona sin red.
 *
 * Uso:
 *   node scripts/sync-space-data.mjs            # todo
 *   node scripts/sync-space-data.mjs --live     # solo canales en directo
 *   node scripts/sync-space-data.mjs --launches # solo lanzamientos
 *   node scripts/sync-space-data.mjs --apod     # solo la imagen del día
 *
 * Sin dependencias: solo fetch nativo de Node >= 22.
 */

import { writeFile, readFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = resolve(ROOT, "src/data");

// YouTube devuelve una pantalla de consentimiento a los clientes que no parecen
// un navegador; sin estas dos cabeceras la resolución del directo sale vacía.
const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "accept-language": "en-US,en;q=0.9",
  cookie: "CONSENT=YES+cb; SOCS=CAI",
};

/** Canales del hub. `handle` resuelve el directo, `channelId` el RSS de recientes. */
const CHANNELS = [
  {
    id: "nasa",
    labelKey: "nasa_channel",
    emoji: "🛰️",
    accent: "from-blue-500/40 to-indigo-600/10",
    handle: "NASA",
    channelId: "UCLA_DiR1FfKNvjuUpBHmylQ",
  },
  {
    id: "nasa-es",
    labelKey: "nasa_es_channel",
    emoji: "🌎",
    accent: "from-amber-500/40 to-orange-600/10",
    handle: "nasa_es",
    channelId: "UC8zqCEvaRwHcfz3IhjhMMxQ",
  },
  {
    id: "esa",
    labelKey: "esa_channel",
    emoji: "🇪🇺",
    accent: "from-emerald-500/40 to-teal-600/10",
    handle: "ESA",
    channelId: "UCIBaDdAbGlFDeS33shmlD0A",
  },
  {
    id: "spacex",
    labelKey: "spacex_channel",
    emoji: "🚀",
    accent: "from-slate-400/40 to-slate-600/10",
    handle: "SpaceX",
    channelId: "UCtI0Hodo5o5dUb67FeUjDeA",
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, { headers = {}, tries = 3, timeout = 25000 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(timeout),
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      if (attempt < tries) await sleep(attempt * 1500);
    }
  }
  throw lastErr;
}

// ── Directos de YouTube ────────────────────────────────────────────────────

/** Extrae el id de vídeo del canonical de /@handle/live. */
function canonicalVideoId(html) {
  const m = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/);
  return m ? m[1] : null;
}

/**
 * Un canal solo está EN DIRECTO si su watch page dice `isLiveNow: true`.
 * /@handle/live redirige al último directo aunque ya haya terminado, así que
 * sin esta comprobación acabaríamos anunciando "ON AIR" sobre una reposición
 * — que es justo el bug que tenía el hub (dos ids muertos, uno desde 2024).
 */
async function isLiveNow(videoId) {
  try {
    const html = await fetchText(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: BROWSER_HEADERS,
      tries: 2,
    });
    if (/"status":"(ERROR|UNPLAYABLE|LOGIN_REQUIRED)"/.test(html)) return false;
    return /"isLiveNow":true/.test(html);
  } catch {
    return false;
  }
}

/** Últimos vídeos del canal vía RSS (sin API key, sin cuota). */
async function latestVideos(channelId, limit = 4) {
  try {
    const xml = await fetchText(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { tries: 2 }
    );
    const entries = xml.split("<entry>").slice(1, limit + 1);
    return entries
      .map((entry) => {
        const id = entry.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
        const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
        const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
        if (!id || !title) return null;
        return { id, title: decodeEntities(title.trim()), published: published ?? null };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function syncLive() {
  const channels = [];

  for (const ch of CHANNELS) {
    let liveVideoId = null;
    let liveTitle = null;

    try {
      // Cuando el canal NO está emitiendo, /live responde 404. Es el caso
      // normal, no un error: se resuelve como "offline" sin ruido.
      const html = await fetchText(`https://www.youtube.com/@${ch.handle}/live`, {
        headers: BROWSER_HEADERS,
        tries: 1,
      });
      const candidate = canonicalVideoId(html);
      if (candidate && (await isLiveNow(candidate))) {
        liveVideoId = candidate;
        liveTitle =
          decodeEntities(html.match(/<meta name="title" content="([^"]*)"/)?.[1] ?? "") || null;
      }
    } catch (err) {
      if (!String(err.message).includes("HTTP 404")) {
        console.warn(`  ! ${ch.handle}: no se pudo resolver el directo (${err.message})`);
      }
    }

    const recent = await latestVideos(ch.channelId);

    // Siempre hay algo que reproducir: el directo si lo hay, si no el último vídeo.
    const fallbackVideoId = recent[0]?.id ?? null;

    channels.push({
      id: ch.id,
      labelKey: ch.labelKey,
      emoji: ch.emoji,
      accent: ch.accent,
      handle: ch.handle,
      channelId: ch.channelId,
      isLive: Boolean(liveVideoId),
      liveVideoId,
      liveTitle,
      fallbackVideoId,
      recent,
    });

    console.log(
      `  ${liveVideoId ? "🔴 EN DIRECTO" : "⚪ offline    "} @${ch.handle}` +
        (liveVideoId ? ` → ${liveVideoId} · ${liveTitle ?? ""}` : ` → último: ${fallbackVideoId ?? "—"}`)
    );
  }

  const payload = { checkedAt: new Date().toISOString(), channels };
  await writeJson("live-channels.json", payload);
  return payload;
}

// ── Lanzamientos (Launch Library 2) ────────────────────────────────────────

const LL2 = "https://ll.thespacedevs.com/2.3.0";

/**
 * El campo `image` cambió de forma entre 2.2.0 y 2.3.0 (antes string, ahora
 * objeto con `image_url`). Normalizamos para que el front no se entere.
 */
function launchImage(item) {
  const img = item.image;
  if (!img) return null;
  if (typeof img === "string") return img;
  return img.image_url ?? img.thumbnail_url ?? null;
}

function mapLaunch(item) {
  const mission = item.mission ?? null;
  return {
    id: item.id,
    name: item.name,
    slug: item.slug ?? null,
    net: item.net,
    windowStart: item.window_start ?? null,
    status: {
      id: item.status?.id ?? null,
      name: item.status?.name ?? null,
      abbrev: item.status?.abbrev ?? null,
      description: item.status?.description ?? null,
    },
    provider: item.launch_service_provider?.name ?? null,
    providerType: item.launch_service_provider?.type?.name ?? item.launch_service_provider?.type ?? null,
    rocket: item.rocket?.configuration?.full_name ?? item.rocket?.configuration?.name ?? null,
    pad: item.pad?.name ?? null,
    location: item.pad?.location?.name ?? null,
    country: item.pad?.country?.name ?? item.pad?.location?.country?.name ?? null,
    image: launchImage(item),
    imageCredit: typeof item.image === "object" ? item.image?.credit ?? null : null,
    mission: mission
      ? {
          name: mission.name ?? null,
          type: mission.type ?? null,
          description: mission.description ?? null,
          orbit: mission.orbit?.name ?? null,
        }
      : null,
    webcastLive: Boolean(item.webcast_live),
    // vidURLs viene vacío en el plan gratuito de LL2; el hub de directos
    // cubre el vídeo oficial. Lo mapeamos igualmente por si se puebla.
    videos: (item.vidURLs ?? []).map((v) => ({
      url: v.url,
      title: v.title ?? null,
      source: v.source ?? null,
    })),
  };
}

async function fetchLaunches(path, limit) {
  const url = `${LL2}/launches/${path}/?limit=${limit}&mode=detailed`;
  const raw = await fetchText(url, { timeout: 60000 });
  const data = JSON.parse(raw);
  return (data.results ?? []).map(mapLaunch);
}

async function syncLaunches() {
  // LL2 anónimo limita a ~15 peticiones/hora: dos llamadas, espaciadas.
  const upcoming = await fetchLaunches("upcoming", 12);
  console.log(`  ✓ ${upcoming.length} lanzamientos próximos`);

  await sleep(2000);

  const previous = await fetchLaunches("previous", 8);
  console.log(`  ✓ ${previous.length} lanzamientos recientes`);

  const payload = {
    checkedAt: new Date().toISOString(),
    source: "Launch Library 2 (thespacedevs.com)",
    upcoming,
    previous,
  };
  await writeJson("launches.json", payload);
  return payload;
}

// ── Imagen astronómica del día (APOD) ──────────────────────────────────────

// La portada y /apod la piden en vivo desde el navegador, pero `DEMO_KEY` es una
// clave compartida por todo el mundo y vive permanentemente al borde de su cuota:
// la portada pública llevaba días enseñando «no se ha podido cargar» porque la
// API contestaba 429. Horneando la foto aquí, la tarjeta siempre pinta algo real
// aunque la API rechace al visitante; el fetch del cliente ya solo la mejora.
const APOD_PAGE = "https://apod.nasa.gov/apod/astropix.html";

/**
 * Respaldo cuando api.nasa.gov rechaza la petición. `DEMO_KEY` la comparte todo
 * el mundo y devuelve 429 buena parte del día, así que sin esto el horneado
 * dependería de la suerte. La página pública no pide clave y lleva décadas con
 * el mismo formato: título en el primer <b>, imagen en <IMG SRC="image/…">, el
 * enlace de alrededor a la versión grande, y la explicación tras «Explanation:».
 */
async function apodDesdeLaPagina() {
  const html = await fetchText(APOD_PAGE);
  const abs = (p) => (p ? new URL(p, "https://apod.nasa.gov/apod/").href : null);
  const limpia = (s) =>
    decodeEntities(s.replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ")
      .trim();

  const titulo = html.match(/<b>\s*([\s\S]*?)\s*<\/b>/i);
  const img = html.match(/<img\s+src="(image\/[^"]+)"/i);
  const grande = html.match(/<a\s+href="(image\/[^"]+)"/i);
  const expl = html.match(/Explanation:\s*<\/b>([\s\S]*?)<p>/i);
  const credito = html.match(/(?:Image|Video|Illustration)\s+Credit[^<]*(?:<[^>]+>)*\s*([\s\S]*?)<p>/i);

  if (!titulo || !img) throw new Error("no se pudo leer astropix.html");

  const hoy = new Date().toISOString().slice(0, 10);
  return {
    date: hoy,
    title: limpia(titulo[1]),
    explanation: expl ? limpia(expl[1]) : "",
    media_type: "image",
    url: abs(img[1]),
    hdurl: abs(grande?.[1] ?? img[1]),
    copyright: credito ? limpia(credito[1]).slice(0, 200) || null : null,
  };
}

async function syncApod() {
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  let d;
  try {
    d = JSON.parse(
      await fetchText(`https://api.nasa.gov/planetary/apod?api_key=${key}&thumbs=true`),
    );
    if (!d?.date || !d?.title) throw new Error("respuesta sin date/title");
  } catch (err) {
    console.log(`  · la API falló (${err.message}); leyendo la página pública`);
    d = await apodDesdeLaPagina();
    d._fuente = APOD_PAGE;
  }

  // `media_type` puede ser "video": con `thumbs=true` la API devuelve además una
  // miniatura, que es lo que se pinta en la tarjeta en vez de un <img> roto.
  const payload = {
    checkedAt: new Date().toISOString(),
    source: d._fuente ?? "NASA APOD (api.nasa.gov/planetary/apod)",
    date: d.date,
    title: d.title,
    explanation: d.explanation ?? "",
    media_type: d.media_type === "video" ? "video" : "image",
    url: d.media_type === "video" ? (d.thumbnail_url ?? null) : (d.url ?? null),
    hdurl: d.hdurl ?? null,
    copyright: d.copyright ? d.copyright.trim() : null,
  };

  console.log(`  ✓ APOD ${payload.date}: ${payload.title}`);
  await writeJson("apod.json", payload);
  return payload;
}

// ── Escritura ──────────────────────────────────────────────────────────────

async function writeJson(name, payload) {
  await mkdir(DATA_DIR, { recursive: true });
  const target = resolve(DATA_DIR, name);
  const next = JSON.stringify(payload, null, 2) + "\n";

  // Si solo cambia `checkedAt`, no reescribimos: así el cron no genera un
  // commit de ruido cada vez que pasa y no hay novedades.
  try {
    const currentRaw = await readFile(target, "utf8");
    const a = { ...JSON.parse(currentRaw), checkedAt: null };
    const b = { ...payload, checkedAt: null };
    if (JSON.stringify(a) === JSON.stringify(b)) {
      console.log(`  = ${name} sin cambios`);
      return;
    }
  } catch {
    // No existía: se crea.
  }

  await writeFile(target, next, "utf8");
  console.log(`  → ${name} actualizado`);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const only = args.find((a) => a === "--live" || a === "--launches" || a === "--apod");

  let failed = false;

  if (!only || only === "--live") {
    console.log("▶ Resolviendo canales en directo…");
    try {
      await syncLive();
    } catch (err) {
      console.error(`  ✗ live: ${err.message}`);
      failed = true;
    }
  }

  if (!only || only === "--launches") {
    console.log("▶ Descargando lanzamientos…");
    try {
      await syncLaunches();
    } catch (err) {
      console.error(`  ✗ launches: ${err.message}`);
      failed = true;
    }
  }

  if (!only || only === "--apod") {
    console.log("▶ Descargando la imagen astronómica del día…");
    try {
      await syncApod();
    } catch (err) {
      console.error(`  ✗ apod: ${err.message}`);
      failed = true;
    }
  }

  // Fallamos el job para que el cron avise, pero solo tras intentarlo todo:
  // que YouTube falle no debe impedir refrescar los lanzamientos.
  if (failed) process.exit(1);
  console.log("✔ Listo");
}

main();
