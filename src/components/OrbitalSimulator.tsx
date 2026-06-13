"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  missionName: string;
  color: string;
};

export default function OrbitalSimulator({ missionName, color }: Props) {
  const t = useTranslations("simulator");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Physics States
  const [isRunning, setIsRunning] = useState(false);
  const [altitude, setAltitude] = useState(180); // km (scaled)
  const [speed, setSpeed] = useState(7.6); // km/s (scaled)
  const [thrust, setThrust] = useState(0); // kN
  const [angle, setAngle] = useState(0); // degrees relative to velocity
  const [status, setStatus] = useState<"idle" | "orbit" | "suborbital" | "escape" | "crashed">("idle");
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  // Simulation variables ref
  const simState = useRef({
    x: 0,
    y: -150,
    vx: 5.2, // initial tangent speed
    vy: 0,
    heading: 0, // degrees
    earthR: 40,
    GM: 30000, // gravitational constant * Earth mass
  });

  // Reset/Initialize
  const handleReset = () => {
    const state = simState.current;
    state.x = 0;
    state.y = -130;
    state.vx = 15.0; // orbit entry speed
    state.vy = 0;
    state.heading = 0;
    setTrail([]);
    setStatus("idle");
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning) return;

    let animFrame: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const runSim = () => {
      const state = simState.current;

      // Gravity calculations
      const r2 = state.x * state.x + state.y * state.y;
      const r = Math.sqrt(r2);

      if (r <= state.earthR + 4) {
        setStatus("crashed");
        setIsRunning(false);
        return;
      }

      if (r > 260) {
        setStatus("escape");
        setIsRunning(false);
        return;
      }

      // Gravitational force vector
      const ax = -(state.GM * state.x) / (r2 * r);
      const ay = -(state.GM * state.y) / (r2 * r);

      // Thrust vector (user input)
      const radHeading = (state.heading * Math.PI) / 180;
      // Thrust magnitude scaled
      const thrustAccel = thrust * 0.015;
      const tx = Math.cos(radHeading) * thrustAccel;
      const ty = Math.sin(radHeading) * thrustAccel;

      // Update velocities
      state.vx += ax + tx;
      state.vy += ay + ty;

      // Update positions
      state.x += state.vx * 0.1;
      state.y += state.vy * 0.1;

      // Update trail
      setTrail((prev) => {
        const next = [...prev, { x: state.x, y: state.y }];
        if (next.length > 180) next.shift();
        return next;
      });

      // Update Telemetry display
      const currentAlt = Math.max(0, Math.round((r - state.earthR) * 3));
      const currentSpeed = Math.sqrt(state.vx * state.vx + state.vy * state.vy).toFixed(1);
      setAltitude(currentAlt);
      setSpeed(parseFloat(currentSpeed));

      // Calculate if stable orbit
      // Stable circular speed: v_c = sqrt(GM/r). If actual velocity is close, it's orbit!
      const vc = Math.sqrt(state.GM / r);
      const currentV = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      if (Math.abs(currentV - vc) < 1.5 && r > state.earthR + 10) {
        setStatus("orbit");
      } else {
        setStatus("suborbital");
      }

      // Render Loop
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw Atmospheric boundary
      ctx.beginPath();
      ctx.arc(cx, cy, state.earthR + 15, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(59, 130, 246, 0.05)";
      ctx.fill();

      // Draw Earth
      const earthGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, state.earthR);
      earthGrad.addColorStop(0, "#1e3a8a");
      earthGrad.addColorStop(0.8, "#0f172a");
      earthGrad.addColorStop(1, "#1d4ed8");
      ctx.beginPath();
      ctx.arc(cx, cy, state.earthR, 0, 2 * Math.PI);
      ctx.fillStyle = earthGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(96, 165, 250, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Orbit Trail
      ctx.beginPath();
      trail.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(cx + p.x, cy + p.y);
        else ctx.lineTo(cx + p.x, cy + p.y);
      });
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw Spacecraft
      const sx = cx + state.x;
      const sy = cy + state.y;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(radHeading);
      
      // Draw Thrust Fire
      if (thrust > 0) {
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-12 - Math.random() * 8, -3);
        ctx.lineTo(-12 - Math.random() * 8, 3);
        ctx.closePath();
        ctx.fillStyle = "#f97316";
        ctx.fill();
      }

      // Draw triangle capsule
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      animFrame = requestAnimationFrame(runSim);
    };

    animFrame = requestAnimationFrame(runSim);
    return () => cancelAnimationFrame(animFrame);
  }, [isRunning, thrust, trail, color]);

  // Adjust heading angle
  const adjustAngle = (amt: number) => {
    simState.current.heading = (simState.current.heading + amt) % 360;
    setAngle(simState.current.heading);
  };

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 mt-8">
      <h3 className="text-foreground font-bold text-base mb-2 flex items-center gap-2">
        <span>🛰️</span>
        {t("title", { name: missionName })}
      </h3>
      <p className="text-foreground/50 text-xs mb-6 leading-relaxed">
        {t("subtitle")}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Canvas Display */}
        <div className="lg:col-span-3 flex items-center justify-center bg-[#040d21] border border-white/10 rounded-2xl p-4 overflow-hidden relative min-h-[300px]">
          <canvas ref={canvasRef} width="400" height="300" className="max-w-full" />
          
          {/* Simulation Overlay Alerts */}
          {status === "crashed" && (
            <div className="absolute inset-0 bg-red-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
              <span className="text-3xl mb-2">💥</span>
              <h4 className="text-white font-bold text-sm">{t("crashed_title")}</h4>
              <p className="text-white/60 text-xs mt-1 max-w-[240px]">{t("crashed_desc")}</p>
              <button onClick={handleReset} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                {t("retry")}
              </button>
            </div>
          )}

          {status === "escape" && (
            <div className="absolute inset-0 bg-amber-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
              <span className="text-3xl mb-2">☄️</span>
              <h4 className="text-white font-bold text-sm">{t("escape_title")}</h4>
              <p className="text-white/60 text-xs mt-1 max-w-[240px]">{t("escape_desc")}</p>
              <button onClick={handleReset} className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                {t("retry")}
              </button>
            </div>
          )}
        </div>

        {/* Telemetry & Controls */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          {/* Telemetry panel */}
          <div className="space-y-4">
            <h4 className="text-foreground/60 text-xs uppercase tracking-wider font-mono font-bold border-b border-foreground/10 pb-2">
              {t("telemetry_title")}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/30 border border-white/50 rounded-xl p-3">
                <span className="text-foreground/40 text-[10px] uppercase font-mono tracking-wide block">{t("telemetry_alt")}</span>
                <span className="text-lg font-bold text-foreground font-mono mt-1 block">{altitude} km</span>
              </div>
              <div className="bg-white/30 border border-white/50 rounded-xl p-3">
                <span className="text-foreground/40 text-[10px] uppercase font-mono tracking-wide block">{t("telemetry_speed")}</span>
                <span className="text-lg font-bold text-foreground font-mono mt-1 block">{speed} km/s</span>
              </div>
            </div>

            {/* Orbit health gauge */}
            <div className="bg-white/30 border border-white/50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-foreground/40 text-[10px] uppercase font-mono tracking-wide">{t("telemetry_status")}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                status === "orbit" ? "bg-emerald-100 text-emerald-700" :
                status === "suborbital" ? "bg-amber-100 text-amber-700" :
                "bg-slate-100 text-slate-500"
              }`}>
                {t(`status_${status}`)}
              </span>
            </div>
          </div>

          {/* Interactive controls */}
          <div className="mt-6 pt-4 border-t border-foreground/10 space-y-4">
            {/* Heading angle adjuster */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/60 text-xs font-bold shrink-0">{t("control_heading")} ({angle}°)</span>
              <div className="flex gap-2">
                <button onClick={() => adjustAngle(-15)} disabled={!isRunning} className="px-3 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-white/80 text-xs font-bold disabled:opacity-40 transition-all shadow-sm">
                  ⟲ -15°
                </button>
                <button onClick={() => adjustAngle(15)} disabled={!isRunning} className="px-3 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-white/80 text-xs font-bold disabled:opacity-40 transition-all shadow-sm">
                  ⟳ +15°
                </button>
              </div>
            </div>

            {/* Thrust booster toggles */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground/60 text-xs font-bold">{t("control_thrust")}</span>
              <div className="flex gap-2">
                <button
                  onMouseDown={() => setThrust(100)}
                  onMouseUp={() => setThrust(0)}
                  onTouchStart={() => setThrust(100)}
                  onTouchEnd={() => setThrust(0)}
                  disabled={!isRunning}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 disabled:opacity-40 transition-all shadow-md select-none shrink-0"
                >
                  🔥 BOOST
                </button>
              </div>
            </div>

            {/* Run / Stop action button */}
            <div className="pt-2">
              {!isRunning ? (
                <button onClick={handleReset} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg">
                  🚀 {t("launch")}
                </button>
              ) : (
                <button onClick={() => setIsRunning(false)} className="w-full py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold text-sm rounded-xl transition-all shadow-md">
                  ⏸ {t("pause")}
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
