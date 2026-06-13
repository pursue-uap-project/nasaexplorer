"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { Mission } from "@/lib/nasa";
import AstronautModal from "./AstronautModal";
import astronautsData from "@/data/astronauts.json";

type Props = {
  missionImage?: string;
  missionName: string;
  crewNames?: string;
  color: string;
  allMissions: Mission[];
};

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

const ASTRONAUT_MAP: Record<string, string> = {
  armstrong: "armstrong",
  collins: "collins",
  aldrin: "aldrin",
  lovell: "lovell",
  shepard: "shepard",
  glenn: "glenn",
  cernan: "cernan",
  schmitt: "schmitt",
  wiseman: "wiseman",
  glover: "glover",
  koch: "koch",
  hansen: "hansen",
  swigert: "swigert",
  haise: "haise",
  evans: "evans",
  young: "young",
  crippen: "crippen",
};

export default function MissionMediaAndCrew({
  missionImage,
  missionName,
  crewNames,
  color,
  allMissions,
}: Props) {
  const t = useTranslations("mission_detail");
  const [selectedAstronaut, setSelectedAstronaut] = useState<string | null>(null);

  const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  // Helper to resolve astronaut details from the database
  const getAstronautDetails = (part: string) => {
    const clean = part.trim().toLowerCase();
    let matchedId = null;
    for (const key of Object.keys(ASTRONAUT_MAP)) {
      if (clean.includes(key)) {
        matchedId = ASTRONAUT_MAP[key];
        break;
      }
    }

    if (matchedId) {
      const details = (astronautsData as Record<string, AstronautData>)[matchedId];
      return { id: matchedId, ...details };
    }
    return null;
  };

  // Parse crew names string
  const crewList = crewNames
    ? crewNames.split(/·|,/).map((name) => name.trim()).filter(Boolean)
    : [];

  const displayCrew = crewList.map((name) => {
    const details = getAstronautDetails(name);
    return {
      displayName: name,
      details,
    };
  });

  const hasCrew = displayCrew.length > 0;
  const hasImage = Boolean(missionImage);

  if (!hasImage && !hasCrew) return null;

  return (
    <div className="bg-white/30 backdrop-blur-xl border-t border-white/40 p-6 sm:p-8 rounded-2xl space-y-8">
      <div className={`grid gap-8 ${hasImage && hasCrew ? "grid-cols-1 lg:grid-cols-5" : "grid-cols-1"}`}>
        
        {/* ── MISSION IMAGE ── */}
        {hasImage && (
          <div className={`${hasCrew ? "lg:col-span-3" : "w-full"} space-y-4`}>
            <div>
              <h3 className="text-foreground/80 font-bold text-sm tracking-wide">
                {t("mission_image_title")}
              </h3>
              <p className="text-foreground/40 text-xs">
                {t("mission_image_subtitle")}
              </p>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#040D21]/40 border border-white/50 shadow-md group">
              <Image
                src={`${BASE}/${missionImage}`}
                alt={missionName}
                fill
                unoptimized
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        )}

        {/* ── MISSION CREW ── */}
        {hasCrew && (
          <div className={`${hasImage ? "lg:col-span-2" : "w-full"} space-y-4`}>
            <div>
              <h3 className="text-foreground/80 font-bold text-sm tracking-wide">
                {t("crew_section_title")}
              </h3>
              <p className="text-foreground/40 text-xs">
                {t("crew_section_subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {displayCrew.map((member, idx) => {
                const isClickable = Boolean(member.details?.id);
                
                return (
                  <motion.div
                    key={idx}
                    whileHover={isClickable ? { scale: 1.02 } : undefined}
                    onClick={() => {
                      if (member.details?.id) {
                        setSelectedAstronaut(member.details.id);
                      }
                    }}
                    className={`flex items-center gap-4 p-3 rounded-2xl border transition-all duration-200 ${
                      isClickable
                        ? "bg-white/60 hover:bg-white/80 border-white/70 hover:border-white cursor-pointer shadow-sm"
                        : "bg-white/30 border-white/40 cursor-default"
                    }`}
                    style={isClickable ? { 
                      boxShadow: `0 4px 12px -2px rgba(11,61,145,0.03)` 
                    } : undefined}
                  >
                    {/* Portrait picture */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/80 bg-white/20 shrink-0 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.details?.image || `${BASE}/assets/astronaut-placeholder.png`}
                        alt={member.displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://www.nasa.gov/wp-content/uploads/2015/01/nasa-logo.png";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-foreground/80 truncate">
                        {member.details?.name || member.displayName}
                      </h4>
                      <p className="text-[10px] text-foreground/40 font-mono mt-0.5 truncate">
                        {member.details?.agency || "NASA"}
                      </p>
                    </div>

                    {isClickable && (
                      <div className="text-foreground/20 group-hover:text-foreground/50 transition-colors pr-1 text-xs">
                        ➔
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Astronaut Modal */}
      {selectedAstronaut && (
        <AstronautModal
          astronautId={selectedAstronaut}
          isOpen={!!selectedAstronaut}
          onClose={() => setSelectedAstronaut(null)}
          allMissions={allMissions}
        />
      )}
    </div>
  );
}
