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
      <div className="sticky top-16 z-40 bg-[#040D21]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-white/15 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 bg-white/[0.07] text-white backdrop-blur-sm shadow-sm placeholder:text-white/30"
          />
          <div className="flex gap-2 shrink-0 overflow-x-auto scrollbar-none">
            {chips.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
                  filter === key
                    ? "bg-white/[0.15] text-white ring-1 ring-inset ring-white/25 border-transparent"
                    : "bg-white/[0.05] border-white/15 text-white/50 hover:text-white hover:bg-white/[0.10]"
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
