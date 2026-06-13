"use client";

import { useState } from "react";
import AstronautModal from "./AstronautModal";
import type { Mission } from "@/lib/nasa";

type StatItem = {
  label: string;
  value: string;
};

type Props = {
  stats: StatItem[];
  color: string;
  allMissions: Mission[];
  statsTitle: string;
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
};

export default function MissionStats({ stats, color, allMissions, statsTitle }: Props) {
  const [selectedAstronaut, setSelectedAstronaut] = useState<string | null>(null);

  // Helper to check if a name belongs to our astronaut registry
  const getAstronautId = (name: string): string | null => {
    const clean = name.trim().toLowerCase();
    for (const key of Object.keys(ASTRONAUT_MAP)) {
      if (clean.includes(key)) {
        return ASTRONAUT_MAP[key];
      }
    }
    return null;
  };

  return (
    <div className="lg:col-span-2 px-6 sm:px-8 py-8 bg-white/40">
      <h2 className="text-foreground/35 text-xs font-mono uppercase tracking-widest mb-5">
        {statsTitle}
      </h2>
      <dl className="space-y-0">
        {stats.map(({ label, value }) => {
          const isCrew = label.toLowerCase() === "crew" || label.toLowerCase() === "astronaut";
          
          return (
            <div
              key={label}
              className="flex items-start justify-between gap-4 py-2.5 border-b border-white/50 last:border-0"
            >
              <dt className="text-foreground/45 text-xs uppercase tracking-wide shrink-0">
                {label}
              </dt>
              <dd
                className="font-semibold text-sm text-right leading-tight"
                style={{ color }}
              >
                {isCrew ? (
                  <span className="flex flex-wrap justify-end gap-1.5">
                    {value.split(/·|,/).map((part, pIdx) => {
                      const astId = getAstronautId(part);
                      if (astId) {
                        return (
                          <button
                            key={pIdx}
                            onClick={() => setSelectedAstronaut(astId)}
                            className="underline decoration-dotted hover:decoration-solid hover:scale-105 transition-all text-xs font-bold focus:outline-none"
                            style={{ color }}
                          >
                            {part.trim()}
                          </button>
                        );
                      }
                      return <span key={pIdx}>{part.trim()}</span>;
                    })}
                  </span>
                ) : (
                  <span>{value}</span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* Astronaut Profile Panel */}
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
