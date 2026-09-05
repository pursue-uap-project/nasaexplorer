/**
 * Metadatos por página.
 *
 * Antes solo `/` y `/launches` definían los suyos: las otras siete páginas y las
 * 38 fichas de misión heredaban el título del layout («NASA Explorer»), así que
 * en Google y al compartir un enlace todas se presentaban igual. Un sitio
 * divulgativo que no se distingue en resultados de búsqueda no se lee.
 *
 * Y faltaba lo más importante en un sitio bilingüe: sin `alternates.languages`
 * nada le dice a un buscador que `/en/missions` y `/es/missions` son la misma
 * página en dos idiomas, así que compiten entre sí en vez de sumar.
 *
 * El sitio es un export estático servido bajo un basePath, de modo que las URL
 * tienen que ser absolutas: una ruta relativa no la resuelve ningún rastreador
 * ni ningún scraper de redes sociales.
 */

import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/** Origen público, incluido el basePath. Es de donde se sirve GitHub Pages. */
export const SITE = "https://pursue-uap-project.github.io/nasaexplorer";

export const OG_IMAGE = `${SITE}/og.png`;

/** `/es` · `/en/missions` · `/es/missions/apollo-11` — siempre con barra final
 *  porque el export usa `trailingSlash: true` y sin ella Pages redirige. */
function urlDe(locale: string, ruta = "") {
  const limpia = ruta.replace(/^\/+|\/+$/g, "");
  return limpia ? `${SITE}/${locale}/${limpia}/` : `${SITE}/${locale}/`;
}

type Args = {
  locale: string;
  /** Ruta sin idioma ni barras: "", "missions", "missions/apollo-11". */
  path?: string;
  title: string;
  description: string;
  /** Imagen propia de la página; si no, la portada del sitio. */
  image?: string;
};

export function buildMetadata({ locale, path = "", title, description, image }: Args): Metadata {
  const url = urlDe(locale, path);
  const languages = Object.fromEntries(routing.locales.map((l) => [l, urlDe(l, path)]));

  return {
    title,
    description,
    alternates: {
      canonical: url,
      // `x-default` es la que sirve un buscador cuando no reconoce el idioma
      // del visitante; se apunta al locale por defecto del routing.
      languages: { ...languages, "x-default": urlDe(routing.defaultLocale, path) },
    },
    openGraph: {
      type: "website",
      siteName: "NASA Explorer",
      title,
      description,
      url,
      locale,
      images: [image ?? OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image ?? OG_IMAGE],
    },
  };
}
