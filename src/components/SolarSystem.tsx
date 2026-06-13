"use client";

import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/routing";

const TWO_PI = Math.PI * 2;
const PERS   = 0.38;
const SPEED  = 5;

type Detail = { labelEn: string; labelEs: string; value: string };

type Body = {
  id: string;
  nameEn: string;
  nameEs: string;
  isMission: boolean;
  color: string;
  orbitR: number;
  r: number;
  period: number;
  a0: number;
  infoEn: string;
  infoEs: string;
  isRinged?: boolean;
  details: Detail[];
  missionId?: string;
};

const SUN_DETAILS: Detail[] = [
  { labelEn: "Diameter",          labelEs: "Diámetro",           value: "1,392,700 km" },
  { labelEn: "Mass",              labelEs: "Masa",               value: "1.989 × 10³⁰ kg" },
  { labelEn: "Surface temp",      labelEs: "Temp. superficial",  value: "5,778 K" },
  { labelEn: "Distance to Earth", labelEs: "Dist. a la Tierra",  value: "149.6M km" },
];

const BODIES: Body[] = [
  {
    id: "mercury", nameEn: "Mercury", nameEs: "Mercurio", isMission: false,
    color: "#b0b0b0", orbitR: 65, r: 3.5, period: 88, a0: 4.4,
    infoEn: "0.39 AU · 88-day year", infoEs: "0.39 UA · Año de 88 días",
    details: [
      { labelEn: "Distance from Sun", labelEs: "Distancia al Sol", value: "57.9M km (0.39 AU)" },
      { labelEn: "Orbital period",    labelEs: "Período orbital",  value: "88 days" },
      { labelEn: "Diameter",          labelEs: "Diámetro",         value: "4,879 km" },
      { labelEn: "Temperature",       labelEs: "Temperatura",      value: "−173°C to 427°C" },
    ],
  },
  {
    id: "venus", nameEn: "Venus", nameEs: "Venus", isMission: false,
    color: "#e8cda0", orbitR: 95, r: 5, period: 225, a0: 3.2,
    infoEn: "0.72 AU · Hottest planet", infoEs: "0.72 UA · Planeta más caliente",
    details: [
      { labelEn: "Distance from Sun", labelEs: "Distancia al Sol",  value: "108.2M km (0.72 AU)" },
      { labelEn: "Orbital period",    labelEs: "Período orbital",   value: "225 days" },
      { labelEn: "Diameter",          labelEs: "Diámetro",          value: "12,104 km" },
      { labelEn: "Surface temp",      labelEs: "Temp. superficial", value: "465°C (avg)" },
    ],
  },
  {
    id: "earth", nameEn: "Earth", nameEs: "Tierra", isMission: false,
    color: "#4b9de0", orbitR: 128, r: 5.5, period: 365, a0: 1.75,
    infoEn: "1 AU · Our home", infoEs: "1 UA · Nuestro hogar",
    details: [
      { labelEn: "Distance from Sun", labelEs: "Distancia al Sol", value: "149.6M km (1 AU)" },
      { labelEn: "Orbital period",    labelEs: "Período orbital",  value: "365.25 days" },
      { labelEn: "Diameter",          labelEs: "Diámetro",         value: "12,756 km" },
      { labelEn: "Moon",              labelEs: "Luna",             value: "1 natural satellite" },
    ],
  },
  {
    id: "mars", nameEn: "Mars", nameEs: "Marte", isMission: false,
    color: "#c1440e", orbitR: 165, r: 4, period: 687, a0: 0.3,
    infoEn: "1.52 AU · Red Planet", infoEs: "1.52 UA · Planeta Rojo",
    details: [
      { labelEn: "Distance from Sun", labelEs: "Distancia al Sol", value: "227.9M km (1.52 AU)" },
      { labelEn: "Orbital period",    labelEs: "Período orbital",  value: "687 days" },
      { labelEn: "Diameter",          labelEs: "Diámetro",         value: "6,792 km" },
      { labelEn: "Day length",        labelEs: "Duración del día", value: "24h 37m" },
    ],
  },
  {
    id: "jupiter", nameEn: "Jupiter", nameEs: "Júpiter", isMission: false,
    color: "#d4944a", orbitR: 218, r: 11, period: 4333, a0: 0.6,
    infoEn: "5.2 AU · Largest planet", infoEs: "5.2 UA · Planeta más grande",
    details: [
      { labelEn: "Distance from Sun", labelEs: "Distancia al Sol", value: "778.5M km (5.2 AU)" },
      { labelEn: "Orbital period",    labelEs: "Período orbital",  value: "11.9 years" },
      { labelEn: "Diameter",          labelEs: "Diámetro",         value: "139,820 km" },
      { labelEn: "Moons",             labelEs: "Lunas",            value: "95+" },
    ],
  },
  {
    id: "saturn", nameEn: "Saturn", nameEs: "Saturno", isMission: false,
    color: "#e8d888", orbitR: 263, r: 9, period: 10759, a0: 0.87,
    infoEn: "9.5 AU · Ring system", infoEs: "9.5 UA · Sistema de anillos", isRinged: true,
    details: [
      { labelEn: "Distance from Sun", labelEs: "Distancia al Sol", value: "1.43B km (9.5 AU)" },
      { labelEn: "Orbital period",    labelEs: "Período orbital",  value: "29.5 years" },
      { labelEn: "Ring span",         labelEs: "Ancho de anillos", value: "282,000 km" },
      { labelEn: "Moons",             labelEs: "Lunas",            value: "146" },
    ],
  },
  {
    id: "uranus", nameEn: "Uranus", nameEs: "Urano", isMission: false,
    color: "#7de8e8", orbitR: 298, r: 7, period: 30688, a0: 5.5,
    infoEn: "19.2 AU", infoEs: "19.2 UA",
    details: [
      { labelEn: "Distance from Sun", labelEs: "Distancia al Sol", value: "2.87B km (19.2 AU)" },
      { labelEn: "Orbital period",    labelEs: "Período orbital",  value: "84 years" },
      { labelEn: "Diameter",          labelEs: "Diámetro",         value: "51,118 km" },
      { labelEn: "Axial tilt",        labelEs: "Inclinación axial", value: "97.8°" },
    ],
  },
  {
    id: "neptune", nameEn: "Neptune", nameEs: "Neptuno", isMission: false,
    color: "#4b70dd", orbitR: 330, r: 6.5, period: 60182, a0: 5.3,
    infoEn: "30 AU · Farthest planet", infoEs: "30 UA · Planeta más lejano",
    details: [
      { labelEn: "Distance from Sun", labelEs: "Distancia al Sol", value: "4.49B km (30 AU)" },
      { labelEn: "Orbital period",    labelEs: "Período orbital",  value: "165 years" },
      { labelEn: "Wind speed",        labelEs: "Velocidad del viento", value: "2,100 km/h" },
      { labelEn: "Diameter",          labelEs: "Diámetro",         value: "49,528 km" },
    ],
  },
  {
    id: "parker", nameEn: "Parker", nameEs: "Parker", isMission: true,
    color: "#fbbf24", orbitR: 40, r: 2.5, period: 39, a0: 0.8,
    infoEn: "Solar orbit · Closest to Sun", infoEs: "Órbita solar · Más cercana al Sol",
    details: [
      { labelEn: "Perihelion",  labelEs: "Perihelio",          value: "6.1M km from Sun" },
      { labelEn: "Max speed",   labelEs: "Velocidad máxima",   value: "692,000 km/h" },
      { labelEn: "Launch",      labelEs: "Lanzamiento",        value: "Aug 12, 2018" },
      { labelEn: "Mission",     labelEs: "Misión",             value: "Solar corona study" },
    ],
  },
  {
    id: "iss", nameEn: "ISS", nameEs: "ISS", isMission: true,
    color: "#94a3b8", orbitR: 129, r: 3, period: 365, a0: 2.5,
    infoEn: "Earth orbit · Crewed since 2000", infoEs: "Órbita terrestre · Tripulada desde 2000",
    missionId: "iss",
    details: [
      { labelEn: "Altitude",    labelEs: "Altitud",        value: "~408 km" },
      { labelEn: "Speed",       labelEs: "Velocidad",      value: "27,600 km/h" },
      { labelEn: "Crew",        labelEs: "Tripulación",    value: "7 members" },
      { labelEn: "Orbits/day",  labelEs: "Órbitas/día",   value: "~15.5" },
    ],
  },
  {
    id: "jwst", nameEn: "JWST", nameEs: "JWST", isMission: true,
    color: "#a78bfa", orbitR: 130, r: 3, period: 365, a0: 1.75 + Math.PI,
    infoEn: "L2 Lagrange point", infoEs: "Punto de Lagrange L2",
    missionId: "jwst",
    details: [
      { labelEn: "Distance",      labelEs: "Distancia",          value: "1.5M km (L2 point)" },
      { labelEn: "Mirror",        labelEs: "Espejo",             value: "6.5 m, 18 segments" },
      { labelEn: "Launch",        labelEs: "Lanzamiento",        value: "Dec 25, 2021" },
      { labelEn: "First images",  labelEs: "Primeras imágenes",  value: "Jul 12, 2022" },
    ],
  },
  {
    id: "persev", nameEn: "Perseverance", nameEs: "Perseverance", isMission: true,
    color: "#f97316", orbitR: 166, r: 2.5, period: 687, a0: 1.2,
    infoEn: "Mars surface · Jezero Crater", infoEs: "Superficie de Marte · Cráter Jezero",
    missionId: "perseverance",
    details: [
      { labelEn: "Location",   labelEs: "Ubicación",      value: "Jezero Crater, Mars" },
      { labelEn: "Landed",     labelEs: "Aterrizó",       value: "Feb 18, 2021" },
      { labelEn: "Samples",    labelEs: "Muestras",       value: "23+ collected" },
      { labelEn: "Ingenuity",  labelEs: "Ingenuity",      value: "72+ flights" },
    ],
  },
  {
    id: "juno", nameEn: "Juno", nameEs: "Juno", isMission: true,
    color: "#22c55e", orbitR: 219, r: 2.5, period: 4333, a0: 2.1,
    infoEn: "Jupiter orbit since 2016", infoEs: "Órbita de Júpiter desde 2016",
    missionId: "juno",
    details: [
      { labelEn: "Target",           labelEs: "Objetivo",         value: "Jupiter system" },
      { labelEn: "Arrival",          labelEs: "Llegada",          value: "Jul 4, 2016" },
      { labelEn: "Orbital period",   labelEs: "Período orbital",  value: "~38 days" },
      { labelEn: "Distance from Sun", labelEs: "Dist. al Sol",    value: "778.5M km" },
    ],
  },
  {
    id: "v1", nameEn: "Voyager 1", nameEs: "Voyager 1", isMission: true,
    color: "#f0f0f0", orbitR: 390, r: 2.5, period: 0, a0: 1.1,
    infoEn: "Interstellar · 23B+ km from Sun", infoEs: "Interestelar · +23.000M km del Sol",
    missionId: "voyager-1",
    details: [
      { labelEn: "Distance",      labelEs: "Distancia",       value: "~165 AU (2025)" },
      { labelEn: "Speed",         labelEs: "Velocidad",       value: "61,000 km/h" },
      { labelEn: "Interstellar",  labelEs: "Interestelar",    value: "Since Aug 2012" },
      { labelEn: "Signal delay",  labelEs: "Retardo de señal", value: "~23 hours" },
    ],
  },
  {
    id: "v2", nameEn: "Voyager 2", nameEs: "Voyager 2", isMission: true,
    color: "#d0d0d0", orbitR: 373, r: 2.5, period: 0, a0: 4.2,
    infoEn: "Interstellar · 19B+ km from Sun", infoEs: "Interestelar · +19.000M km del Sol",
    missionId: "voyager-2",
    details: [
      { labelEn: "Distance",      labelEs: "Distancia",       value: "~137 AU (2025)" },
      { labelEn: "Speed",         labelEs: "Velocidad",       value: "55,000 km/h" },
      { labelEn: "Interstellar",  labelEs: "Interestelar",    value: "Since Nov 2018" },
      { labelEn: "Signal delay",  labelEs: "Retardo de señal", value: "~19 hours" },
    ],
  },
  {
    id: "nh", nameEn: "New Horizons", nameEs: "New Horizons", isMission: true,
    color: "#c084fc", orbitR: 356, r: 2.5, period: 0, a0: 5.8,
    infoEn: "Kuiper Belt · Passed Pluto 2015", infoEs: "Cinturón de Kuiper · Pasó Plutón en 2015",
    missionId: "new-horizons",
    details: [
      { labelEn: "Distance",      labelEs: "Distancia",   value: "~57 AU (2025)" },
      { labelEn: "Speed",         labelEs: "Velocidad",   value: "52,000 km/h" },
      { labelEn: "Pluto flyby",   labelEs: "Sobrevuelo",  value: "Jul 14, 2015" },
      { labelEn: "Zone",          labelEs: "Zona",        value: "Kuiper Belt" },
    ],
  },
];

