"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import type { Mission } from "@/lib/nasa";
import { PROGRAM_COLORS } from "@/lib/nasa";
import uapStoriesData from "@/data/uap-stories.json";
import { UapSighting } from "@/lib/fuzzy";

type Props = { missions: Mission[] };

interface TimelineEvent {
  id: string;
  type: "nasa" | "uap";
  year: number;
  dateStr: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  color: string;
  url: string;
}

export default function Timeline({ missions }: Props) {
  const locale = useLocale();

  // Unified sorting and normalization
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Add NASA missions
    missions.forEach((m) => {
      const yearStr = m.launch_details.date?.slice(0, 4);
      if (yearStr) {
        events.push({
          id: m.id,
          type: "nasa",
          year: parseInt(yearStr, 10),
          dateStr: m.launch_details.date,
          title: m.name,
          subtitle: `NASA Mission · ${m.program}`,
          description: locale === "es" ? m.description.es : m.description.en,
          tag: m.program,
          color: PROGRAM_COLORS[m.program] ?? "#0B3D91",
          url: `/missions/${m.id}`,
        });
      }
    });

    // Add UAP sightings
    (uapStoriesData as UapSighting[]).forEach((s) => {
      const yearVal = parseInt(s.year, 10);
      if (!isNaN(yearVal)) {
        events.push({
          id: s.id,
          type: "uap",
          year: yearVal,
          dateStr: `${s.year}-01-01`, // Fallback for chronological sort order
          title: locale === "es" ? s.title_es : s.title_en,
          subtitle: `UAP Report · ${s.agency}`,
          description: locale === "es" ? s.body_es : s.body_en,
          tag: s.agency,
          color: "#10b981", // Phosphor emerald green
          url: `/uap/sighting/${s.id}`,
        });
      }
    });

    // Sort chronologically by year, then by exact date string if available
    return events.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.dateStr.localeCompare(b.dateStr);
    });
  }, [missions, locale]);

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12 px-4 overflow-hidden">
      {/* ── Background Cosmic Particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] bg-emerald-950/10 rounded-full blur-[90px]" />
      </div>

      {/* Central Timeline Vertical Axis Line */}
      <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-blue-600 via-indigo-500 to-emerald-600 z-10 pointer-events-none md:-translate-x-[1px]" />

      <div className="relative z-20 space-y-12">
        {timelineEvents.map((event, index) => {
          const isNasa = event.type === "nasa";
          const isEven = index % 2 === 0;

          // Animations
          const xOffset = isEven ? -40 : 40;

          return (
            <div
              key={`${event.type}-${event.id}`}
              className={`flex flex-col md:flex-row items-stretch w-full ${
                isEven ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Card container side */}
              <div className="w-full md:w-1/2 flex justify-start md:justify-center px-4 md:px-8">
                <motion.div
                  initial={{ opacity: 0, x: xOffset, y: 15 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                  className="w-full max-w-md"
                >
                  <Link
                    href={event.url}
                    className={`block rounded-2xl p-6 backdrop-blur-md transition-all duration-300 group relative ${
                      isNasa
                        ? "bg-slate-900/40 border border-blue-900/30 hover:border-blue-500/40 hover:bg-slate-900/60 shadow-lg hover:shadow-blue-950/10"
                        : "bg-emerald-950/10 border border-emerald-900/30 hover:border-emerald-500/40 hover:bg-emerald-950/20 shadow-lg hover:shadow-emerald-950/10"
                    }`}
                  >
                    {/* Glowing effect inside card */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-lg pointer-events-none z-0 ${
                      isNasa ? "bg-blue-500/5" : "bg-emerald-500/5"
                    }`} />

                    <div className="relative z-10">
                      {/* Date & Tag Row */}
                      <div className="flex items-center gap-2 mb-3">
                        <time className="text-sm font-bold font-mono tracking-widest text-white/50">
                          {event.year}
                        </time>
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                            isNasa
                              ? "bg-blue-950/80 text-blue-300 border border-blue-800/40"
                              : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                          }`}
                        >
                          {event.tag}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className={`text-lg font-extrabold leading-snug mb-2 transition-colors ${
                        isNasa
                          ? "text-blue-100 group-hover:text-white"
                          : "text-emerald-100 group-hover:text-white font-mono"
                      }`}>
                        {event.title}
                      </h3>

                      {/* Subtitle / Program */}
                      <p className="text-[11px] font-mono tracking-wide text-white/40 mb-3 uppercase">
                        {event.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-white/60 text-sm leading-relaxed line-clamp-3">
                        {event.description}
                      </p>

                      {/* Interactive indicator */}
                      <div className="mt-4 flex items-center gap-1 text-[11px] font-mono opacity-0 group-hover:opacity-100 transform translate-x-[-5px] group-hover:translate-x-0 transition-all duration-300">
                        <span className={isNasa ? "text-blue-400" : "text-emerald-400"}>
                          {locale === "es" ? "VER REGISTRO >" : "VIEW FILE >"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </div>

              {/* Central axis point bullet */}
              <div className="absolute left-[9px] md:left-1/2 top-10 w-4 h-4 rounded-full border-4 border-slate-950 bg-slate-950 z-20 flex items-center justify-center pointer-events-none md:-translate-x-[8px]">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isNasa ? "bg-blue-500 animate-pulse" : "bg-emerald-500 animate-pulse"
                  }`}
                />
              </div>

              {/* Empty side for layout balance */}
              <div className="hidden md:block w-1/2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
