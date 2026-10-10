import test from "node:test";
import assert from "node:assert/strict";
import { comprobarPayload } from "./guardas.mjs";

test("rechaza lanzamientos vacíos", () => {
  assert.throws(() => comprobarPayload("launches.json", { upcoming: [] }), /no se sobrescribe/);
});
test("acepta lanzamientos normales", () => {
  comprobarPayload("launches.json", { upcoming: [1, 2, 3] });
});
test("rechaza exoplanetas con total nulo", () => {
  assert.throws(() => comprobarPayload("exoplanets.json", { total: null, metodos: [] }));
});
test("acepta exoplanetas reales", () => {
  comprobarPayload("exoplanets.json", { total: 6000, metodos: [1, 2, 3] });
});
test("rechaza canales vacíos", () => {
  assert.throws(() => comprobarPayload("live-channels.json", { channels: [] }));
});
test("ignora ficheros sin regla", () => {
  comprobarPayload("apod.json", {});
});