const STARS: [number, number, number][] = [
  [3,8,1],[7,34,0.8],[12,67,1.2],[18,23,0.9],[24,89,1],[31,45,1.1],[38,12,0.8],
  [44,78,1],[51,56,0.9],[57,19,1.2],[63,91,0.8],[69,42,1],[75,71,1.1],[82,28,0.9],
  [88,63,1],[94,85,0.8],[5,55,1],[15,3,0.9],[22,74,1.1],[29,38,0.8],[36,92,1],
  [42,17,0.9],[48,61,1.2],[54,84,0.8],[61,29,1],[67,50,1.1],[73,9,0.8],[79,76,1],
  [85,41,0.9],[91,68,1.1],[2,81,0.8],[9,48,1],[16,15,0.9],[23,93,1.1],[30,62,0.8],
  [37,30,1],[43,77,1.2],[50,5,0.8],[56,52,0.9],[62,87,1],[68,36,1.1],[74,60,0.8],
  [80,20,1],[87,44,0.9],[93,72,1.1],[6,25,0.8],[11,70,1],[17,88,1.2],[26,48,0.9],
  [33,13,0.8],[39,65,1],[46,39,1.1],[52,83,0.8],[59,21,0.9],[65,57,1],[71,94,1.1],
  [77,33,0.8],[83,58,1],[89,80,0.9],[96,15,1.1],[4,47,0.9],[14,85,1],[20,60,0.8],
  [27,30,1.1],[34,95,0.8],[40,22,0.9],[47,50,1],[53,73,1.2],[60,11,0.8],[66,66,0.9],
];

