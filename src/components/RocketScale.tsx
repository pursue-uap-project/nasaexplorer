"use client";

import { useTranslations } from "next-intl";

type RocketSpec = {
  name: string;
  height: number; // meters
  thrust: string; // kN
  payload: string; // LEO payload
  mass: string; // tons
  color: string;
};

const ROCKETS: Record<string, RocketSpec> = {
  redstone: {
    name: "Mercury-Redstone",
    height: 25,
    thrust: "350 kN",
    payload: "1,600 kg",
    mass: "30 t",
    color: "#64748b",
  },
  atlas: {
    name: "Mercury-Atlas",
    height: 29,
    thrust: "1,600 kN",
    payload: "1,800 kg",
    mass: "120 t",
    color: "#475569",
  },
  titan: {
    name: "Gemini-Titan II",
    height: 33,
    thrust: "1,900 kN",
    payload: "3,600 kg",
    mass: "154 t",
    color: "#7c3aed",
  },
  "saturn-v": {
    name: "Saturn V",
    height: 110,
    thrust: "34,500 kN",
    payload: "140,000 kg",
    mass: "2,970 t",
    color: "#b45309",
  },
  shuttle: {
    name: "Space Shuttle",
    height: 56,
    thrust: "30,160 kN",
    payload: "27,500 kg",
    mass: "2,030 t",
    color: "#1d4ed8",
  },
  proton: {
    name: "Proton-K",
    height: 53,
    thrust: "10,500 kN",
    payload: "22,800 kg",
    mass: "700 t",
    color: "#0891b2",
  },
  "titan-iii": {
    name: "Titan IIIE",
    height: 48,
    thrust: "8,800 kN",
    payload: "15,400 kg",
    mass: "635 t",
    color: "#6366f1",
  },
  "atlas-v": {
    name: "Atlas V",
    height: 58,
    thrust: "3,830 kN",
    payload: "18,850 kg",
    mass: "590 t",
    color: "#ea580c",
  },
  "ariane-5": {
    name: "Ariane 5",
    height: 52,
    thrust: "13,400 kN",
    payload: "21,000 kg",
    mass: "780 t",
    color: "#0B3D91",
  },
  sls: {
    name: "SLS Block 1",
    height: 98,
    thrust: "39,000 kN",
    payload: "95,000 kg",
    mass: "2,600 t",
    color: "#dc2626",
  },
};

type Props = {
  rocketId: string;
};

