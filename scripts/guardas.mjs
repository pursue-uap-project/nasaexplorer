// Mínimos por debajo de los cuales un resultado es casi seguro una respuesta
// rota de la API y no un dato real. Se comprueban ANTES de escribir, para no
// pisar un JSON bueno con uno vacío.
export const MINIMOS = {
  "live-channels.json": (p) => (p.channels?.length >= 3 ? null : "menos de 3 canales"),
  "launches.json": (p) => (p.upcoming?.length >= 3 ? null : "menos de 3 lanzamientos próximos"),
  "exoplanets.json": (p) =>
    p.total >= 5000 && p.metodos?.length >= 3 ? null : "recuento de exoplanetas implausible",
};

export function comprobarPayload(name, payload) {
  const problema = MINIMOS[name]?.(payload) ?? null;
  if (problema) throw new Error(`${name}: ${problema}; no se sobrescribe el dato anterior`);
}
