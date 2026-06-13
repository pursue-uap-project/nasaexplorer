"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { ActiveMission, MarsLatest } from "@/lib/nasa";

type ISS = { latitude: number; longitude: number; altitude: number; velocity: number };

function LiveCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const t = useTranslations("active");
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold tracking-widest text-red-400">
          <span className="onair-dot h-1.5 w-1.5 rounded-full bg-red-500" /> {t("live_now")}
        </span>
        <span className="text-sm font-semibold text-white/85">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="font-mono text-lg font-bold" style={{ color }}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40">{label}</div>
    </div>
  );
}

function IssLive({ color }: { color: string }) {
  const t = useTranslations("active");
  const [d, setD] = useState<ISS | null>(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        const j = await r.json();
        if (alive) setD({ latitude: j.latitude, longitude: j.longitude, altitude: j.altitude, velocity: j.velocity });
      } catch {}
    };
    load();
    const id = setInterval(load, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <LiveCard title={t("iss_position")} color={color}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <Metric label={t("lat")} value={d ? `${d.latitude.toFixed(2)}°` : "…"} color={color} />
        <Metric label={t("lon")} value={d ? `${d.longitude.toFixed(2)}°` : "…"} color={color} />
        <Metric label={t("alt")} value={d ? `${Math.round(d.altitude)} km` : "…"} color={color} />
        <Metric label={t("speed")} value={d ? `${Math.round(d.velocity).toLocaleString()} km/h` : "…"} color={color} />
      </div>
    </LiveCard>
  );
}

function MarsLive({ mars, color }: { mars: MarsLatest; color: string }) {
  const t = useTranslations("active");
  if (!mars) return null;
  return (
    <LiveCard title={t("mars_now")} color={color}>
      <div className="flex items-center gap-4">
        {mars.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mars.photo} alt="Mars latest" className="h-20 w-28 shrink-0 rounded-lg border border-white/10 object-cover" />
        )}
        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3">
          <Metric label={t("sol")} value={`${mars.sol}`} color={color} />
          <Metric label={t("earth_date")} value={mars.earthDate} color={color} />
          {mars.camera && <Metric label={t("camera")} value={mars.camera} color={color} />}
        </div>
      </div>
    </LiveCard>
  );
}

export default function MissionLive({ mission, mars, color }: { mission: ActiveMission; mars: MarsLatest; color: string }) {
  if (mission.live === "iss") return <IssLive color={color} />;
  if (mission.live === "mars-rover") return <MarsLive mars={mars} color={color} />;
  return null;
}
