/**
 * Índice del buscador.
 *
 * La página se llama «Buscador Unificado» y hasta ahora solo miraba en
 * `MISSIONS`: 19 fichas. No encontraba lanzamientos, ni astronautas, ni las
 * misiones en curso, ni exoplanetas, ni las propias secciones del sitio. Buscar
 * «Glenn» o «TESS» no devolvía nada, aunque ambos estuvieran escritos en el
 * portal.
 *
 * Aquí se aplana todo a una lista de documentos con la misma forma, para que
 * `fuzzy.ts` solo tenga que puntuar texto y no sepa de dónde viene cada cosa.
 *
 * Todas las fuentes son estáticas o ya vienen horneadas, así que el índice se
 * construye una vez en el módulo: no hay que pedir nada a la red y funciona
 * igual en el export estático.
 */

import { MISSIONS_LIST, ACTIVE_MISSIONS } from "@/lib/nasa";
import { BAKED_LAUNCHES } from "@/lib/launches";
import astronautas from "@/data/astronauts.json";
import exoplanetas from "@/data/exoplanets.json";

export type SearchKind = "mission" | "active" | "astronaut" | "launch" | "exoplanet" | "section";

export type SearchDoc = {
  kind: SearchKind;
  id: string;
  /** Lo que se busca primero y pesa más. */
  title: string;
  subtitle: string;
  description: string;
  /** Ruta interna (sin locale) o URL absoluta si sale del sitio. */
  url: string;
  /** Términos sueltos que también deben encontrar el documento. */
  tags: string[];
};

type Locale = "en" | "es";

type Astronauta = {
  name: string;
  agency: string;
  born: string;
  died?: string | null;
  active: string;
  bio_en: string;
  bio_es: string;
  image: string;
};

/** Secciones del portal, para que buscar «ISS» o «apod» lleve a su página. */
const SECCIONES: { id: string; url: string; es: [string, string]; en: [string, string] }[] = [
  { id: "missions",   url: "/missions",   es: ["Misiones", "Archivo completo de misiones"], en: ["Missions", "Full mission archive"] },
  { id: "launches",   url: "/launches",   es: ["Lanzamientos", "Calendario de despegues"], en: ["Launches", "Launch calendar"] },
  { id: "active",     url: "/active",     es: ["Misiones en curso", "Artemis, JWST, Perseverance, ISS"], en: ["Missions in progress", "Artemis, JWST, Perseverance, ISS"] },
  { id: "solar",      url: "/solar",      es: ["Sistema Solar", "Simulador orbital"], en: ["Solar System", "Orbital simulator"] },
  { id: "exoplanets", url: "/exoplanets", es: ["Exoplanetas", "Planetas confirmados fuera del Sistema Solar"], en: ["Exoplanets", "Confirmed planets beyond the Solar System"] },
  { id: "iss",        url: "/iss",        es: ["ISS en vivo", "Posición de la Estación Espacial Internacional"], en: ["Live ISS", "International Space Station position"] },
  { id: "live",       url: "/live",       es: ["En directo", "NASA TV y NASA en Español"], en: ["Live TV", "NASA TV and NASA en Español"] },
  { id: "apod",       url: "/apod",       es: ["Imagen del día", "Astronomy Picture of the Day"], en: ["Picture of the Day", "Astronomy Picture of the Day"] },
];

export function buildSearchIndex(locale: Locale): SearchDoc[] {
  const es = locale === "es";
  const docs: SearchDoc[] = [];

  for (const m of MISSIONS_LIST) {
    const anio = m.launch_details.date?.slice(0, 4) ?? "";
    docs.push({
      kind: "mission",
      id: m.id,
      title: m.name,
      subtitle: [m.program, anio].filter(Boolean).join(" · "),
      description: m.description[locale],
      url: `/missions/${m.id}`,
      tags: [m.program, anio, m.launch_details.status].filter(Boolean),
    });
  }

  for (const m of ACTIVE_MISSIONS) {
    docs.push({
      kind: "active",
      id: m.id,
      title: m.name,
      subtitle: m.tagline[locale],
      description: m.description[locale],
      url: `/active#mission-${m.id}`,
      // Los instrumentos son justo lo que alguien buscaría por nombre suelto
      // («NIRCam», «MASTCAM-Z») y no aparecen en ningún otro sitio buscable.
      tags: [m.program, m.agency ?? "", ...(m.instruments ?? []).map((i) => i.name)].filter(Boolean),
    });
  }

  for (const [id, a] of Object.entries(astronautas as Record<string, Astronauta>)) {
    docs.push({
      kind: "astronaut",
      id,
      title: a.name,
      subtitle: `${a.agency} · ${a.active}`,
      description: es ? a.bio_es : a.bio_en,
      // No hay página propia de astronauta: el buscador lleva al archivo, que
      // es desde donde se abren sus fichas.
      url: "/missions",
      tags: [a.agency, a.born, a.died ?? ""].filter(Boolean),
    });
  }

  // Los lanzamientos horneados. `BAKED_LAUNCHES` es la foto del cron; el
  // buscador no refresca contra LL2 porque no vale la pena una petición extra
  // para teclear, y el listado de /launches sí está al día.
  for (const l of [...BAKED_LAUNCHES.upcoming, ...BAKED_LAUNCHES.previous]) {
    docs.push({
      kind: "launch",
      id: l.id,
      title: l.mission?.name ?? l.name,
      subtitle: [l.rocket, l.provider].filter(Boolean).join(" · "),
      description: l.mission?.description ?? l.name,
      url: "/launches",
      tags: [l.provider ?? "", l.rocket ?? "", l.location ?? "", l.net.slice(0, 4)].filter(Boolean),
    });
  }

  for (const p of exoplanetas.recientes) {
    docs.push({
      kind: "exoplanet",
      id: p.nombre,
      title: p.nombre,
      subtitle: `${p.metodo} · ${p.instalacion}`,
      description: es
        ? `Exoplaneta confirmado en ${p.anio}, en órbita de ${p.estrella}.`
        : `Exoplanet confirmed in ${p.anio}, orbiting ${p.estrella}.`,
      url: "/exoplanets",
      tags: [p.estrella, p.metodo, p.instalacion, String(p.anio)].filter(Boolean),
    });
  }

  for (const s of SECCIONES) {
    const [titulo, sub] = es ? s.es : s.en;
    docs.push({
      kind: "section",
      id: s.id,
      title: titulo,
      subtitle: sub,
      description: sub,
      url: s.url,
      tags: [s.id],
    });
  }

  return docs;
}
