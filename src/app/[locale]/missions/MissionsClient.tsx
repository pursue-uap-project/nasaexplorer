"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import MissionCard from "@/components/MissionCard";
import type { Mission } from "@/lib/nasa";

type Filter = "all" | "active" | "completed";

export default function MissionsClient({ missions }: { missions: Mission[] }) {
  const t = useTranslations("missions");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const displayed = useMemo(
    () =>
      missions
        .filter((m) => filter === "all" || m.launch_details.status === filter)
        .filter(
          (m) =>
            !search ||
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.program.toLowerCase().includes(search.toLowerCase())
        ),
    [missions, filter, search]
  );

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("filter_all") },
    { key: "active", label: t("filter_active") },
    { key: "completed", label: t("filter_completed") },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder={t("search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white shadow-sm"
        />
        <div className="flex gap-2 shrink-0">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-foreground/60 border border-gray-200 hover:border-primary/30 hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 ? (
        <p className="text-center text-foreground/40 py-20">{t("no_results")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      )}
    </div>
  );
}
