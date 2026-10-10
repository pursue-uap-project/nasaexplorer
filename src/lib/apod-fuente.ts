/**
 * De dónde sale la imagen astronómica del día desde que la NASA mudó APOD.
 *
 * El 2026-09-29 APOD pasó de apod.nasa.gov a science.nasa.gov/apod, un
 * WordPress. `api.nasa.gov/planetary/apod` siguió contestando 200, pero con un
 * relleno: título «NASA Science», el logo como imagen y la explicación de otro
 * día. La NASA la archiva el 2026-12-01.
 *
 * Lo que la sustituye es el endpoint REST del propio WordPress:
 *
 * - Sin clave. Adiós a `DEMO_KEY` y sus 429.
 * - Manda CORS para el origen de GitHub Pages: se puede pedir desde el navegador.
 * - La fecha va en la RUTA (`/261010`); `?date=` se ignora sin avisar y
 *   devuelve los 25 últimos. Una fecha sin APOD da 404.
 * - `url` ya no es la imagen sino la página del artículo; la foto está en
 *   `hdurl`.
 * - `explanation` y `copyright` llegan en HTML, con etiquetas («Explanation:»,
 *   «Image Credit:») y avisos del editor al final.
 * - Los vídeos no traen URL de vídeo, solo un fotograma en `hdurl`. Cuando no
 *   hay ni eso, `hdurl` es una miniatura genérica del sitio.
 *
 * No está documentado como API pública, así que puede cambiar sin aviso: por
 * eso `normalizarApod` lanza si falta lo imprescindible en vez de publicar un
 * APOD vacío.
 *
 * Igual que `apod-dates.ts`, este fichero **no importa nada** para que el
 * runner de Node pueda cargarlo en los tests y en el script del cron.
 */

export const APOD_API = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";

/** Portada de APOD en su casa nueva. */
export const APOD_PORTADA = "https://science.nasa.gov/apod/";

/** URL de la API para una fecha `YYYY-MM-DD`, o para la última si no se pasa. */
export function urlApod(fecha?: string): string {
  if (!fecha) return `${APOD_API}?per_page=1`;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!m) throw new Error(`fecha no válida: ${fecha}`);
  return `${APOD_API}/${m[1].slice(2)}${m[2]}${m[3]}`;
}

/** Lo que la tarjeta y la página pintan. Misma forma que `apod.json`. */
export type ApodNormalizado = {
  date: string;
  title: string;
  explanation: string;
  media_type: "image" | "video";
  /** Imagen, o fotograma si es un vídeo. `null` si la NASA no da ninguna. */
  url: string | null;
  hdurl: string | null;
  /** La API nueva no da la URL del vídeo; se ve en `pageUrl`. */
  videoUrl: null;
  /** Página del día en science.nasa.gov. */
  pageUrl: string;
  copyright: string | null;
};

const ENTIDADES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

/** HTML a texto plano. Sin DOM, porque también corre en Node. */
export function htmlATexto(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (todo: string, n: string) => ENTIDADES[n.toLowerCase()] ?? todo)
    .replace(/\s+([.,;:!?)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * La explicación sin la etiqueta inicial ni lo que el editor cuelga detrás
 * («Free Presentation:», «Almost Hyperspace:»…), que va tras un doble salto
 * de línea y un rótulo en negrita.
 */
export function limpiarExplicacion(html: string): string {
  const cuerpo = html.split(/<br\s*\/?>\s*<br\s*\/?>\s*<(?:b|strong)\b/i)[0];
  return htmlATexto(cuerpo).replace(/^Explanation:\s*/i, "");
}

/**
 * El crédito sin rótulos: «Image Credit & Copyright:», «Video Credit:»,
 * «Illustration Credit:»… y lo que venga tras un salto de línea («Text:»,
 * «Music:»), que no es autoría de la imagen.
 */
export function limpiarCredito(html: string): string | null {
  const primera = html.split(/<br\s*\/?>/i)[0];
  const texto = htmlATexto(primera).replace(/^[^:]{0,60}(?:Credit|Copyright)[^:]{0,40}:\s*/i, "");
  return texto || null;
}

/** Miniaturas genéricas del sitio que la API pone cuando no hay imagen. */
export function esImagenGenerica(url: string): boolean {
  return /\/images\/misc\/|news-thumbnail|NASA-Meatball/i.test(url);
}

const vacio = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

/** Respuesta de la API (un objeto o una lista de uno) a lo que pinta la web. */
export function normalizarApod(crudo: unknown): ApodNormalizado {
  const d = (Array.isArray(crudo) ? crudo[0] : crudo) as Record<string, unknown> | undefined;
  const date = vacio(d?.date);
  const title = vacio(d?.title);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !title) {
    throw new Error("respuesta de APOD sin date/title");
  }
  // El relleno de la API vieja. Si algún día el endpoint nuevo hace lo mismo,
  // mejor fallar que publicar el logo de la NASA como foto del día.
  if (title === "NASA Science") throw new Error("APOD devolvió el relleno «NASA Science»");

  const hd = vacio(d?.hdurl);
  const imagen = hd && !esImagenGenerica(hd) ? hd : null;

  return {
    date,
    title: htmlATexto(title),
    explanation: limpiarExplicacion(typeof d?.explanation === "string" ? d.explanation : ""),
    media_type: d?.media_type === "video" ? "video" : "image",
    url: imagen,
    hdurl: imagen,
    videoUrl: null,
    pageUrl: vacio(d?.permalink) ?? vacio(d?.url) ?? APOD_PORTADA,
    copyright: limpiarCredito(typeof d?.copyright === "string" ? d.copyright : ""),
  };
}
