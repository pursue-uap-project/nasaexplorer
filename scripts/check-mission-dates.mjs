#!/usr/bin/env node
/**
 * check-mission-dates.mjs — vigila que el catálogo escrito a mano no mienta.
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
 *
 * Uso:
 *   node scripts/check-mission-dates.mjs           # todo
 *   node scripts/check-mission-dates.mjs --local   # sin tocar la red
 *
 * Sale con código 1 si encuentra algún error, para que el job de Actions se vea
 * en rojo. Los avisos no rompen la ejecución.
 */

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOGO = resolve(ROOT, "src/lib/nasa.ts");

/** LL2 tiene cobertura fiable de lo moderno; lo anterior se comprueba a mano. */
const DESDE_ANIO = 2015;
/** Un NET puede moverse días sin que el catálogo esté «mal». */
const TOLERANCIA_DIAS = 30;
/** LL2 es gratuita y con cuota: se va de una en una y con pausa. */
const PAUSA_MS = 1500;

const LL2 = "https://ll.thespacedevs.com/2.3.0";
const HOY = new Date();

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
function extraerMisiones(fuente) {
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
    misiones.push({ id, name, date, status, countdownTarget: cd?.[1] ?? null });
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
async function buscarEnLL2(nombre) {
  const url = `${LL2}/launches/?search=${encodeURIComponent(nombre)}&limit=8&mode=list`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
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
  const modernas = misiones.filter((m) => {
    const anio = Number(m.date?.slice(0, 4));
    return Number.isFinite(anio) && anio >= DESDE_ANIO;
  });

  console.log(`Contrastando ${modernas.length} misiones de ${DESDE_ANIO} en adelante contra LL2…`);

  for (const m of modernas) {
    let hit;
    try {
      hit = await buscarEnLL2(m.name);
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

async function main() {
  const soloLocal = process.argv.includes("--local");
  const fuente = await readFile(CATALOGO, "utf8");
  const misiones = extraerMisiones(fuente);

  // Red de seguridad del parser: si `nasa.ts` se refactoriza y las expresiones
  // dejan de encajar, esto tiene que gritar, no pasar en verde con 0 misiones.
  const MINIMO = 15;
  if (misiones.length < MINIMO) {
    console.error(
      `::error::El parser solo ha encontrado ${misiones.length} misiones en src/lib/nasa.ts ` +
        `(esperaba al menos ${MINIMO}). Probablemente cambió la forma del catálogo y ` +
        `check-mission-dates.mjs se ha quedado ciego: hay que actualizar la expresión.`,
    );
    process.exit(1);
  }
  console.log(`Catálogo leído: ${misiones.length} misiones.`);

  revisarCoherencia(misiones);
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

main().catch((e) => {
  console.error(`::error::check-mission-dates falló: ${e.stack ?? e}`);
  process.exit(1);
});
