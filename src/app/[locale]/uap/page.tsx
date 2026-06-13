"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import uapStoriesData from "@/data/uap-stories.json";
import { motion, AnimatePresence } from "framer-motion";

interface UapStory {
  id: string;
  meta: string;
  year: string;
  agency: string;
  region: string;
  tags: string[];
  title_es: string;
  title_en: string;
  body_es: string;
  body_en: string;
  image: string;
  images?: string[];
  video?: string;
  url: string;
}

const REGIONS = [
  { key: "all", label_es: "Todas las regiones", label_en: "All regions" },
  { key: "usa", label_es: "Estados Unidos", label_en: "United States" },
  { key: "space", label_es: "Espacio exterior", label_en: "Outer Space" },
  { key: "middle-east", label_es: "Oriente Medio", label_en: "Middle East" },
  { key: "iraq", label_es: "Irak", label_en: "Iraq" },
  { key: "syria", label_es: "Siria", label_en: "Syria" },
  { key: "europe", label_es: "Europa", label_en: "Europe" },
  { key: "pacific", label_es: "Pacífico", label_en: "Pacific" },
  { key: "japan", label_es: "Japón", label_en: "Japan" },
  { key: "germany", label_es: "Alemania", label_en: "Germany" },
  { key: "africa", label_es: "África", label_en: "Africa" },
  { key: "central-asia", label_es: "Asia Central", label_en: "Central Asia" },
  { key: "classified", label_es: "Clasificado", label_en: "Classified" },
];

const FILTER_CATEGORIES = [
  { key: "all", label_key: "all" },
  { key: "1940s", label_key: "1940s" },
  { key: "1950s", label_key: "1950s" },
  { key: "1960s", label_key: "1960s" },
  { key: "1970s", label_key: "1970s" },
  { key: "2020s", label_key: "2020s" },
  { key: "fbi", label_key: "fbi" },
  { key: "nasa", label_key: "nasa" },
  { key: "dow", label_key: "dow" },
  { key: "aaro", label_key: "aaro" },
  { key: "dos", label_key: "dos" },
  { key: "classified", label_key: "classified" },
  { key: "cia", label_key: "cia" },
  { key: "doe", label_key: "doe" },
  { key: "odni", label_key: "odni" },
  { key: "release-2", label_key: "release-2" },
];

function getYearLabel(year: string): string {
  const yr = parseInt(year);
  if (yr === 1944) return "FOO FIGHTERS";
  if (yr === 1946 || yr === 1947 || yr === 1948) return "FBI GEN.";
  if (yr === 1949) return "FLYING DISCS";
  if (yr >= 1950 && yr <= 1960) return "COLD WAR";
  if (yr === 1963) return "SP.PROJECT";
  if (yr === 1965) return "GEMINI 7";
  if (yr === 1969) return "APOLLO";
  if (yr >= 1972 && yr <= 1973) return "APOLLO/SKYLAB";
  if (yr === 1985) return "PAPUA";
  if (yr === 1990) return "FBI PHOTOS";
  if (yr === 1994) return "KAZAKHSTAN";
  if (yr === 1996) return "USAF RPT";
  if (yr === 2000) return "VANDENBERG";
  if (yr === 2016) return "SYRIA";
  if (yr >= 2020 && yr <= 2021) return "GULF OPS";
  if (yr === 2022) return "IRAQ/SYRIA";
  if (yr === 2023) return "FBI/DOW";
  if (yr === 2024) return "GLOBAL";
  if (yr === 2025) return "ORBS/HQ";
  if (yr === 2026) return "PURSUE";
  return "";
}

