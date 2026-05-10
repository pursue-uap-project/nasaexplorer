"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import MissionCard from "@/components/MissionCard";
import type { Mission } from "@/lib/nasa";

export default function MissionsClient({ missions }: { missions: Mission[] }) {
  const t = useTranslations("missions");
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const chips = [
    { key: "all",         label: t("filter_all") },
    { key: "active",      label: t("filter_active") },
    { key: "Apollo",      label: "Apollo" },
    { key: "Mars",        label: "Mars" },
    { key: "Deep Space",  label: t("filter_deep_space") },
  ];

  const displayed = useMemo(
    () =>
      missions
        .filter((m) => {
          if (filter === "all")       return true;
          if (filter === "active")    return m.launch_details.status === "active";
          if (filter === "completed") return m.launch_details.status === "completed";
          return m.program === filter;
        })
        .filter(
          (m) =>
            !search ||
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.program.toLowerCase().includes(search.toLowerCase())
        ),
    [missions, filter, search]
  );

  return (
    <div>
      {/* ── Sticky search + chips bar ──────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-white/80 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white/60 backdrop-blur-sm shadow-sm placeholder:text-foreground/35"
          />
          <div className="flex gap-2 shrink-0 overflow-x-auto scrollbar-none">
            {chips.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
                  filter === key
                    ? "bg-primary text-white shadow-sm border-primary"
                    : "bg-white/65 backdrop-blur-sm border-white/80 text-foreground/55 hover:bg-white hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mission grid ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {displayed.length === 0 ? (
          <p className="text-center text-foreground/40 py-20">{t("no_results")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((mission) => (
              <Link key={mission.id} href={`/missions/${mission.id}`} className="block group">
                <MissionCard mission={mission} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
