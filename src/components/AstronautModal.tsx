"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import type { Mission } from "@/lib/nasa";
import astronautsData from "@/data/astronauts.json";

type AstronautData = {
  name: string;
  agency: string;
  born: string;
  died: string | null;
  active: string;
  bio_en: string;
  bio_es: string;
  image: string;
};

type Props = {
  astronautId: string;
  isOpen: boolean;
  onClose: () => void;
  allMissions: Mission[];
};

export default function AstronautModal({ astronautId, isOpen, onClose, allMissions }: Props) {
  const t = useTranslations("astronaut");
  const locale = useLocale();

  const astronaut = (astronautsData as Record<string, AstronautData>)[astronautId];

  // Find other missions the astronaut participated in
  const associatedMissions = allMissions.filter((m) => {
    const crewStat = m.stats?.find((s) => s.label.toLowerCase() === "crew" || s.label.toLowerCase() === "astronaut");
    if (!crewStat) return false;
    // Check if astronaut's last name or full name is mentioned in the crew list
    const lastName = astronaut?.name.split(" ").pop() || "";
    return crewStat.value.toLowerCase().includes(lastName.toLowerCase());
  });

  if (!astronaut) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-[#050e21]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col overflow-y-auto text-white"
          >
            {/* Close button */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-bold">
                {t("profile_title")}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/[0.08] text-white/50 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Profile Picture */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 bg-white/5 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={astronaut.image}
                  alt={astronaut.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback avatar icon
                    e.currentTarget.src = "https://www.nasa.gov/wp-content/uploads/2015/01/nasa-logo.png";
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">{astronaut.name}</h3>
                <span className="text-xs text-white/40 font-mono">{astronaut.agency}</span>
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div>
                <span className="text-white/30 text-[10px] font-mono uppercase tracking-wide block">
                  {t("born")}
                </span>
                <span className="text-sm font-semibold text-white/90 mt-1 block">
                  {astronaut.born} {astronaut.died ? `– ${astronaut.died}` : ""}
                </span>
              </div>
              <div>
                <span className="text-white/30 text-[10px] font-mono uppercase tracking-wide block">
                  {t("active_years")}
                </span>
                <span className="text-sm font-semibold text-white/90 mt-1 block font-mono">
                  {astronaut.active}
                </span>
              </div>
            </div>

            {/* Biography */}
            <div className="mb-6 flex-1">
              <h4 className="text-white/40 text-xs font-mono uppercase tracking-wider mb-2">
                {t("biography")}
              </h4>
              <p className="text-white/70 text-sm leading-relaxed">
                {locale === "es" ? astronaut.bio_es : astronaut.bio_en}
              </p>
            </div>

            {/* Participated Missions */}
            {associatedMissions.length > 0 && (
              <div className="mt-auto border-t border-white/10 pt-6">
                <h4 className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">
                  {t("other_missions")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {associatedMissions.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onClose();
                        // wait, navigate to this page
                        window.location.href = `/${locale}/missions/${m.id}`;
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-xs font-medium text-white/80 hover:text-white transition-all shadow-sm"
                    >
                      🚀 {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
