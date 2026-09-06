#!/usr/bin/env node
/**
 * check-catalog.mjs — vigila que el catálogo escrito a mano no mienta.
 *
 * Por qué existe:
 *   Todo lo demás del sitio sale de una API y se refresca solo. `MISSIONS`, en
 *   `src/lib/nasa.ts`, está escrito a mano: es el único contenido que puede
 *   quedarse obsoleto **en silencio**, porque nada lo contrasta con la realidad.
 *
 *   El caso que lo motiva: Artemis II figuraba como
 *   `{ date: "2026-09-30", status: "planned" }` con el comentario
 *   «Updated to September 2026 for a long countdown». Había despegado el
 *   2026-04-01. Durante meses la portada sirvió una cuenta atrás hacia una fecha
 *   inventada de una misión que ya había volado, y nadie se enteró.
 *
 * Qué comprueba:
 *   1. Coherencia interna, sin red:
 *      · `planned` con la fecha ya pasada       → el catálogo se quedó atrás.
 *      · `completed`/`active` con fecha futura  → la fecha es inventada.
 *      · `countdownTarget` ya vencido           → cuenta atrás muerta.
 *   2. Contra Launch Library 2, solo para las misiones modernas (LL2 no cubre
 *      Mercury ni Apollo con fiabilidad): si LL2 dice que despegó y aquí pone
 *      `planned`, o si la fecha baila más de `TOLERANCIA_DIAS`, se reporta.
 *   3. Que los recursos que enlaza el catálogo existan de verdad: los ficheros
 *      de `public/` y los enlaces externos.
 *   4. Cifras que llevan un año escrito y ya han caducado. Varias `stats` son
 *      medidas vigentes, no hitos: «~165 AU (2025)», «Mission end: Sep 2025
 *      (est.)». Envejecen solas y nada avisa. Un hito con fecha («Pluto flyby:
 *      Jul 14, 2015») no caduca nunca, así que solo se miran los valores que se
 *      declaran a sí mismos como medida del momento: paréntesis con año o
 *      marca de estimación.
 *
 *      Esto nace de otro caso real: dos de los tres clips de audio históricos
 *      apuntaban a `nasa.gov` y devolvían 404 desde que la NASA reorganizó su
 *      web. Dos fichas de misión ofrecían un reproductor que no sonaba, y como
 *      el fallo es de un recurso y no del código, ni el build ni los tipos lo
 *      veían. Los clips se sirven ahora desde `public/`, pero el catálogo sigue
 *      teniendo enlaces externos y este paso es lo que los vigila.
 *
 * Uso:
 *   node scripts/check-catalog.mjs           # todo
 *   node scripts/check-catalog.mjs --local   # sin tocar la red
 *
 * Sale con código 1 si encuentra algún error, para que el job de Actions se vea
 * en rojo. Los avisos no rompen la ejecución.
 */

import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOGO = resolve(ROOT, "src/lib/nasa.ts");
const PUBLICO = resolve(ROOT, "public");

/** LL2 tiene cobertura fiable de lo moderno; lo anterior se comprueba a mano. */
const DESDE_ANIO = 2015;
/** Un NET puede moverse días sin que el catálogo esté «mal». */
const TOLERANCIA_DIAS = 30;
/** LL2 es gratuita y con cuota: se va de una en una y con pausa. */
const PAUSA_MS = 1500;

/**
 * Cuántas misiones se contrastan por pasada.
 *
 * LL2 estrangula al cabo de unas pocas peticiones anónimas. Al pasar el
 * catálogo de 19 a 25 misiones, diez entraban en el filtro de «modernas» y a
 * partir de la tercera todo salía 429: el guardia dejaba de contrastar **en
 * silencio**, porque un 429 es aviso y no error. Se prioriza lo que de verdad
 * se pudre y se corta ahí.
 */
const MAX_CONSULTAS = 6;

const LL2 = "https://ll.thespacedevs.com/2.3.0";
const HOY = new Date();

/**
 * Mínimo de misiones que el parser debe encontrar. Si `nasa.ts` se refactoriza
 * y las expresiones dejan de encajar, el guardia tiene que gritar en vez de
 * pasar en verde con cero misiones.
 */
