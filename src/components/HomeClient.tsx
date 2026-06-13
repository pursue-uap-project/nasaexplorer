"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  uapCount: number;
  statsMissionsLabel: string;
  statsYearsLabel: string;
  statsProgramsLabel: string;
}

function DecryptText({ text, active }: { text: string; active: boolean }) {
  const [currentText, setCurrentText] = useState(text);

  useEffect(() => {
    let frame = 0;
    const chars = "X░Y▒Z▓█01$#@%?";
    const target = text;
    const length = target.length;
    
    const interval = setInterval(() => {
      const scrambled = target
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < frame / 2) return target[i];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      setCurrentText(scrambled);
      frame++;
      if (frame / 2 >= length) {
        clearInterval(interval);
        setCurrentText(target);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [text, active]);

  return <span>{currentText}</span>;
}

export default function HomeClient({
  uapCount,
  statsMissionsLabel,
  statsYearsLabel,
  statsProgramsLabel,
}: Props) {
  const t = useTranslations("home");
  const [hoveredCard, setHoveredCard] = useState(false);
  const [hoveredRadar, setHoveredRadar] = useState(false);

  const stats = [
    { val: "300+", label: statsMissionsLabel },
    { val: "65+",  label: statsYearsLabel },
    { val: "10+",  label: statsProgramsLabel },
  ];

  return (
    <>
      {/* ── Main statistics grid (with the 4th Secret UAP card) ───────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 w-full max-w-lg md:max-w-2xl px-4 relative z-20">
        {stats.map(({ val, label }) => (
          <div
            key={label}
            className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-2xl px-4 py-5 shadow-lg ring-1 ring-inset ring-white/50 text-center flex flex-col justify-center min-h-[120px]"
          >
            <p className="text-2xl sm:text-3xl font-bold text-primary">{val}</p>
            <p className="text-foreground/50 text-xs mt-1 leading-tight font-medium">{label}</p>
          </div>
        ))}

        {/* 4. SECRET UAP CARD */}
        <Link
          href="/uap"
          className="bg-slate-950/70 hover:bg-slate-900/90 border border-emerald-500/30 rounded-2xl px-4 py-5 shadow-lg shadow-emerald-950/20 ring-1 ring-inset ring-emerald-500/20 text-center transition-all duration-300 relative group overflow-hidden flex flex-col justify-center min-h-[120px] cursor-pointer hover:border-emerald-500/60"
          onMouseEnter={() => setHoveredCard(true)}
          onMouseLeave={() => setHoveredCard(false)}
        >
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0)_50%,rgba(16,185,129,0.05)_50%)] bg-[size:100%_4px] opacity-20 group-hover:opacity-40 transition-opacity" />
          
          {/* LED pulse */}
          <div className="absolute top-3 right-3 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          </div>

          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors font-mono tracking-tight">
            <DecryptText
              text={hoveredCard ? `${uapCount}+` : t("stats_uap_classified")}
              active={hoveredCard}
            />
          </div>

          <div className="text-emerald-500/50 group-hover:text-emerald-400/80 transition-colors text-[10px] mt-1 leading-tight uppercase font-mono tracking-wider">
            <DecryptText
              text={hoveredCard ? t("stats_uap_label") : t("stats_uap_redacted")}
              active={hoveredCard}
            />
          </div>
        </Link>
      </div>

      {/* ── Radar Anomalous Easter Egg ───────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link href="/uap" className="relative block">
          <div
            className="relative w-8 h-8 flex items-center justify-center cursor-pointer group"
            onMouseEnter={() => setHoveredRadar(true)}
            onMouseLeave={() => setHoveredRadar(false)}
          >
            {/* Pulsing ring */}
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/30 opacity-75 animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <span className="absolute inline-flex h-5 w-5 rounded-full bg-emerald-500/50 opacity-100 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
            
            {/* Center solid core */}
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] border border-emerald-300" />
            
            {/* Radar Tooltip */}
            <AnimatePresence>
              {hoveredRadar && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8, x: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: -10 }}
                  exit={{ opacity: 0, scale: 0.9, y: 8, x: -10 }}
                  className="absolute bottom-10 right-0 bg-slate-950/95 border border-emerald-500/40 rounded-xl p-3 text-left font-mono text-[9px] text-emerald-400 shadow-[0_0_15px_rgba(0,0,0,0.7)] w-52 pointer-events-none select-none"
                >
                  <div className="flex items-center gap-1.5 text-emerald-500 font-bold border-b border-emerald-500/20 pb-1 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{t("radar_warning")}</span>
                  </div>
                  <div className="text-emerald-400/80">{t("radar_freq")}</div>
                  <div className="text-emerald-400/80">{t("radar_source")}</div>
                  <div className="mt-2 pt-1.5 border-t border-emerald-500/10 text-emerald-300 font-bold text-center animate-pulse uppercase tracking-wide">
                    {t("radar_action")} »
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </div>
    </>
  );
}
