/**
 * Traducción de las etiquetas que viven dentro del catálogo.
 *
 * `stats` y `program` se escriben en inglés en `nasa.ts` porque son parte del
 * dato, no de la interfaz: «Moonwalk», «Deep Space». Pero se pintan tal cual, y
 * en la versión española quedaba una ficha con el texto en español y las
 * etiquetas en inglés — CREW, LANDING, MOONWALK, SAMPLES.
 *
 * No se traducen en el catálogo (obligaría a duplicar 56 cadenas en cada
 * entrada) sino aquí, con el inglés como clave. Si falta una traducción se
 * devuelve el original: una etiqueta sin traducir es fea, pero una clave cruda
 * en pantalla («mission.stat.Moonwalk») es peor.
 */

type Traductor = {
  (clave: string): string;
  has?: (clave: string) => boolean;
};

function traducirSiExiste(t: Traductor, clave: string, original: string): string {
  try {
    if (t.has && !t.has(clave)) return original;
    const valor = t(clave);
    // Sin `has` disponible, next-intl devuelve la clave completa al no encontrarla.
    return valor && !valor.includes(clave) ? valor : original;
  } catch {
    return original;
  }
}

/** Etiqueta de una fila de `stats`. `t` tiene que ser del namespace `mission`. */
export function etiquetaStat(t: Traductor, label: string): string {
  return traducirSiExiste(t, `stat.${label}`, label);
}

/** Nombre de programa. `t` tiene que ser del namespace `mission_program`. */
export function nombrePrograma(t: Traductor, programa: string): string {
  return traducirSiExiste(t, programa, programa);
}