export const MINIMO_MISIONES = 15;

const errores = [];
const avisos = [];

const err = (msg) => errores.push(msg);
const avisa = (msg) => avisos.push(msg);

/**
 * Extrae las misiones del catálogo leyéndolo como texto.
 *
 * Sí, es un parser por expresión regular sobre TypeScript. La alternativa era
 * importar `nasa.ts` desde Node, y no se puede: importa `./youtube` sin
 * extensión, que el ESM de Node no resuelve. Como un parser frágil que deja de
 * encontrar nada es peor que no tener parser —pasaría en verde para siempre—,
 * `main()` aborta si saca menos misiones de las que ya sabemos que hay.
 */
export function extraerMisiones(fuente) {
  const misiones = [];
  // Cada entrada empieza por `id: "…"` y trae luego `name` y `launch_details`.
  const re =
    /\bid:\s*"([^"]+)",\s*\n\s*name:\s*"([^"]+)",[\s\S]*?launch_details:\s*\{\s*date:\s*"([^"]*)",\s*status:\s*"([^"]+)"\s*\}/g;

  for (const m of fuente.matchAll(re)) {
    const [bloque, id, name, date, status] = m;
    // `countdownTarget` vive después de `launch_details`, dentro de la misma
    // entrada: se busca en el trozo que va de aquí al siguiente `id:`.
    const desde = m.index + bloque.length;
    const siguiente = fuente.indexOf('\n    id: "', desde);
    const resto = fuente.slice(desde, siguiente === -1 ? undefined : siguiente);
    const cd = resto.match(/countdownTarget:\s*"([^"]+)"/);
    // Alias de búsqueda para nombres ambiguos en LL2 (ver `ll2Query` en nasa.ts).
    const ll2 = resto.match(/ll2Query:\s*"([^"]+)"/);
    misiones.push({
      id,
      name,
      date,
      status,
      countdownTarget: cd?.[1] ?? null,
      ll2Query: ll2?.[1] ?? null,
    });
  }
  return misiones;
}

const dias = (a, b) => Math.abs(a.getTime() - b.getTime()) / 86_400_000;

function revisarCoherencia(misiones) {
  for (const m of misiones) {
    if (!m.date) {
      avisa(`${m.id}: sin fecha de lanzamiento.`);
      continue;
    }
    const fecha = new Date(`${m.date}T00:00:00Z`);
    if (Number.isNaN(fecha.getTime())) {
      err(`${m.id}: la fecha "${m.date}" no es válida.`);
      continue;
    }
    const futura = fecha > HOY;

    if (m.status === "planned" && !futura) {
      err(
        `${m.id} (${m.name}): marcada como "planned" pero su fecha ${m.date} ya pasó. ` +
          `O despegó y hay que ponerla en "completed"/"active", o la fecha está desfasada.`,
      );
    }
    if (m.status !== "planned" && futura) {
      err(
        `${m.id} (${m.name}): marcada como "${m.status}" con fecha futura ${m.date}. ` +
          `Una misión que ya voló no puede lanzarse mañana: la fecha es inventada.`,
      );
    }
    if (m.countdownTarget && new Date(m.countdownTarget) < HOY) {
      avisa(`${m.id}: countdownTarget ${m.countdownTarget} ya venció; la cuenta atrás sale a cero.`);
    }
  }
}

const normaliza = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Busca la misión en LL2 por nombre. `null` si no hay nada que se le parezca. */
async function buscarEnLL2(nombre, reintentos = 1) {
  const url = `${LL2}/launches/?search=${encodeURIComponent(nombre)}&limit=8&mode=list`;
  const res = await fetch(url, { headers: { accept: "application/json" } });

  // LL2 dice en el cuerpo cuánto falta: «Expected available in N seconds».
  // Merece la pena esperar una vez antes que renunciar a contrastar.
  if (res.status === 429 && reintentos > 0) {
    const cuerpo = await res.text().catch(() => "");
    const segundos = Number(/in (\d+) seconds/.exec(cuerpo)?.[1] ?? 60);
    const espera = Math.min(segundos + 2, 90);
    console.log(`  · LL2 estrangula; esperando ${espera}s antes de reintentar…`);
    await new Promise((r) => setTimeout(r, espera * 1000));
    return buscarEnLL2(nombre, reintentos - 1);
  }

  if (!res.ok) throw new Error(`LL2 respondió ${res.status}`);
  const { results = [] } = await res.json();

  const objetivo = normaliza(nombre);
  for (const r of results) {
    // LL2 nombra el lanzamiento «SLS Block 1 | Artemis II»: el nombre de la
    // misión va detrás de la barra, así que basta con que esté contenido.
    const candidatos = [r.name, r.mission?.name].filter(Boolean).map(normaliza);
    if (candidatos.some((c) => c.includes(objetivo))) return r;
  }
  return null;
}