export default function UapArchivePage() {
  const t = useTranslations("uap");
  const locale = useLocale();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Cast JSON data safely
  const stories = useMemo(() => uapStoriesData as UapStory[], []);

  // Unique years in sorted order
  const uniqueYears = useMemo(() => {
    return [...new Set(stories.map((s) => s.year))].sort();
  }, [stories]);

  // Statistics
  const stats = useMemo(() => {
    const agencies = new Set(stories.map((s) => s.agency)).size;
    const countries = new Set(stories.map((s) => s.region)).size;
    return {
      docs: stories.length,
      years: "80+",
      agencies,
      countries,
    };
  }, [stories]);

  // Filtered stories listing
  const filteredStories = useMemo(() => {
    const q = search.toLowerCase().trim();

    return stories.filter((story) => {
      // Text search
      const haystack = [
        story.title_es,
        story.title_en,
        story.body_es,
        story.body_en,
        story.meta,
        story.agency,
        (story.tags || []).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !q || q.split(" ").every((word) => haystack.includes(word));

      // Category filter
      let matchesCat = true;
      if (categoryFilter !== "all") {
        const tags = story.tags || [];
        const agency = story.agency.toLowerCase();
        const meta = story.meta.toLowerCase();
        matchesCat =
          tags.some((tag) => tag.toLowerCase() === categoryFilter) ||
          tags.some((tag) => tag.toLowerCase().includes(categoryFilter)) ||
          agency === categoryFilter ||
          meta.includes(categoryFilter);
      }

      // Region filter
      const matchesRegion =
        regionFilter === "all" || story.region === regionFilter;

      // Year filter
      const matchesYear = yearFilter === "all" || story.year === yearFilter;

      return matchesSearch && matchesCat && matchesRegion && matchesYear;
    });
  }, [stories, search, categoryFilter, regionFilter, yearFilter]);

  // Search Autocomplete suggestions
  const suggestions = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return stories
      .filter((s) => {
        const title = locale === "es" ? s.title_es : s.title_en;
        const hay = [title, s.meta, (s.tags || []).join(" ")].join(" ").toLowerCase();
        return q.split(" ").every((w) => hay.includes(w));
      })
      .slice(0, 6);
  }, [stories, search, locale]);

  // Close suggestions click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K to search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("searchInput");
        input?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleYearClick = (year: string) => {
    if (yearFilter === year) {
      setYearFilter("all");
    } else {
      setYearFilter(year);
    }
  };

  const handleCategoryClick = (category: string) => {
    if (categoryFilter === category) {
      setCategoryFilter("all");
    } else {
      setCategoryFilter(category);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      
      {/* Scanline overlay for retro terminal effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03),transparent)] z-10" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-10 opacity-30" />

      {/* Terminal Title & Radar Header */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-8 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-emerald-500/20 pb-6 mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-mono text-xs tracking-[0.2em] uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SECURE PROTOCOL // DECLASSIFIED ARCHIVE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase font-mono">
              PROJECT <span className="text-emerald-400">PURSUE</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl font-mono">
              {t("subtitle")} // {t("subtitle2")}
            </p>
          </div>
          
          <Link
            href="/uap/map"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono text-xs font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0"
          >
            🛰️ EXPLORE GEOSPATIAL MAP
          </Link>
        </div>

        {/* STATS PANEL */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-slate-900/40 border border-emerald-500/10 rounded-lg p-5 font-mono">
          <div className="border-r border-emerald-500/10 pr-2">
            <span className="text-slate-500 text-[10px] uppercase block tracking-wider">{t("stat_docs")}</span>
            <span className="text-2xl font-bold text-emerald-400">{stats.docs}</span>
          </div>
          <div className="border-r border-emerald-500/10 lg:pl-4 pr-2">
            <span className="text-slate-500 text-[10px] uppercase block tracking-wider">{t("stat_years")}</span>
            <span className="text-2xl font-bold text-emerald-400">{stats.years}</span>
          </div>
          <div className="border-r border-emerald-500/10 lg:pl-4 pr-2">
            <span className="text-slate-500 text-[10px] uppercase block tracking-wider">{t("stat_agencies")}</span>
            <span className="text-2xl font-bold text-emerald-400">{stats.agencies}</span>
          </div>
          <div className="lg:pl-4 pr-2">
            <span className="text-slate-500 text-[10px] uppercase block tracking-wider">{t("stat_countries")}</span>
            <span className="text-2xl font-bold text-emerald-400">{stats.countries}</span>
          </div>
        </div>

        {/* SEARCH & AUTOCOMPLETE */}
        <div className="mb-8" ref={searchContainerRef}>
          <div className="relative search-container">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500">
              <span className="font-mono text-sm">&gt;</span>
            </div>
            <input
              id="searchInput"
              type="text"
              className="w-full bg-slate-900 border border-emerald-500/20 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-100 pl-8 pr-12 py-3 rounded-lg font-mono text-sm outline-none transition-all placeholder:text-slate-600 shadow-inner"
              placeholder={t("search_placeholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setShowSuggestions(false);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 font-mono text-xs"
              >
                [ESC]
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute w-full mt-1.5 bg-slate-950 border border-emerald-500/30 rounded-lg shadow-2xl overflow-hidden z-30 font-mono"
              >
                {suggestions.map((story) => {
                  const title = locale === "es" ? story.title_es : story.title_en;
                  return (
                    <Link
                      key={story.id}
                      href={`/uap/sighting/${story.id}`}
                      className="block px-4 py-3 border-b border-emerald-500/10 hover:bg-emerald-500/5 text-left transition-colors"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <div className="text-[10px] text-emerald-500 mb-0.5">{story.meta.split("·")[0].trim()}</div>
                      <div className="text-xs font-bold text-slate-200">{title}</div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* REGION PINS */}
        <div className="mb-8">
          <span className="text-slate-500 text-[10px] uppercase font-mono block mb-2 tracking-wider">{t("map_label")}</span>
          <div className="flex flex-wrap gap-1.5" id="regionPins">
            {REGIONS.map((r) => {
              const label = locale === "es" ? r.label_es : r.label_en;
              const isActive = regionFilter === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setRegionFilter(r.key)}
                  className={`text-[10px] px-3 py-1 font-mono rounded border transition-all ${
                    isActive
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                  }`}
                >
                  {label.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* TIMELINE BAR */}
        <div className="mb-10">
          <span className="text-slate-500 text-[10px] uppercase font-mono block mb-3 tracking-wider">{t("timeline_label")}</span>
          <div className="flex overflow-x-auto gap-2 py-3 scrollbar-thin scrollbar-thumb-emerald-500/20 border-t border-b border-emerald-500/10">
            {uniqueYears.map((year) => {
              const isActive = yearFilter === year;
              const label = getYearLabel(year);
              return (
                <button
                  key={year}
                  onClick={() => handleYearClick(year)}
                  className={`flex flex-col items-center min-w-[70px] py-1.5 rounded transition-all ${
                    isActive
                      ? "bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                      : "hover:bg-slate-900 border border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mb-1 ${isActive ? "bg-emerald-400 shadow-[0_0_6px_#10b981]" : "bg-slate-700"}`} />
                  <span className="text-xs font-bold font-mono">{year}</span>
                  <span className="text-[8px] text-slate-500 font-mono tracking-tighter truncate w-full text-center max-w-[65px]">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FILTER CATEGORIES & COUNT */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT: Category Filters */}
          <div className="w-full lg:w-64 shrink-0 bg-slate-900/30 border border-emerald-500/10 rounded-lg p-4">
            <span className="text-slate-500 text-[10px] uppercase font-mono block mb-3 tracking-wider">{t("filter_label")}</span>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              {FILTER_CATEGORIES.map((cat) => {
                const isActive = categoryFilter === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryClick(cat.key)}
                    className={`w-auto lg:w-full text-left text-[10px] px-3 py-2 font-mono rounded border transition-all ${
                      isActive
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    &gt; {t(`filters.${cat.label_key}`).toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Article list */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2 mb-6 font-mono text-xs text-slate-500">
              <span>LISTING STATE // OK</span>
              <span>
                {filteredStories.length === 1 
                  ? t("results_count_one", { count: 1 })
                  : t("results_count_other", { count: filteredStories.length })}
              </span>
            </div>

            {filteredStories.length === 0 ? (
              <div className="border border-dashed border-emerald-500/20 rounded-lg py-16 text-center text-slate-500 font-mono text-sm">
                [ {t("no_results")} ]
              </div>
            ) : (
              <div className="space-y-6">
                {filteredStories.map((story) => {
                  const title = locale === "es" ? story.title_es : story.title_en;
                  const body = locale === "es" ? story.body_es : story.body_en;
                  
                  return (
                    <article
                      key={story.id}
                      className="border border-emerald-500/10 bg-slate-950 hover:bg-slate-900/20 rounded-lg p-5 transition-all hover:border-emerald-500/25 flex flex-col md:flex-row gap-5"
                    >
                      {/* Left: preview image/video if any */}
                      {(story.image || (story.images && story.images.length > 0)) && (
                        <div className="w-full md:w-48 shrink-0 h-32 relative rounded bg-slate-900 overflow-hidden border border-emerald-500/10">
                          <img
                            src={`/nasaexplorer/assets/uap/${story.images ? story.images[0].split("/").pop() : story.image.split("/").pop()}`}
                            alt={title}
                            className="w-full h-full object-cover brightness-75 hover:brightness-100 transition-all cursor-pointer"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Right: info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2 font-mono">
                            <span className="text-[10px] text-emerald-500/80 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                              {story.agency.toUpperCase()}
                            </span>
                            <span className="text-[9px] text-slate-500">
                              {story.meta}
                            </span>
                          </div>
                          
                          <h2 className="text-lg font-bold text-slate-100 font-mono hover:text-emerald-400 transition-colors uppercase">
                            <Link href={`/uap/sighting/${story.id}`}>
                              {title}
                            </Link>
                          </h2>
                          
                          <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                            {body}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-emerald-500/5">
                          <div className="flex gap-2">
                            {(story.tags || []).slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[8px] font-mono text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded"
                              >
                                {tag.toUpperCase()}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[10px]">
                            <a
                              href={story.url}
                              target="_blank"
                              rel="noopener"
                              className="px-3 py-1 bg-slate-900 border border-emerald-500/20 hover:border-emerald-400 text-slate-400 hover:text-emerald-300 rounded transition-all"
                            >
                              {t("access_file")}
                            </a>
                            <Link
                              href={`/uap/sighting/${story.id}`}
                              className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded transition-all"
                            >
                              {t("view_details")}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
