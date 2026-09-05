/**
 * Iconos del portal.
 *
 * Antes la iconografía eran emoji: 🚀 🛰️ 📡 🔍 dentro de encabezados y botones.
 * `audit.md` lo marcaba como anti-patrón y tenía razón por dos motivos —
 * renderizan distinto en cada sistema operativo (y en algunos ni existen), y un
 * lector de pantalla los lee en voz alta con el nombre Unicode completo, así
 * que «🚀 Misiones» se oye como «cohete Misiones».
 *
 * Son SVG inline, sin dependencias ni fuente de iconos: el sitio ya carga poco
 * y no merece la pena un paquete para catorce trazos. Todos comparten viewBox
 * 24×24, `currentColor` y grosor 2, así que combinan sin ajustes.
 *
 * Por defecto son decorativos (`aria-hidden`): el texto de al lado ya dice lo
 * que son. Si el icono va **solo** dentro de un botón, hay que pasarle `label`
 * para que tenga nombre accesible.
 */

type Trazo = { d: string; fill?: boolean };

const ICONOS = {
  rocket: [
    { d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" },
    { d: "M12 15 9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" },
    { d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" },
  ],
  satellite: [
    { d: "m13.5 6.5-3 3M10 3 3 10l4 4 7-7-4-4ZM17 21l4-4-4-4-4 4 4 4ZM14 10l3-3M9 14l-3 3" },
  ],
  search: [{ d: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-3.5-3.5" }],
  close: [{ d: "M6 18 18 6M6 6l12 12" }],
  check: [{ d: "m5 13 4 4L19 7" }],
  cross: [{ d: "M6 18 18 6M6 6l12 12" }],
  refresh: [{ d: "M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" }],
  person: [{ d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" }],
  bulb: [{ d: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" }],
  flame: [{ d: "M12 22c4 0 7-2.7 7-6.5 0-4.5-4-5.5-4-9.5-3 1-4 3.5-4 5.5-1-.5-1.5-2-1.5-3C7.5 10 5 12 5 15.5 5 19.3 8 22 12 22Z" }],
  burst: [{ d: "m12 2 2.2 5.6L20 6l-2.4 5.3L22 15l-6 .4L14 21l-2-4.6L8 21l-2-5.6L2 15l4.4-3.7L4 6l5.8 1.6L12 2Z" }],
  comet: [{ d: "M17 7a4 4 0 1 1-5.7 5.6L3 21M8 8l-3 1M11 5l-1 3" }],
  chart: [{ d: "M3 3v18h18M8 17V10M13 17V6M18 17v-4" }],
  antenna: [{ d: "M5 21 12 3M12 3l7 18M8 14h8M12 3a9 9 0 0 1 6.4 2.6M12 3a9 9 0 0 0-6.4 2.6" }],
  audio: [{ d: "M11 5 6 9H2v6h4l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" }],
  image: [
    { d: "M3 5h18v14H3zM8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM21 15l-5-5-6 6-3-3-4 4" },
  ],
  arrowRight: [{ d: "M5 12h14M13 6l6 6-6 6" }],
  arrowUpRight: [{ d: "M7 17 17 7M8 7h9v9" }],
  expand: [{ d: "M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" }],
  film: [{ d: "M3 4h18v16H3zM7 4v16M17 4v16M3 10h4M3 15h4M17 10h4M17 15h4" }],
  map: [{ d: "m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14" }],
  grid: [{ d: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" }],
  coffee: [{ d: "M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8ZM17 9h2a2.5 2.5 0 0 1 0 5h-2M6 2v2M10 2v2M14 2v2" }],
} as const;

export type IconName = keyof typeof ICONOS;

type Props = {
  name: IconName;
  /** Nombre accesible. Solo si el icono va solo, sin texto al lado. */
  label?: string;
  className?: string;
};

export default function Icon({ name, label, className = "h-4 w-4" }: Props) {
  const trazos = ICONOS[name] as readonly Trazo[];

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {trazos.map((t, i) => (
        <path key={i} d={t.d} />
      ))}
    </svg>
  );
}