async function revisarContraLL2(misiones) {
  const modernas = misiones
    .filter((m) => {
      const anio = Number(m.date?.slice(0, 4));
      return Number.isFinite(anio) && anio >= DESDE_ANIO;
    })
    // Primero las `planned`: son las únicas que pueden haber despegado sin que
    // nadie lo actualice, que es el fallo original de Artemis II. Después, las
    // más recientes, que son las que más se mueven.
    .sort((a, b) => (a.status === "planned" ? -1 : b.status === "planned" ? 1 : 0) || b.date.localeCompare(a.date))
    .slice(0, MAX_CONSULTAS);

  console.log(`Contrastando ${modernas.length} misiones contra LL2 (las que más se mueven)…`);

  for (const m of modernas) {
    let hit;
    try {
      // `ll2Query` gana cuando el nombre de la misión es ambiguo: buscar
      // «DART» devuelve una misión de 2005 con las mismas siglas.
      hit = await buscarEnLL2(m.ll2Query ?? m.name);
    } catch (e) {
      // Que LL2 no conteste no es un fallo del catálogo: se avisa y se sigue.
      avisa(`${m.id}: no se pudo consultar LL2 (${e.message}).`);
      continue;
    }
    if (!hit) {
      avisa(`${m.id} (${m.name}): sin coincidencia en LL2; se queda sin contrastar.`);
      continue;
    }

    const estadoLL2 = hit.status?.name ?? "";
    const despego = /success|failure|partial/i.test(estadoLL2);

    if (m.status === "planned" && despego) {
      err(
        `${m.id} (${m.name}): el catálogo dice "planned" para el ${m.date}, ` +
          `pero LL2 la da como "${estadoLL2}" el ${hit.net?.slice(0, 10)}.`,
      );
    } else if (hit.net) {
      const desvio = dias(new Date(`${m.date}T00:00:00Z`), new Date(hit.net));
      if (desvio > TOLERANCIA_DIAS) {
        err(
          `${m.id} (${m.name}): fecha ${m.date} en el catálogo frente a ` +
            `${hit.net.slice(0, 10)} en LL2 — ${Math.round(desvio)} días de diferencia.`,
        );
      }
    }

    await new Promise((r) => setTimeout(r, PAUSA_MS));
  }
}

/**
 * Recursos que enlaza el catálogo: ficheros servidos desde `public/` (rutas
 * relativas, como `assets/audio/…`) y enlaces externos (URL absolutas).
 */
/**
 * Cifras fechadas que ya han quedado atrás.
 *
 * Se miran solo dos formas, para no marcar hitos históricos: un valor que
 * termina en «(AAAA)» —la medida es de ese año— y uno que lleva «(est.)» junto
 * a un año. Ambos dicen «esto era así entonces», y si el año pasó, ya no lo es.
 */
export function revisarCifrasCaducadas(fuente, avisar = avisa) {
  const anioActual = new Date().getFullYear();
  for (const m of fuente.matchAll(/label:\s*"([^"]+)",\s*value:\s*"([^"]+)"/g)) {
    const [, label, value] = m;
    const fechada = /\((\d{4})\)\s*$/.exec(value);
    const estimada = /(\d{4})[^)]*\(est\.\)/.exec(value);
    const anio = Number(fechada?.[1] ?? estimada?.[1]);
    if (anio && anio < anioActual) {
      avisar(
        `Cifra caducada — «${label}: ${value}» está fechada en ${anio} y estamos en ` +
          `${anioActual}. Es una medida del momento, no un hito: hay que refrescarla.`,
      );
    }
  }
}

