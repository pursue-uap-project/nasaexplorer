"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import MissionCard from "@/components/MissionCard";
import MissionAnalytics from "@/components/MissionAnalytics";
import MissionsRoadmap from "@/components/MissionsRoadmap";
import MissionsQuiz from "@/components/MissionsQuiz";
import type { Mission } from "@/lib/nasa";

export default function MissionsClient({ missions }: { missions: Mission[] }) {
  const t = useTranslations("missions");
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("launch-desc");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "roadmap">("grid");

  const chips = [
    { key: "all",         label: t("filter_all") },
    { key: "active",      label: t("filter_active") },
    { key: "Apollo",      label: "Apollo" },
    { key: "Mars",        label: "Mars" },
    { key: "Deep Space",  label: t("filter_deep_space") },
  ];

  const displayed = useMemo(() => {
    let result = [...missions];

    // Search query
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.program.toLowerCase().includes(q) ||
          m.description.en.toLowerCase().includes(q) ||
          m.description.es.toLowerCase().includes(q)
      );
    }

    // Program chip filter
    if (filter !== "all") {
      if (filter === "active") {
        result = result.filter((m) => m.launch_details.status === "active");
      } else {
        result = result.filter((m) => m.program === filter);
      }
    }

    // Mission Type filter (crewed vs robotic)
    if (typeFilter !== "all") {
      const isCrewed = typeFilter === "crewed";
      result = result.filter((m) => !!m.crewed === isCrewed);
    }

    // Mission Status filter
    if (statusFilter !== "all") {
      result = result.filter((m) => m.launch_details.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "launch-desc") {
        return new Date(b.launch_details.date).getTime() - new Date(a.launch_details.date).getTime();
      }
      if (sortBy === "launch-asc") {
        return new Date(a.launch_details.date).getTime() - new Date(b.launch_details.date).getTime();
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return result;
  }, [missions, filter, search, typeFilter, statusFilter, sortBy]);

  return (
    <div className="pb-16">
      {/* ── Analytics Dashboard ────────────────────────────────────────── */}
      <MissionAnalytics missions={missions} />

      {/* ── Sticky search + chips + advanced filters bar ───────────────── */}
      <div className="sticky top-16 z-40 bg-[#040D21]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_1px_0_0_rgba(255,255,255,0.05)] mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <input
              type="search"
              placeholder={t("search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-xl border border-white/15 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 bg-white/[0.07] text-white backdrop-blur-sm shadow-sm placeholder:text-white/30"
            />
            
            {/* Advanced Filters dropdown row */}
            <div className="flex flex-wrap gap-2">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-white/15 px-3 py-2 text-xs focus:outline-none bg-[#050e21] text-white/80 cursor-pointer hover:bg-white/[0.04] transition-all"
              >
                <option value="all">{t("type_all")}</option>
                <option value="crewed">{t("type_crewed")}</option>
                <option value="robotic">{t("type_robotic")}</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-white/15 px-3 py-2 text-xs focus:outline-none bg-[#050e21] text-white/80 cursor-pointer hover:bg-white/[0.04] transition-all"
              >
                <option value="all">{t("status_all")}</option>
                <option value="active">{t("status_active")}</option>
                <option value="completed">{t("status_completed")}</option>
                <option value="planned">{t("status_planned")}</option>
              </select>

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-white/15 px-3 py-2 text-xs focus:outline-none bg-[#050e21] text-white/80 cursor-pointer hover:bg-white/[0.04] transition-all"
              >
                <option value="launch-desc">{t("sort_launch_desc")}</option>
                <option value="launch-asc">{t("sort_launch_asc")}</option>
                <option value="name-asc">{t("sort_name_asc")}</option>
                <option value="name-desc">{t("sort_name_desc")}</option>
              </select>

              {/* View Mode Toggle */}
              <button
                onClick={() => setViewMode(viewMode === "grid" ? "roadmap" : "grid")}
                className="rounded-xl border border-white/15 px-3.5 py-2 text-xs bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>{viewMode === "grid" ? "🗺️" : "🔲"}</span>
                <span>{viewMode === "grid" ? t("view_roadmap") : t("view_grid")}</span>
              </button>
            </div>
          </div>

          {/* Program Chips */}
          <div className="flex gap-2 shrink-0 overflow-x-auto scrollbar-none pt-1">
            {chips.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border ${
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

      {/* ── Mission Display Area (Grid vs Roadmap) ────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {viewMode === "roadmap" ? (
          <MissionsRoadmap missions={displayed} />
        ) : (
          <div>
            {displayed.length === 0 ? (
              <p className="text-center text-white/30 py-20">{t("no_results")}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayed.map((mission) => (
                  <Link key={mission.id} href={`/missions/${mission.id}`} className="block group">
                    <MissionCard mission={mission} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Missions Quiz Section ─────────────────────────────────────── */}
      <div className="mt-12 border-t border-white/5 pt-12">
        <MissionsQuiz />
      </div>
    </div>
  );
}
