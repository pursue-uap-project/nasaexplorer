/**
 * Fechas de la imagen astronómica del día y su respaldo local.
 *
 * Vivía dentro de `ApodView.tsx`, mezclado con 400 líneas de JSX. Sacado aquí
 * por dos motivos: se puede probar, y **este fichero no importa nada**, así que
 * el runner de Node lo carga directamente con su type stripping — sin añadir
 * vitest ni jest al proyecto por cuatro funciones puras.
 *
 * Cuidado al añadir imports: en cuanto haya uno con alias `@/`, deja de poder
 * importarse desde un test y hay que buscar otra forma.
 */

export const MIN_DATE = "1995-06-16";

export type ApodData = {
  title: string;
  url: string;
  hdurl?: string;
  media_type: string;
  explanation: string;
  date: string;
  copyright?: string;
};

/** `YYYY-MM-DD` en hora local, que es la que ve quien mira la página. */
export function aIso(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function todayStr(): string {
  return aIso(new Date());
}

/** Suma días a una fecha ISO. Pasa de mes y de año solo, vía `Date`. */
export function shiftDate(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return aIso(new Date(y, m - 1, d + n));
}

/** Fecha al azar dentro del archivo publicado. */
export function randomApodDate(aleatorio: () => number = Math.random): string {
  const inicio = new Date(MIN_DATE).getTime();
  const fin = Date.now();
  return aIso(new Date(inicio + aleatorio() * (fin - inicio)));
}

/** ¿Está la fecha dentro del archivo? */
export function fechaValida(fecha: string): boolean {
  return fecha >= MIN_DATE && fecha <= todayStr();
}

type Respaldo = {
  slug: string;
  title: string;
  title_es: string;
  explanation: string;
  explanation_es: string;
  date: string;
  credit: string;
  nasaId: string;
};

/**
 * Respaldo para cuando la API no contesta.
 *
 * Las imágenes se sirven desde `public/assets/apod/`, no enlazadas al archivo:
 * las cinco URL que había apuntaban a un tamaño `~medium` que varios de esos
 * assets no tienen, así que **cuatro de las cinco daban 403 o no cargaban** —
 * el respaldo fallaba justo cuando hacía falta. Una además estaba mal escrita
 * (`PIA PIA24542`), y otra apuntaba a `PIA14421`, que no son los Pilares de la
 * Creación sino «Bouldery Crater near Mare Australe»: una foto de un cráter
 * lunar rotulada como una nebulosa.
 */
export const FALLBACK_APODS: Respaldo[] = [
  {
    slug: "pillars",
    title: "Pillars of Creation (Hubble)",
    title_es: "Pilares de la Creación (Hubble)",
    explanation:
      "Three giant columns of cold gas in the Eagle Nebula, bathed in the ultraviolet light of a cluster of young stars. They are a stellar nursery: new stars are forming inside the dense pockets of dust.",
    explanation_es:
      "Tres columnas gigantes de gas frío en la nebulosa del Águila, bañadas por la luz ultravioleta de un cúmulo de estrellas jóvenes. Son una guardería estelar: dentro de esas bolsas densas de polvo se están formando estrellas nuevas.",
    date: "2015-01-05",
    credit: "NASA/GSFC",
    nasaId: "GSFC_20171208_Archive_e000732",
  },
  {
    slug: "blue-marble",
    title: "The Blue Marble (Apollo 17)",
    title_es: "La Canica Azul (Apolo 17)",
    explanation:
      "Earth photographed by the Apollo 17 crew on their way to the Moon, from about 29,000 km. It is one of the most reproduced photographs in history.",
    explanation_es:
      "La Tierra fotografiada por la tripulación del Apolo 17 camino de la Luna, desde unos 29.000 km. Es una de las fotografías más reproducidas de la historia.",
    date: "1972-12-07",
    credit: "NASA",
    nasaId: "as17-148-22727",
  },
  {
    slug: "hubble-xdf",
    title: "Hubble eXtreme Deep Field",
    title_es: "Campo Ultra Profundo del Hubble",
    explanation:
      "Ten years of Hubble exposures of one small patch of sky in Fornax, combined into a single image. It contains thousands of galaxies, some of them seen as they were 13.2 billion years ago.",
    explanation_es:
      "Diez años de exposiciones del Hubble sobre un trozo pequeño de cielo en Fornax, combinadas en una sola imagen. Contiene miles de galaxias, algunas vistas tal como eran hace 13.200 millones de años.",
    date: "2012-09-25",
    credit: "NASA/GSFC",
    nasaId: "GSFC_20171208_Archive_e001651",
  },
  {
    slug: "perseverance-selfie",
    title: "Perseverance and Ingenuity on Mars",
    title_es: "Perseverance e Ingenuity en Marte",
    explanation:
      "The Perseverance rover photographs itself next to the Ingenuity helicopter in Jezero Crater, days before the first powered flight on another planet.",
    explanation_es:
      "El rover Perseverance se fotografía junto al helicóptero Ingenuity en el cráter Jezero, días antes del primer vuelo con motor en otro planeta.",
    date: "2021-04-06",
    credit: "NASA/JPL-Caltech/MSSS",
    nasaId: "PIA24542",
  },
  {
    slug: "webb-deep-field",
    title: "Webb's First Deep Field",
    title_es: "Primer campo profundo del Webb",
    explanation:
      "SMACS 0723, the first full-colour image from the James Webb Space Telescope. The galaxy cluster in the foreground bends the light of far more distant galaxies behind it, acting as a lens.",
    explanation_es:
      "SMACS 0723, la primera imagen a todo color del telescopio espacial James Webb. El cúmulo de galaxias del primer plano curva la luz de galaxias mucho más lejanas que hay detrás, actuando como una lente.",
    date: "2022-07-12",
    credit: "NASA/ESA/CSA/STScI",
    nasaId: "webb_first_deep_field",
  },
];

/**
 * Respaldo para una fecha concreta, **solo si es el suyo**.
 *
 * Antes, si no había coincidencia se elegía uno cualquiera con
 * `suma de dígitos % 5` y se pintaba con la fecha pedida: pedías el 3 de marzo
 * de 2015 y salía una foto de 1972 rotulada como de ese día. Con cinco imágenes
 * para treinta años de archivo, eso pasaba casi siempre.
 */
export function respaldoPara(fecha: string): Respaldo | null {
  return FALLBACK_APODS.find((f) => f.date === fecha) ?? null;
}

/** Ruta de la imagen dentro de `public/`. */
export function respaldoUrl(r: Respaldo, base = ""): string {
  return `${base}/assets/apod/${r.slug}.webp`;
}
