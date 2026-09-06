/**
 * Tests del guardia del catálogo.
 *
 * No busco cobertura: cubro lo que ya ha fallado. El parser de `nasa.ts` lee
 * TypeScript **con expresión regular**, así que un refactor del catálogo puede
 * dejarlo encontrando cero misiones y pasando en verde para siempre. Ese es el
 * modo de fallo peligroso, y es el que se comprueba aquí.
 *
 * Sin dependencias: runner de Node 22.
 *
 *   npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  extraerMisiones,
  extraerRecursos,
  revisarCifrasCaducadas,
  revisarVinculos,
  MINIMO_MISIONES,
} from "./check-catalog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fuente = await readFile(resolve(ROOT, "src/lib/nasa.ts"), "utf8");

test("el parser encuentra el catálogo real", () => {
  const misiones = extraerMisiones(fuente);
  assert.ok(
    misiones.length >= MINIMO_MISIONES,
    `esperaba al menos ${MINIMO_MISIONES} misiones, encontró ${misiones.length}. ` +
      "Si el catálogo se refactorizó, hay que actualizar la expresión del parser.",
  );

  const apolo = misiones.find((m) => m.id === "apollo-11");
  assert.ok(apolo, "apollo-11 tiene que estar en el catálogo");
  assert.equal(apolo.name, "Apollo 11");
  assert.equal(apolo.date, "1969-07-16");
  assert.equal(apolo.status, "completed");
});

test("toda misión sale con id, nombre y estado válidos", () => {
  const validos = new Set(["active", "completed", "planned"]);
  for (const m of extraerMisiones(fuente)) {
    assert.ok(m.id, "id vacío");
    assert.ok(m.name, `nombre vacío en ${m.id}`);
    assert.ok(validos.has(m.status), `estado raro en ${m.id}: ${m.status}`);
    assert.match(m.date, /^\d{4}-\d{2}-\d{2}$/, `fecha mal formada en ${m.id}`);
  }
});

test("el parser devuelve vacío si el catálogo cambia de forma", () => {
  // El caso que motiva el guardia del mínimo: si esto devolviera algo, el
  // `MINIMO_MISIONES` de `main()` no estaría protegiendo de nada.
  assert.equal(extraerMisiones("const MISSIONS = [{ nombre: 'Apollo 11' }];").length, 0);
});

test("los recursos se separan en locales y remotos", () => {
  const { locales, remotos } = extraerRecursos(fuente);
  assert.ok(locales.length > 0, "esperaba rutas de public/");
  assert.ok(locales.every((r) => r.startsWith("assets/")), "una ruta local no empieza por assets/");
  assert.ok(remotos.every((u) => u.startsWith("http")), "un remoto no es una URL");
});

test("solo se marcan caducadas las cifras que se declaran del momento", () => {
  const anioPasado = new Date().getFullYear() - 1;
  const avisos = [];
  revisarCifrasCaducadas(
    `
      { label: "Distance",    value: "~165 AU (${anioPasado})" },
      { label: "Mission end", value: "Sep ${anioPasado} (est.)" },
      { label: "Pluto flyby", value: "Jul 14, 2015" },
      { label: "Crew",        value: "Armstrong · Collins · Aldrin" },
    `,
    (m) => avisos.push(m),
  );

  assert.equal(avisos.length, 2, `esperaba 2 avisos, hubo ${avisos.length}: ${avisos.join(" | ")}`);
  assert.ok(avisos.some((a) => a.includes("Distance")));
  assert.ok(avisos.some((a) => a.includes("Mission end")));
  // Un hito con fecha no caduca nunca; marcarlo sería ruido que acaba ignorándose.
  assert.ok(!avisos.some((a) => a.includes("Pluto flyby")));
});

test("una cifra fechada este año todavía no ha caducado", () => {
  const avisos = [];
  revisarCifrasCaducadas(
    `{ label: "Distance", value: "~170 AU (${new Date().getFullYear()})" },`,
    (m) => avisos.push(m),
  );
  assert.equal(avisos.length, 0);
});

test("los missionId de ACTIVE_MISSIONS apuntan a fichas que existen", () => {
  const errores = [];
  revisarVinculos(fuente, extraerMisiones(fuente), (m) => errores.push(m));
  assert.deepEqual(errores, [], "hay un vínculo roto entre las dos listas de misiones");
});

test("un missionId inventado se detecta", () => {
  const errores = [];
  revisarVinculos(
    'ACTIVE_MISSIONS = [{ missionId: "no-existe" }]',
    [{ id: "apollo-11" }],
    (m) => errores.push(m),
  );
  assert.equal(errores.length, 1);
  assert.match(errores[0], /no-existe/);
});

test("el parser recoge el alias de búsqueda en LL2", () => {
  // DART hizo fallar el guardia en rojo por un dato correcto: buscar su nombre
  // en Launch Library devuelve una misión de 2005 con las mismas siglas.
  const dart = extraerMisiones(fuente).find((m) => m.id === "dart");
  assert.ok(dart, "dart tiene que estar en el catálogo");
  assert.equal(dart.ll2Query, "Double Asteroid Redirection");
});

test("una misión sin alias deja ll2Query en null", () => {
  const apolo = extraerMisiones(fuente).find((m) => m.id === "apollo-11");
  assert.equal(apolo.ll2Query, null, "solo los nombres ambiguos llevan alias");
});
