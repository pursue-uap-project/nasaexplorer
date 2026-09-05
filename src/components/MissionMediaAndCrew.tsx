"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { Mission } from "@/lib/nasa";
import AstronautModal from "./AstronautModal";
import astronautsData from "@/data/astronauts.json";
import Icon from "@/components/Icon";

type Props = {
  missionImage?: string;
  /** Autoría de `missionImage`; se pinta bajo la foto. */
  missionImageCredit?: string;
  /** Id en images.nasa.gov, para enlazar al original. */
  missionImageNasaId?: string;
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
  missionImageCredit,
  missionImageNasaId,
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
    <div className="bg-card-sunken border-t border-card-border p-6 sm:p-8 rounded-2xl space-y-8">
      <div className={`grid gap-8 ${hasImage && hasCrew ? "grid-cols-1 lg:grid-cols-5" : "grid-cols-1"}`}>
        
        {/* ── MISSION IMAGE ── */}
        {hasImage && (
          <div className={`${hasCrew ? "lg:col-span-3" : "w-full"} space-y-4`}>
            <div>
              <h3 className="text-body font-bold text-sm tracking-wide">
                {t("mission_image_title")}
              </h3>
              <p className="text-faint text-xs">
                {t("mission_image_subtitle")}
              </p>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden bg-[#040D21]/40 border border-card-border shadow-md group flex items-center justify-center p-2 max-h-[450px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async"
                src={`${BASE}/${missionImage}`}
                alt={missionName}
                className="w-full h-auto max-h-[430px] object-contain transition-transform duration-700 group-hover:scale-[1.01] rounded-xl"
              />
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                style={{ backgroundColor: color }}
              />
            </div>

            {/* Autoría. Sin ella no se distingue una foto del archivo de una
                ilustración, que es exactamente el problema que tenía el sitio. */}
            {missionImageCredit && (
              <p className="text-faint text-2xs leading-snug">
                {missionImageNasaId ? (
                  <a
                    href={`https://images.nasa.gov/details/${missionImageNasaId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-card-border underline-offset-2 hover:text-muted hover:decoration-muted"
                  >
                    {missionImageCredit}
                  </a>
                ) : (
                  missionImageCredit
                )}
              </p>
            )}
          </div>
        )}

        {/* ── MISSION CREW ── */}
        {hasCrew && (
          <div className={`${hasImage ? "lg:col-span-2" : "w-full"} space-y-4`}>
            <div>
              <h3 className="text-body font-bold text-sm tracking-wide">
                {t("crew_section_title")}
              </h3>
              <p className="text-faint text-xs">
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
                        ? "bg-card hover:bg-card-hi border-card-border hover:border-white cursor-pointer shadow-xs"
                        : "bg-card-sunken border-card-border cursor-default"
                    }`}
                    style={isClickable ? { 
                      boxShadow: `0 4px 12px -2px rgba(11,61,145,0.03)` 
                    } : undefined}
                  >
                    {/* Portrait picture */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-card-border bg-white/20 shrink-0 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img loading="lazy" decoding="async"
                        src={
                          member.details?.image
                            ? (member.details.image.startsWith("http")
                                ? member.details.image
                                : `${BASE}/${member.details.image}`)
                            : "https://www.nasa.gov/wp-content/uploads/2015/01/nasa-logo.png"
                        }
                        alt={member.displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://www.nasa.gov/wp-content/uploads/2015/01/nasa-logo.png";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-body truncate">
                        {member.details?.name || member.displayName}
                      </h4>
                      <p className="text-[10px] text-faint font-mono mt-0.5 truncate">
                        {member.details?.agency || "NASA"}
                      </p>
                    </div>

                    {isClickable && (
                      <div className="text-faint group-hover:text-muted transition-colors pr-1 text-xs">
                        <Icon name="arrowRight" className="h-4 w-4" />
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