export default function RocketScale({ rocketId }: Props) {
  const t = useTranslations("rocket_scale");
  const activeRocket = ROCKETS[rocketId];

  if (!activeRocket) return null;

  // Let's compare the active rocket alongside Saturn V (110m) and Redstone (25m) as visual scale anchors
  const referenceSaturn = ROCKETS["saturn-v"];
  const referenceRedstone = ROCKETS["redstone"];

  const maxH = 120; // max SVG height scale

  // SVG Scaled heights
  const hActive = (activeRocket.height / maxH) * 150;
  const hSaturn = (referenceSaturn.height / maxH) * 150;
  const hRedstone = (referenceRedstone.height / maxH) * 150;

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 mt-8">
      <h3 className="text-foreground font-bold text-base mb-2 flex items-center gap-2">
        <span>🚀</span>
        {t("title")}
      </h3>
      <p className="text-foreground/50 text-xs mb-6">
        {t("subtitle", { name: activeRocket.name })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
        {/* Scaling Visual SVG Diagram */}
        <div className="md:col-span-2 bg-[#040d21] border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-end h-[240px] relative">
          
          {/* Height grid lines */}
          <div className="absolute inset-x-0 bottom-5 top-5 flex flex-col justify-between pointer-events-none">
            <div className="border-t border-white/[0.04] w-full relative">
              <span className="absolute -top-2.5 left-2 font-mono text-[9px] text-white/20">110m</span>
            </div>
            <div className="border-t border-white/[0.04] w-full relative">
              <span className="absolute -top-2.5 left-2 font-mono text-[9px] text-white/20">55m</span>
            </div>
            <div className="border-t border-white/[0.04] w-full relative">
              <span className="absolute -top-2.5 left-2 font-mono text-[9px] text-white/20">0m</span>
            </div>
          </div>

          <div className="flex items-end justify-around w-full relative z-10">
            {/* 1. Redstone Reference */}
            {rocketId !== "redstone" && (
              <div className="flex flex-col items-center">
                <svg width="25" height="150" viewBox="0 0 25 150" className="opacity-45">
                  <rect x="10" y={150 - hRedstone} width="5" height={hRedstone} fill="#64748b" rx="1.5" />
                  <polygon points={`10,${150 - hRedstone} 12.5,${150 - hRedstone - 6} 15,${150 - hRedstone}`} fill="#64748b" />
                </svg>
                <span className="text-[8px] font-mono text-white/30 text-center mt-1">Redstone<br/>(25m)</span>
              </div>
            )}

            {/* 2. Active Rocket */}
            <div className="flex flex-col items-center">
              <svg width="35" height="150" viewBox="0 0 35 150">
                {/* Rocket Body */}
                <rect x="14" y={150 - hActive} width="7" height={hActive} fill={activeRocket.color} rx="2" />
                {/* Rocket Nose Cone */}
                <polygon points={`14,${150 - hActive} 17.5,${150 - hActive - 8} 21,${150 - hActive}`} fill={activeRocket.color} />
                {/* Rocket Fins */}
                <polygon points={`14,142 10,150 14,150`} fill={activeRocket.color} />
                <polygon points={`21,142 25,150 21,150`} fill={activeRocket.color} />
              </svg>
              <span className="text-[9px] font-bold text-white text-center mt-1" style={{ color: activeRocket.color }}>
                {activeRocket.name}<br/>({activeRocket.height}m)
              </span>
            </div>

            {/* 3. Saturn V Reference */}
            {rocketId !== "saturn-v" && (
              <div className="flex flex-col items-center">
                <svg width="30" height="150" viewBox="0 0 30 150" className="opacity-45">
                  <rect x="11" y={150 - hSaturn} width="8" height={hSaturn} fill="#b45309" rx="2" />
                  <polygon points={`11,${150 - hSaturn} 15,${150 - hSaturn - 10} 19,${150 - hSaturn}`} fill="#b45309" />
                </svg>
                <span className="text-[8px] font-mono text-white/30 text-center mt-1">Saturn V<br/>(110m)</span>
              </div>
            )}
          </div>
        </div>

        {/* Technical Specs List */}
        <div className="md:col-span-3">
          <div className="bg-white/30 border border-white/50 rounded-2xl p-5 divide-y divide-white/20">
            <div className="flex justify-between py-2.5 text-xs">
              <span className="text-foreground/45 uppercase tracking-wider">{t("spec_name")}</span>
              <span className="font-bold text-foreground">{activeRocket.name}</span>
            </div>
            <div className="flex justify-between py-2.5 text-xs">
              <span className="text-foreground/45 uppercase tracking-wider">{t("spec_height")}</span>
              <span className="font-bold text-foreground font-mono">{activeRocket.height} m</span>
            </div>
            <div className="flex justify-between py-2.5 text-xs">
              <span className="text-foreground/45 uppercase tracking-wider">{t("spec_thrust")}</span>
              <span className="font-bold text-foreground font-mono" style={{ color: activeRocket.color }}>{activeRocket.thrust}</span>
            </div>
            <div className="flex justify-between py-2.5 text-xs">
              <span className="text-foreground/45 uppercase tracking-wider">{t("spec_mass")}</span>
              <span className="font-bold text-foreground font-mono">{activeRocket.mass}</span>
            </div>
            <div className="flex justify-between py-2.5 text-xs">
              <span className="text-foreground/45 uppercase tracking-wider">{t("spec_payload")}</span>
              <span className="font-bold text-foreground font-mono">{activeRocket.payload}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
