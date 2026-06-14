"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Mission } from "@/lib/nasa";
import { PROGRAM_COLORS } from "@/lib/nasa";

type Props = {
  missions: Mission[];
};

export default function MissionsRoadmap({ missions }: Props) {
  const locale = useLocale();
  const t = useTranslations("roadmap");
  const loc = locale as "en" | "es";

  const sortedMissions = useMemo(() => {
    return [...missions].sort((a, b) => {
      return new Date(a.launch_details.date).getTime() - new Date(b.launch_details.date).getTime();
    });
  }, [missions]);

  if (sortedMissions.length === 0) {
    return <p className="text-center text-white/30 py-20">{t("no_missions")}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative">
      {/* Central glowing track line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/80 via-indigo-500/50 to-transparent transform md:-translate-x-1/2 scroll-drawn-track" />

      <div className="space-y-12 relative">
        {sortedMissions.map((m, idx) => {
          const color = PROGRAM_COLORS[m.program] ?? "#0B3D91";
          const isEven = idx % 2 === 0;
          const year = m.launch_details.date?.slice(0, 4);

          return (
            <div
              key={m.id}
              className={`flex flex-col md:flex-row items-start md:items-center relative ${
                isEven ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Central Chronological Node Dot */}
              <div
                className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full border-4 border-[#040d21] transform -translate-x-1/2 z-10 transition-all duration-300 hover:scale-125"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 10px 2px ${color}80`,
                }}
              />

              {/* Symmetrical Spacing for Alternate Alignment */}
              <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8">
                <div
                  className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all hover:shadow-[0_10px_30px_-10px_rgba(255,255,255,0.05)] ${
                    isEven ? "md:text-right" : "md:text-left"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 mb-2 ${
                      isEven ? "md:flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold text-white/50">{year}</span>
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md text-white/90"
                      style={{ backgroundColor: `${color}44`, border: `1px solid ${color}80` }}
                    >
                      {m.program}
                    </span>
                  </div>

                  <h3 className="text-white font-bold text-base hover:text-blue-400 transition-colors">
                    <Link href={`/missions/${m.id}`}>{m.name}</Link>
                  </h3>

                  <p className="text-white/50 text-xs mt-2 leading-relaxed line-clamp-3">
                    {m.description[loc]}
                  </p>

                  <div className={`mt-4 flex ${isEven ? "md:justify-end" : "justify-start"}`}>
                    <Link
                      href={`/missions/${m.id}`}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      <span>{t("view_details")}</span>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l4.158-3.92H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Blank side spacer on Desktop */}
              <div className="hidden md:block w-1/2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