function getPos(body: Body, days: number, cx: number, cy: number, scale: number, zoom: number, angleOffset: number, pers: number) {
  if (body.orbitR === 0) return { x: cx, y: cy };
  const angle = body.period > 0 ? body.a0 + (TWO_PI * days / body.period) : body.a0;
  const r = body.orbitR * scale * zoom;
  
  // Flat position on the orbit plane
  const xp = r * Math.cos(angle);
  const yp = r * Math.sin(angle);
  
  // Rotate around Z axis (yaw)
  const xRot = xp * Math.cos(angleOffset) - yp * Math.sin(angleOffset);
  const yRot = xp * Math.sin(angleOffset) + yp * Math.cos(angleOffset);
  
  // Project with 3D tilt (pitch)
  return {
    x: cx + xRot,
    y: cy + yRot * pers
  };
}

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

type HitResult =
  | { kind: "sun" }
  | { kind: "body"; body: Body }
  | null;

type Tip = { cssX: number; cssY: number; name: string; info: string } | null;

export default function SolarSystem({ locale = "en" }: { locale?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const elapsedRef   = useRef(0);
  const lastTsRef    = useRef(0);
  const pausedRef    = useRef(false);
  const localeRef    = useRef(locale);

  const [paused,   setPaused]   = useState(false);
  const [tip,      setTip]      = useState<Tip>(null);
  const [selected, setSelected] = useState<HitResult>(null);

  // 3D camera controls state (using refs for high-performance updates in RAF)
  const zoomRef = useRef(1.0);
  const angleOffsetRef = useRef(0.0);
  const persRef = useRef(0.38);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const startAngleOffsetRef = useRef(0.0);
  const startPersRef = useRef(0.38);

  useEffect(() => { localeRef.current = locale; }, [locale]);

  // Global mouse move and mouse up listeners for smooth dragging
  useEffect(() => {
    function handleMouseMoveGlobal(e: MouseEvent) {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      // dx rotates Z-axis (yaw)
      angleOffsetRef.current = startAngleOffsetRef.current + dx * 0.007;
      // dy tilts X-axis (pitch) - clamp to keep a nice perspective angle
      persRef.current = Math.max(0.1, Math.min(0.85, startPersRef.current - dy * 0.004));
    }

    function handleMouseUpGlobal() {
      isDraggingRef.current = false;
    }

    window.addEventListener("mousemove", handleMouseMoveGlobal);
    window.addEventListener("mouseup", handleMouseUpGlobal);
    return () => {
      window.removeEventListener("mousemove", handleMouseMoveGlobal);
      window.removeEventListener("mouseup", handleMouseUpGlobal);
    };
  }, []);

  // ── Canvas animation loop ─────────────────────────────────────────────
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    function resize() {
      const w = container!.clientWidth;
      canvas!.width  = w;
      canvas!.height = Math.round(w * 0.58);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Active wheel zoom listener (non-passive to allow e.preventDefault())
    function handleCanvasWheel(e: WheelEvent) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      zoomRef.current = Math.max(0.35, Math.min(4.5, zoomRef.current * zoomFactor));
    }
    canvas.addEventListener("wheel", handleCanvasWheel, { passive: false });

    function frame(ts: number) {
      if (!pausedRef.current && lastTsRef.current > 0) {
        elapsedRef.current += ((ts - lastTsRef.current) / 1000) * SPEED;
      }
      lastTsRef.current = ts;

      const W  = canvas!.width;
      const H  = canvas!.height;
      const s  = W / 900;
      const cx = W / 2;
      const cy = H * 0.52;
      const days = elapsedRef.current;
      const loc  = localeRef.current;

      const z  = zoomRef.current;
      const ao = angleOffsetRef.current;
      const p  = persRef.current;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#040814";
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (const [xp, yp, sz] of STARS) {
        ctx.beginPath();
        ctx.arc(W * xp / 100, H * yp / 100, sz * 0.7 * s, 0, TWO_PI);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + sz * 0.1})`;
        ctx.fill();
      }

      // Orbit rings (tilted and rotated in 3D)
      for (const b of BODIES) {
        if (b.orbitR === 0) continue;
        ctx.beginPath();
        ctx.ellipse(cx, cy, b.orbitR * s * z, b.orbitR * p * s * z, ao, 0, TWO_PI);
        ctx.strokeStyle = b.isMission ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.09)";
        ctx.lineWidth   = 0.7;
        ctx.stroke();
      }

      // Sun corona + body (scales with zoom)
      const corona = ctx.createRadialGradient(cx, cy, 0, cx, cy, 65 * s * z);
      corona.addColorStop(0, "rgba(255,200,50,0.18)");
      corona.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, 65 * s * z, 0, TWO_PI);
      ctx.fillStyle = corona;
      ctx.fill();

      const sunG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * s * z);
      sunG.addColorStop(0,    "#fffde7");
      sunG.addColorStop(0.35, "#FFD700");
      sunG.addColorStop(0.8,  "#FF8C00");
      sunG.addColorStop(1,    "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, 26 * s * z, 0, TWO_PI);
      ctx.fillStyle = sunG;
      ctx.fill();

      // Bodies — depth sorted with 3D projection params
      const placed = BODIES
        .map(b => ({ b, ...getPos(b, days, cx, cy, s, z, ao, p) }))
        .sort((a, z) => a.y - z.y);

      for (const { b, x, y } of placed) {
        const r = b.r * s * z;
        const [rr, gg, bb] = rgb(b.color);

        // Glow
        const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        halo.addColorStop(0, `rgba(${rr},${gg},${bb},0.4)`);
        halo.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, TWO_PI);
        ctx.fillStyle = halo;
        ctx.fill();

        // Saturn rings (projected matching Z-rotation and X-pitch)
        if (b.isRinged) {
          ctx.beginPath();
          ctx.ellipse(x, y, r * 2.2, r * 0.52 * (p / 0.38), ao, 0, TWO_PI);
          ctx.strokeStyle = `rgba(${rr},${gg},${bb},0.55)`;
          ctx.lineWidth   = r * 0.9;
          ctx.stroke();
        }

        // Body sphere
        const bg = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 0, x, y, r);
        bg.addColorStop(0, `rgba(${Math.min(255,rr+55)},${Math.min(255,gg+55)},${Math.min(255,bb+55)},1)`);
        bg.addColorStop(1, `rgba(${Math.max(0,rr-30)},${Math.max(0,gg-30)},${Math.max(0,bb-30)},1)`);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TWO_PI);
        ctx.fillStyle = bg;
        ctx.fill();

        // Mission ring
        if (b.isMission) {
          ctx.beginPath();
          ctx.arc(x, y, r + 2 * s * z, 0, TWO_PI);
          ctx.strokeStyle = `rgba(${rr},${gg},${bb},0.55)`;
          ctx.lineWidth   = 0.8 * s * z;
          ctx.stroke();
        }

        // Label (slighly scaled with zoom)
        const name = loc === "es" ? b.nameEs : b.nameEn;
        const fs = Math.round((b.r >= 9 ? 10 : b.r >= 5 ? 9 : 8) * s * Math.max(0.75, Math.min(1.4, z)));
        if (fs >= 6) {
          ctx.fillStyle = b.isMission ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.68)";
          ctx.font = `${b.r >= 9 ? "600 " : ""}${fs}px system-ui,sans-serif`;
          ctx.textAlign = "left";
          ctx.fillText(name, x + r + 3 * s * z, y + 3 * s * z);
        }
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => { 
      cancelAnimationFrame(raf); 
      ro.disconnect(); 
      canvas.removeEventListener("wheel", handleCanvasWheel);
    };
  }, []);

  // ── Hit detection helpers ─────────────────────────────────────────────
  function hitTest(e: React.MouseEvent<HTMLCanvasElement>): HitResult {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr  = canvas.width / rect.width;
    const mx   = (e.clientX - rect.left) * dpr;
    const my   = (e.clientY - rect.top)  * dpr;
    const s    = canvas.width / 900;
    const cx   = canvas.width / 2;
    const cy   = canvas.height * 0.52;
    const days = elapsedRef.current;

    const z = zoomRef.current;
    const ao = angleOffsetRef.current;
    const p = persRef.current;

    if (Math.hypot(mx - cx, my - cy) < 32 * s * z) return { kind: "sun" };

    let best: Body | null = null;
    let minD = Infinity;
    for (const b of BODIES) {
      const { x, y } = getPos(b, days, cx, cy, s, z, ao, p);
      const d = Math.hypot(mx - x, my - y);
      const hitR = Math.max(b.r * s * z + 6, 12);
      if (d < hitR && d < minD) { minD = d; best = b; }
    }
    return best ? { kind: "body", body: best } : null;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hit = hitTest(e);
    e.currentTarget.style.cursor = hit ? "pointer" : "crosshair";

    if (!hit) { setTip(null); return; }
    const loc = localeRef.current;
    const rect = canvas.getBoundingClientRect();
    if (hit.kind === "sun") {
      setTip({ cssX: e.clientX - rect.left, cssY: e.clientY - rect.top,
               name: loc === "es" ? "Sol" : "Sun",
               info: loc === "es" ? "Nuestra estrella · Haz clic para más info" : "Our star · Click for more info" });
    } else {
      const b = hit.body;
      setTip({ cssX: e.clientX - rect.left, cssY: e.clientY - rect.top,
               name: loc === "es" ? b.nameEs : b.nameEn,
               info: (loc === "es" ? b.infoEs : b.infoEn) + " · Clic" });
    }
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const hit = hitTest(e);
    setSelected(hit); // null closes drawer, any hit opens it
  }

  function togglePause() {
    pausedRef.current = !pausedRef.current;
    if (!pausedRef.current) lastTsRef.current = 0;
    setPaused(p => !p);
  }

  // ── Drawer data helpers ───────────────────────────────────────────────
  const loc   = locale;
  const isSun = selected?.kind === "sun";
  const body  = selected?.kind === "body" ? selected.body : null;

  const drawerName    = isSun ? (loc === "es" ? "Sol" : "Sun") : (loc === "es" ? body?.nameEs : body?.nameEn);
  const drawerColor   = isSun ? "#FFD700" : (body?.color ?? "#fff");
  const drawerDetails = isSun ? SUN_DETAILS : (body?.details ?? []);
  const drawerType    = isSun ? (loc === "es" ? "Estrella" : "Star")
                      : body?.isMission ? (loc === "es" ? "Misión NASA" : "NASA Mission")
                      : (loc === "es" ? "Planeta" : "Planet");
  const drawerMissionId = body?.missionId;

  return (
    <div className="relative select-none overflow-hidden rounded-2xl" ref={containerRef}>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setTip(null);
          isDraggingRef.current = false;
        }}
        onMouseDown={(e) => {
          const hit = hitTest(e);
          if (hit) {
            setSelected(hit);
            return;
          }
          isDraggingRef.current = true;
          dragStartRef.current = { x: e.clientX, y: e.clientY };
          startAngleOffsetRef.current = angleOffsetRef.current;
          startPersRef.current = persRef.current;
        }}
        className="w-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Camera Instructions Overlay */}
      <div className="absolute top-3 left-3 bg-black/45 backdrop-blur-sm border border-white/5 rounded-lg px-2.5 py-1.5 text-[9px] font-mono text-white/50 pointer-events-none uppercase tracking-wider space-y-0.5 z-10">
        <div>🔍 Zoom: [Scroll Wheel]</div>
        <div>🔄 Rotate: [Click & Drag Map]</div>
      </div>

      {/* Hover tooltip */}
      {tip && !selected && (
        <div
          className="absolute z-10 pointer-events-none bg-gray-950/90 border border-white/20 rounded-xl px-3 py-2 text-sm backdrop-blur-sm"
          style={{ left: tip.cssX + 14, top: Math.max(8, tip.cssY - 52) }}
        >
          <p className="text-white font-semibold leading-tight">{tip.name}</p>
          <p className="text-white/50 text-xs mt-0.5">{tip.info}</p>
        </div>
      )}

      {/* Off-canvas drawer */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="absolute top-0 right-0 h-full w-64 sm:w-72 bg-gray-950/95 backdrop-blur-2xl border-l border-white/10 z-20 flex flex-col"
            aria-label="Body detail panel"
          >
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 text-white/50 hover:text-white transition-all text-sm"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Visual header */}
            <div className="px-5 pt-7 pb-5">
              {/* Body icon */}
              <div className="relative w-14 h-14 flex items-center justify-center mb-4">
                {body?.isRinged && (
                  <div
                    className="absolute w-24 h-6 rounded-full border-[3px] opacity-55"
                    style={{ borderColor: drawerColor }}
                  />
                )}
                <div
                  className="w-11 h-11 rounded-full shrink-0"
                  style={{
                    background: `radial-gradient(circle at 38% 35%, ${drawerColor}dd, ${drawerColor}88)`,
                    boxShadow: `0 0 18px ${drawerColor}55`,
                  }}
                />
              </div>

              {/* Name + badge */}
              <h3 className="text-white text-lg font-bold leading-tight mb-1.5">{drawerName}</h3>
              <span
                className="inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border"
                style={{ color: drawerColor, borderColor: `${drawerColor}40`, background: `${drawerColor}15` }}
              >
                {drawerType}
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/8 mx-5" />

            {/* Stats */}
            <div className="px-5 py-5 flex-1 overflow-y-auto">
              <p className="text-white/25 text-[10px] font-mono uppercase tracking-widest mb-4">
                {loc === "es" ? "Datos clave" : "Key data"}
              </p>
              <dl className="space-y-3.5">
                {drawerDetails.map(({ labelEn, labelEs, value }) => (
                  <div key={labelEn} className="flex items-start justify-between gap-3">
                    <dt className="text-white/40 text-xs shrink-0">
                      {loc === "es" ? labelEs : labelEn}
                    </dt>
                    <dd className="text-white text-xs font-semibold text-right leading-snug">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Mission link */}
            {drawerMissionId && (
              <div className="px-5 pb-5 pt-1">
                <div className="h-px bg-white/8 mb-4" />
                <Link
                  href={`/missions/${drawerMissionId}`}
                  className="flex items-center justify-between w-full text-xs font-semibold text-white/70 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 rounded-xl px-4 py-3 transition-all"
                  onClick={() => setSelected(null)}
                >
                  {loc === "es" ? "Ver detalle de la misión" : "Mission detail"}
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Pause button */}
      <button
        onClick={togglePause}
        className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 border border-white/15 text-white/60 hover:text-white rounded-lg px-3 py-1 text-xs font-mono transition-all backdrop-blur-sm z-10"
      >
        {paused ? "▶" : "⏸"}
      </button>
    </div>
  );
}