/**
 * Comprueba que `ACTIVE_MISSIONS` no se separe de `MISSIONS_LIST`.
 *
 * Tres misiones están descritas en las dos listas. Un `missionId` que no exista
 * en el catálogo es un enlace roto; y si en el futuro se derivan campos de una
 * a otra, esto es lo que avisa de que la referencia ya no vale.
 */
export function revisarVinculos(fuente, misiones, avisar = err) {
  const conocidos = new Set(misiones.map((m) => m.id));
  const activas = fuente.slice(fuente.indexOf("ACTIVE_MISSIONS"));
  for (const m of activas.matchAll(/missionId:\s*"([^"]+)"/g)) {
    if (!conocidos.has(m[1])) {
      avisar(
        `ACTIVE_MISSIONS apunta a missionId "${m[1]}", que no existe en MISSIONS_LIST. ` +
          "O se renombró la ficha, o el vínculo se quedó atrás.",
      );
    }
  }
}

export function extraerRecursos(fuente) {
  const locales = new Set();
  const remotos = new Set();

  // Los campos que apuntan a algo: `image`, `url` y `source` de audioClip.
  for (const m of fuente.matchAll(/\b(?:image|url|source):\s*"([^"]+)"/g)) {
    const v = m[1];
    if (!v) continue;
    if (/^https?:\/\//.test(v)) remotos.add(v);
    else if (v.startsWith("assets/")) locales.add(v);
  }
  return { locales: [...locales], remotos: [...remotos] };
}

async function revisarRecursos({ locales, remotos }, soloLocal) {
  for (const rel of locales) {
    try {
      await access(resolve(PUBLICO, rel));
    } catch {
      err(`El catálogo enlaza public/${rel} y ese fichero no existe.`);
    }
  }
  console.log(`Ficheros locales comprobados: ${locales.length}.`);

  if (soloLocal) return;

  console.log(`Comprobando ${remotos.length} enlaces externos…`);
  for (const url of remotos) {
    try {
      // HEAD basta y no descarga el fichero; se siguen redirecciones porque
      // nasa.gov las usa al reorganizar rutas.
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (!res.ok) err(`${url} devuelve ${res.status}.`);
    } catch (e) {
      avisa(`No se pudo comprobar ${url} (${e.message}).`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}

async function main() {
  const soloLocal = process.argv.includes("--local");
  const fuente = await readFile(CATALOGO, "utf8");
  const misiones = extraerMisiones(fuente);

  // Red de seguridad del parser: si `nasa.ts` se refactoriza y las expresiones
  // dejan de encajar, esto tiene que gritar, no pasar en verde con 0 misiones.
  const MINIMO = MINIMO_MISIONES;
  if (misiones.length < MINIMO) {
    console.error(
      `::error::El parser solo ha encontrado ${misiones.length} misiones en src/lib/nasa.ts ` +
        `(esperaba al menos ${MINIMO}). Probablemente cambió la forma del catálogo y ` +
        `check-catalog.mjs se ha quedado ciego: hay que actualizar la expresión.`,
    );
    process.exit(1);
  }
  console.log(`Catálogo leído: ${misiones.length} misiones.`);

  revisarCoherencia(misiones);
  revisarCifrasCaducadas(fuente);
  revisarVinculos(fuente, misiones);
  await revisarRecursos(extraerRecursos(fuente), soloLocal);
  if (!soloLocal) await revisarContraLL2(misiones);

  const enActions = Boolean(process.env.GITHUB_ACTIONS);
  for (const a of avisos) console.log(enActions ? `::warning::${a}` : `AVISO  ${a}`);
  for (const e of errores) console.log(enActions ? `::error::${e}` : `ERROR  ${e}`);

  if (errores.length) {
    console.error(`\n${errores.length} problema(s) en el catálogo de misiones.`);
    process.exit(1);
  }
  console.log(`\nCatálogo coherente. ${avisos.length} aviso(s).`);
}

// Solo al ejecutarlo como script: importarlo desde un test no debe salir a la
// red ni terminar el proceso.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(`::error::check-catalog falló: ${e.stack ?? e}`);
    process.exit(1);
  });
}
