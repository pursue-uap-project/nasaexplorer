/**
 * robots.txt.
 *
 * No había ninguno. Sin él un rastreador no tiene dónde encontrar el mapa del
 * sitio, que es justo lo que hace falta aquí: casi todas las URL son fichas de
 * misión a las que solo se llega filtrando en un listado de cliente.
 *
 * Se permite todo: el sitio es público y estático, y no hay nada que esconder.
 * `/_next/` se excluye porque son ficheros de build, no contenido.
 */

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/_next/"] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
