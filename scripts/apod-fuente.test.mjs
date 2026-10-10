/**
 * Tests de la traducción de la API nueva de APOD (science.nasa.gov) a lo que
 * pinta la web. Los fixtures son respuestas reales guardadas el 2026-10-10,
 * sin el campo `basic_html`, que es la página entera y no se usa:
 *
 * - 261010: imagen normal.
 * - 260913: vídeo con fotograma en `hdurl`.
 * - 260301: vídeo sin fotograma (la API pone una miniatura genérica) y con
 *   un aviso del editor colgado al final de la explicación.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { urlApod, normalizarApod, htmlATexto, limpiarCredito, esImagenGenerica } = await import(
  resolve(ROOT, "src/lib/apod-fuente.ts")
);

const fixture = async (id) =>
  JSON.parse(await readFile(resolve(ROOT, `scripts/fixtures/apod-${id}.json`), "utf8"));

test("urlApod pone la fecha en la ruta, no en ?date=", () => {
  assert.equal(urlApod(), "https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=1");
  assert.equal(urlApod("2026-10-10"), "https://science.nasa.gov/wp-json/wp/v2/apod-basic/261010");
  assert.equal(urlApod("1995-06-16"), "https://science.nasa.gov/wp-json/wp/v2/apod-basic/950616");
  assert.throws(() => urlApod("10/10/2026"));
});

test("imagen: la foto sale de hdurl y la página del permalink", async () => {
  const d = normalizarApod(await fixture("261010"));
  assert.equal(d.date, "2026-10-10");
  assert.equal(d.title, "Lunar Farside");
  assert.equal(d.media_type, "image");
  assert.match(d.url, /^https:\/\/assets\.science\.nasa\.gov\/.+farside/);
  assert.equal(d.hdurl, d.url);
  assert.match(d.pageUrl, /^https:\/\/science\.nasa\.gov\/image-article\/apod-2026-october-10/);
  assert.ok(!d.explanation.startsWith("Explanation"), "se cuela la etiqueta");
  assert.ok(!/[<>]/.test(d.explanation), "se cuela HTML en la explicación");
  assert.ok(d.explanation.startsWith("Tidally locked"));
  assert.ok(d.copyright && !/[<>]/.test(d.copyright), "crédito con HTML");
});

test("la API también puede devolver una lista (la consulta por ?per_page=1)", async () => {
  const uno = await fixture("261010");
  assert.deepEqual(normalizarApod([uno]), normalizarApod(uno));
});

test("vídeo con fotograma: se usa como miniatura y no hay videoUrl", async () => {
  const d = normalizarApod(await fixture("260913"));
  assert.equal(d.media_type, "video");
  assert.match(d.url, /Comet_snapshot\.png/);
  assert.equal(d.videoUrl, null);
  assert.ok(d.pageUrl);
});

test("vídeo sin fotograma: la miniatura genérica no se hace pasar por foto", async () => {
  const d = normalizarApod(await fixture("260301"));
  assert.equal(d.media_type, "video");
  assert.equal(d.url, null);
  assert.equal(d.hdurl, null);
  assert.ok(!/Almost Hyperspace|Random APOD/.test(d.explanation), "se cuela el aviso del editor");
  assert.ok(!/Video Credit/.test(d.copyright ?? ""), "se cuela el rótulo del crédito");
});

test("normalizarApod falla antes que publicar algo vacío o el relleno viejo", () => {
  assert.throws(() => normalizarApod({}));
  assert.throws(() => normalizarApod([]));
  assert.throws(() => normalizarApod({ date: "2026-10-10", title: "NASA Science" }));
});

test("htmlATexto decodifica entidades y no deja espacios ante la puntuación", () => {
  assert.equal(htmlATexto('Fox Fur <a href="x">Nebula</a> .'), "Fox Fur Nebula.");
  assert.equal(htmlATexto("Sm&#246;rg&aring;sbord &amp; co"), "Smörg&aring;sbord & co");
  assert.equal(htmlATexto("planet&#039;s"), "planet's");
});

test("limpiarCredito quita rótulos y lo que va tras el salto de línea", () => {
  assert.equal(
    limpiarCredito('<b>Image Credit &amp; <a href="x">Copyright</a>:</b> <a href="y">Michael Kalika</a>'),
    "Michael Kalika",
  );
  assert.equal(
    limpiarCredito("<b> Video Credit: </b> NASA, Reid Wiseman <br /> <b>Text:</b> Alguien"),
    "NASA, Reid Wiseman",
  );
  assert.equal(limpiarCredito("Ogetay Kayali"), "Ogetay Kayali");
  assert.equal(limpiarCredito(""), null);
});

test("esImagenGenerica reconoce las miniaturas del sitio", () => {
  assert.ok(esImagenGenerica("https://assets.science.nasa.gov/x/images/misc/news-thumbnail.png?w=594"));
  assert.ok(esImagenGenerica("https://assets.science.nasa.gov/x/images/misc/NASA-Meatball-Feature5.png"));
  assert.ok(!esImagenGenerica("https://assets.science.nasa.gov/x/apod/2026/october/farside.jpg"));
});
