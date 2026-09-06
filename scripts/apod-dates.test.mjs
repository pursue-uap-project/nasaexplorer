/**
 * Tests de la lógica de fechas y respaldo de la imagen del día.
 *
 * `src/lib/apod-dates.ts` no importa nada, así que el runner de Node lo carga
 * directo con su type stripping: se puede probar TypeScript **sin añadir vitest
 * ni jest** al proyecto. Si algún día ese fichero importa algo con alias `@/`,
 * estos tests dejarán de resolver y habrá que buscar otra vía.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { access } from "node:fs/promises";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const {
  MIN_DATE,
  todayStr,
  shiftDate,
  randomApodDate,
  fechaValida,
  respaldoPara,
  respaldoUrl,
  FALLBACK_APODS,
} = await import(resolve(ROOT, "src/lib/apod-dates.ts"));

test("shiftDate cruza meses y años", () => {
  assert.equal(shiftDate("2024-03-10", 1), "2024-03-11");
  assert.equal(shiftDate("2024-03-01", -1), "2024-02-29", "2024 es bisiesto");
  assert.equal(shiftDate("2023-03-01", -1), "2023-02-28");
  assert.equal(shiftDate("2024-12-31", 1), "2025-01-01");
  assert.equal(shiftDate("2025-01-01", -1), "2024-12-31");
});

test("todayStr da una fecha ISO de hoy", () => {
  assert.match(todayStr(), /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(fechaValida(todayStr()));
});

test("fechaValida rechaza lo que está fuera del archivo", () => {
  assert.equal(fechaValida("1995-06-15"), false, "un día antes del primer APOD");
  assert.equal(fechaValida(MIN_DATE), true);
  assert.equal(fechaValida(shiftDate(todayStr(), 1)), false, "mañana todavía no existe");
});

test("randomApodDate cae siempre dentro del archivo", () => {
  for (const r of [0, 0.5, 0.999999]) {
    const f = randomApodDate(() => r);
    assert.ok(fechaValida(f), `${f} (aleatorio=${r}) cae fuera del archivo`);
  }
});

test("el respaldo solo se sirve para su propia fecha", () => {
  // El fallo que arregló #83: se elegía uno cualquiera y se rotulaba con la
  // fecha pedida, así que salía una foto de 1972 fechada en 2015.
  assert.equal(respaldoPara("2015-03-03"), null);

  const marble = respaldoPara("1972-12-07");
  assert.ok(marble, "la Canica Azul tiene que estar");
  assert.equal(marble.date, "1972-12-07");
});

test("cada respaldo tiene su imagen en public/", async () => {
  for (const r of FALLBACK_APODS) {
    const ruta = resolve(ROOT, "public", respaldoUrl(r).replace(/^\//, ""));
    await access(ruta).catch(() => {
      assert.fail(`falta la imagen de respaldo «${r.slug}»: ${ruta}`);
    });
  }
});

test("los respaldos están completos y no se pisan las fechas", () => {
  const fechas = new Set();
  for (const r of FALLBACK_APODS) {
    assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/, `fecha mal formada en ${r.slug}`);
    assert.ok(r.title && r.title_es, `${r.slug} sin título en los dos idiomas`);
    assert.ok(r.explanation && r.explanation_es, `${r.slug} sin texto en los dos idiomas`);
    assert.ok(r.credit, `${r.slug} sin crédito`);
    assert.ok(r.nasaId, `${r.slug} sin nasaId`);
    assert.ok(!fechas.has(r.date), `dos respaldos comparten la fecha ${r.date}`);
    fechas.add(r.date);
  }
});

test("respaldoUrl respeta el basePath", () => {
  const r = FALLBACK_APODS[0];
  assert.equal(respaldoUrl(r), `/assets/apod/${r.slug}.webp`);
  assert.equal(respaldoUrl(r, "/nasaexplorer"), `/nasaexplorer/assets/apod/${r.slug}.webp`);
});
