/**
 * Mapa del sitio.
 *
 * No había ninguno: un sitio de ~100 URL estáticas, la mayoría fichas de misión
 * a las que solo se llega tras filtrar en un listado cliente, dependía de que un
 * rastreador siguiera enlaces hasta el fondo. Con `output: "export"` esto se
 * genera en build y sale como `/sitemap.xml` junto al resto de ficheros.
 *
 * Cada URL declara sus variantes de idioma en `alternates.languages`, igual que
 * los metadatos de cada página: es la otra mitad de la señal que necesita un
 * buscador para no tratar `/en/...` y `/es/...` como duplicados.
 */

import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getMissions } from "@/lib/nasa";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

/** Secciones fijas. La portada es `""`. */
const SECCIONES = ["", "missions", "launches", "active", "solar", "exoplanets", "iss", "live", "apod", "search"];

/** Cuánto se espera que cambie cada sección; orienta al rastreador, no manda. */
const FRECUENCIA: Record<string, MetadataRoute.Sitemap[number]["changeFrequency"]> = {
  "": "daily",
  launches: "daily",
  apod: "daily",
  live: "hourly",
  iss: "daily",
  active: "weekly",
  exoplanets: "weekly",
  missions: "monthly",
  solar: "monthly",
  search: "monthly",
};

function url(locale: string, ruta: string) {
  return ruta ? `${SITE}/${locale}/${ruta}/` : `${SITE}/${locale}/`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const missions = await getMissions();
  const rutas = [...SECCIONES, ...missions.map((m) => `missions/${m.id}`)];

  return rutas.flatMap((ruta) =>
    routing.locales.map((locale) => ({
      url: url(locale, ruta),
      lastModified: new Date(),
      changeFrequency: FRECUENCIA[ruta] ?? "yearly",
      // Las fichas de misión son el contenido propio del sitio, pero las
      // secciones son la puerta de entrada.
      priority: ruta === "" ? 1 : SECCIONES.includes(ruta) ? 0.8 : 0.6,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, url(l, ruta)])),
      },
    })),
  );
}
