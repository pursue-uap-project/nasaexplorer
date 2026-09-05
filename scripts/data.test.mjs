/**
 * Tests de forma de los JSON horneados.
 *
 * El sitio los importa directamente y los pinta sin validar nada. Si el cron
 * escribiera algo con otra forma —porque la API cambió, o porque una consulta
 * devolvió vacío—, el fallo saldría en el build o, peor, en la página. Esto lo
 * caza antes.
 *
 * No comprueban valores concretos (cambian cada día), solo que la estructura
 * que el código da por hecha siga ahí.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src/data");
const leer = async (n) => JSON.parse(await readFile(resolve(DATA, n), "utf8"));

test("exoplanets.json tiene lo que consume la portada", async () => {
  const d = await leer("exoplanets.json");

  assert.equal(typeof d.total, "number");
  assert.ok(d.total > 5000, `el total bajó a ${d.total}; el archivo nunca decrece, mira la consulta`);
  assert.equal(typeof d.esteAnio, "number");
  assert.equal(typeof d.anio, "number");
  assert.ok(Array.isArray(d.metodos) && d.metodos.length > 0);
  assert.ok(Array.isArray(d.recientes) && d.recientes.length > 0);
  assert.ok(!Number.isNaN(Date.parse(d.checkedAt)), "checkedAt no es una fecha");

  for (const m of d.metodos) {
    assert.equal(typeof m.metodo, "string");
    assert.equal(typeof m.n, "number");
  }
  for (const p of d.recientes) {
    assert.ok(p.nombre, "un exoplaneta sin nombre");
    assert.equal(typeof p.metodo, "string");
    // Los nulos son legítimos: en microlente el periodo casi nunca se mide.
    assert.ok(p.distanciaAl === null || typeof p.distanciaAl === "number");
    assert.ok(p.periodoDias === null || typeof p.periodoDias === "number");
  }

  // La suma por método tiene que cuadrar con el total: si no, una de las dos
  // consultas está mirando otra tabla.
  const suma = d.metodos.reduce((a, m) => a + m.n, 0);
  assert.equal(suma, d.total, `los métodos suman ${suma} y el total dice ${d.total}`);
});

test("launches.json tiene la forma que espera el tablero", async () => {
  const d = await leer("launches.json");

  assert.ok(Array.isArray(d.upcoming), "upcoming no es una lista");
  assert.ok(Array.isArray(d.previous), "previous no es una lista");
  assert.ok(!Number.isNaN(Date.parse(d.checkedAt)));

  for (const l of [...d.upcoming, ...d.previous]) {
    assert.ok(l.id, "un lanzamiento sin id");
    assert.ok(l.name, `lanzamiento ${l.id} sin nombre`);
    assert.ok(!Number.isNaN(Date.parse(l.net)), `NET no parseable en ${l.id}: ${l.net}`);
    assert.equal(typeof l.status, "object");
  }

  // El hero pinta el primero de `upcoming`: si viniera desordenado, enseñaría
  // una cuenta atrás que no es la del próximo despegue.
  const fechas = d.upcoming.map((l) => Date.parse(l.net));
  assert.deepEqual(fechas, [...fechas].sort((a, b) => a - b), "upcoming no viene ordenado por NET");
});

test("apod.json trae una imagen utilizable", async () => {
  const d = await leer("apod.json");

  assert.ok(d.url, "sin url");
  assert.match(d.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(["image", "video"].includes(d.media_type), `media_type raro: ${d.media_type}`);
  assert.ok(d.title, "sin título");
});

test("live-channels.json lista canales con id resoluble", async () => {
  const d = await leer("live-channels.json");
  assert.ok(Array.isArray(d.channels), "channels no es una lista");
  for (const c of d.channels) {
    assert.ok(c.id, "un canal sin id");
    assert.equal(typeof c.labelKey, "string");
  }
});

test("astronauts.json tiene biografía en los dos idiomas", async () => {
  const d = await leer("astronauts.json");
  const entradas = Object.entries(d);
  assert.ok(entradas.length > 0);

  for (const [id, a] of entradas) {
    assert.ok(a.name, `${id} sin nombre`);
    assert.ok(a.bio_en?.trim(), `${id} sin biografía en inglés`);
    assert.ok(a.bio_es?.trim(), `${id} sin biografía en español`);
    assert.ok(a.image?.startsWith("assets/"), `${id} con imagen fuera de assets/`);
  }
});
