"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import uapStoriesData from "@/data/uap-stories.json";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// Safely import Leaflet Map Component with SSR disabled
const UapMap = dynamic(() => import("@/components/UapMap"), { ssr: false });

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

export default function UapMapPage() {
  const t = useTranslations("uap");
  const locale = useLocale();
  const router = useRouter();

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  // Load static stories
  const stories = useMemo(() => uapStoriesData as UapStory[], []);

  // Extract unique agencies
  const agencies = useMemo(() => {
    return ["all", ...new Set(stories.map((s) => s.agency.toLowerCase()))];
  }, [stories]);

  // Apply filters for Map display
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const matchesRegion =
        selectedRegion === "all" || story.region === selectedRegion;
      const matchesAgency =
        selectedAgency === "all" ||
        story.agency.toLowerCase() === selectedAgency;
      return matchesRegion && matchesAgency;
    });
  }, [stories, selectedRegion, selectedAgency]);

  // Get selected story details
  const selectedStory = useMemo(() => {
    if (!selectedStoryId) return null;
    return stories.find((s) => s.id === selectedStoryId) || null;
  }, [stories, selectedStoryId]);

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col md:flex-row">
      {/* Scanline and dark terminal overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.02),transparent)] z-10" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-10 opacity-20" />

      {/* Sidebar - Controls */}
      <div className="w-full md:w-80 shrink-0 bg-slate-950 border-r border-emerald-500/20 p-5 flex flex-col justify-between overflow-y-auto relative z-20 font-mono">
        <div>
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/uap"
              className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest block mb-2"
            >
              &lt; {t("back_to_archive")}
            </Link>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">
              GEOSPATIAL <span className="text-emerald-400">RADAR</span>
            </h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">
              Map position of declassified anomalies
            </p>
          </div>

          {/* Region Filter */}
          <div className="mb-5">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">
              {t("map_label")}
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-900 border border-emerald-500/20 rounded p-2 text-xs text-slate-200 outline-none focus:border-emerald-400 transition-all font-mono"
            >
              {REGIONS.map((r) => (
                <option key={r.key} value={r.key}>
                  {(locale === "es" ? r.label_es : r.label_en).toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Agency Filter */}
          <div className="mb-6">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">
              Filter by Agency
            </label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full bg-slate-900 border border-emerald-500/20 rounded p-2 text-xs text-slate-200 outline-none focus:border-emerald-400 transition-all font-mono"
            >
              {agencies.map((agency) => (
                <option key={agency} value={agency}>
                  {agency === "all" ? "ALL AGENCIES" : agency.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Counter info */}
          <div className="p-3 bg-slate-900/60 border border-emerald-500/10 rounded mb-6">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">
              Radar Coordinates Active
            </span>
            <span className="text-xl font-bold text-emerald-400">
              {filteredStories.length} CASES
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t border-emerald-500/10 pt-4 mt-4 text-[9px] text-slate-500 space-y-1.5 uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            <span>Active anomalous sighting</span>
          </div>
          <div>System state: SECURE</div>
          <div>Data feeds: Purge records</div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 h-full relative z-10 bg-slate-900">
        <UapMap
          stories={filteredStories}
          onSelectStory={(id) => setSelectedStoryId(id)}
        />

        {/* Dynamic Detail Overlay Slide-over */}
        <AnimatePresence>
          {selectedStory && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[450px] bg-slate-950/95 border-l border-emerald-500/20 p-6 z-[1001] shadow-2xl flex flex-col justify-between overflow-y-auto font-mono text-xs text-slate-300"
            >
              <div>
                {/* Header Actions */}
                <div className="flex justify-between items-center border-b border-emerald-500/20 pb-3 mb-5">
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                    ANOMALY CLASSIFIED RECORD
                  </span>
                  <button
                    onClick={() => setSelectedStoryId(null)}
                    className="text-slate-500 hover:text-white px-2 py-0.5 border border-slate-800 rounded text-[9px] uppercase transition-colors"
                  >
                    [Close]
                  </button>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    {selectedStory.agency.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {selectedStory.meta}
                  </span>
                </div>

                {/* Sighting Title */}
                <h2 className="text-base font-bold text-white mb-4 border-b border-emerald-500/5 pb-2 uppercase">
                  {locale === "es" ? selectedStory.title_es : selectedStory.title_en}
                </h2>

                {/* Visual attachments */}
                {(selectedStory.image || (selectedStory.images && selectedStory.images.length > 0)) && (
                  <div className="w-full h-44 relative mb-4 rounded border border-emerald-500/10 bg-slate-900 overflow-hidden">
                    <img
                      src={`/nasaexplorer/assets/uap/${selectedStory.images ? selectedStory.images[0].split("/").pop() : selectedStory.image.split("/").pop()}`}
                      alt={selectedStory.title_en}
                      className="w-full h-full object-cover brightness-75 hover:brightness-100 transition-all cursor-zoom-in"
                      onClick={() => router.push(`/uap/sighting/${selectedStory.id}`)}
                    />
                  </div>
                )}

                {/* Sighting Description */}
                <div className="space-y-3 leading-relaxed text-slate-400">
                  <p>{locale === "es" ? selectedStory.body_es : selectedStory.body_en}</p>
                </div>
              </div>

              {/* Bottom detail action links */}
              <div className="pt-4 mt-6 border-t border-emerald-500/10 flex gap-2">
                <a
                  href={selectedStory.url}
                  target="_blank"
                  rel="noopener"
                  className="flex-1 text-center py-2 bg-slate-900 border border-emerald-500/20 hover:border-emerald-400 text-slate-300 hover:text-white transition-all uppercase text-[10px] tracking-wider font-bold rounded"
                >
                  {t("access_file")}
                </a>
                <Link
                  href={`/uap/sighting/${selectedStory.id}`}
                  className="flex-1 text-center py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all uppercase text-[10px] tracking-wider font-bold rounded"
                >
                  Open Record page
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
