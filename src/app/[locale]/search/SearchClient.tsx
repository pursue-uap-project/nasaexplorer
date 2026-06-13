"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import { getMissions, Mission } from "@/lib/nasa";
import uapStoriesData from "@/data/uap-stories.json";
import { performUnifiedSearch, SearchResult, UapSighting } from "@/lib/fuzzy";

interface SearchClientProps {
  locale: "en" | "es";
}

export default function SearchClient({ locale }: SearchClientProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial query from URL
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const [activeFilter, setActiveFilter] = useState<"all" | "nasa" | "uap">("all");
  const [nasaMissions, setNasaMissions] = useState<Mission[]>([]);

  // Load NASA missions on mount
  useEffect(() => {
    getMissions().then(setNasaMissions).catch(() => {});
  }, []);

  // Update URL on query change (debounced slightly to prevent excessive history entries)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (query.trim()) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.replace(`/${locale}/search?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, router, locale]);

  // Sync state if URL query parameter changes
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  // Cast UAP data
  const uapSightings = useMemo(() => uapStoriesData as UapSighting[], []);

  // Perform the search
  const allResults = useMemo(() => {
    return performUnifiedSearch(query, nasaMissions as any, uapSightings, locale);
  }, [query, nasaMissions, uapSightings, locale]);

  // Filter the results
  const filteredResults = useMemo(() => {
    if (activeFilter === "all") return allResults;
    return allResults.filter((r) => r.type === activeFilter);
  }, [allResults, activeFilter]);

  // Counts for filters
  const counts = useMemo(() => {
    const nasa = allResults.filter((r) => r.type === "nasa").length;
    const uap = allResults.filter((r) => r.type === "uap").length;
    return {
      all: allResults.length,
      nasa,
      uap,
    };
  }, [allResults]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white relative overflow-hidden flex flex-col pb-20">
      {/* ── Background Cosmic Ambience ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-emerald-950/20 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 relative z-10 pt-12">
        {/* Title */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-emerald-400"
          >
            {t("title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-white/40 text-xs sm:text-sm font-mono tracking-widest mt-2 uppercase"
          >
            CROSS-PORTAL DECLASSIFIED DATABASE INDEX
          </motion.p>
        </div>

        {/* Search Input Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative max-w-2xl mx-auto mb-10"
        >
          <div className="relative rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-2 shadow-2xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-300">
            <div className="flex items-center gap-3 px-3">
              {/* Search icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white/40 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21-21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("placeholder")}
                className="w-full bg-transparent border-0 text-white placeholder-white/30 focus:ring-0 outline-none text-base py-2 font-sans"
              />

              {/* Clear button */}
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1.5 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <p className="text-center text-white/30 text-xs mt-2 font-mono">
            {t("input_hint")}
          </p>
        </motion.div>

        {/* Filters and Stats Bar */}
        {query.trim().length >= 2 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wide transition-all ${
                  activeFilter === "all"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-900/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {t("all")} ({counts.all})
              </button>
              <button
                onClick={() => setActiveFilter("nasa")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wide transition-all ${
                  activeFilter === "nasa"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "text-white/50 hover:text-blue-400 hover:bg-blue-950/20"
                }`}
              >
                {t("nasa_only")} ({counts.nasa})
              </button>
              <button
                onClick={() => setActiveFilter("uap")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wide transition-all ${
                  activeFilter === "uap"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                    : "text-white/50 hover:text-emerald-400 hover:bg-emerald-950/20"
                }`}
              >
                {t("uap_only")} ({counts.uap})
              </button>
            </div>

            {/* Results count text */}
            <div className="text-white/40 text-xs font-mono uppercase tracking-wider">
              {filteredResults.length === 1
                ? t("results_count_one")
                : t("results_count_other", { count: filteredResults.length })}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="relative min-h-[200px]">
          {query.trim().length < 2 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-white/30 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-3 text-white/20">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25-3v13.5m0-13.5L10.5 6m1.5-1.5L13.5 6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="text-sm font-mono tracking-wide">
                AWAITING SEARCH INPUT QUERY...
              </p>
            </div>
          ) : filteredResults.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredResults.map((result) => {
                  const isNasa = result.type === "nasa";
                  return (
                    <motion.div
                      key={`${result.type}-${result.id}`}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, y: -10 }}
                      className={`relative rounded-xl overflow-hidden backdrop-blur-md transition-all duration-300 ${
                        isNasa
                          ? "bg-slate-900/40 border border-blue-900/30 hover:border-blue-500/40 hover:bg-slate-900/60 shadow-lg shadow-blue-950/10"
                          : "bg-emerald-950/10 border border-emerald-900/30 hover:border-emerald-500/40 hover:bg-emerald-950/20 shadow-lg shadow-emerald-950/10"
                      }`}
                    >
                      <Link href={result.url} className="block p-5 relative z-10">
                        {/* Source Tag Badge */}
                        <div className="flex items-center justify-between gap-4 mb-2.5">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                            isNasa 
                              ? "bg-blue-950/80 text-blue-300 border border-blue-800/40"
                              : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                          }`}>
                            {result.subtitle}
                          </span>
                          
                          {/* Score indicator for debug / quality indexing */}
                          <span className="text-[10px] font-mono text-white/20">
                            Match: {(result.score * 100).toFixed(0)}%
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className={`text-lg font-bold leading-snug mb-1.5 transition-colors ${
                          isNasa ? "text-blue-100 hover:text-white" : "text-emerald-100 hover:text-white font-mono"
                        }`}>
                          {result.title}
                        </h3>

                        {/* Description snippet */}
                        <p className="text-white/60 text-sm leading-relaxed mb-3 line-clamp-2">
                          {result.description}
                        </p>

                        {/* Tags / Metadata list */}
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {result.tags.slice(0, 4).map((tag, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  isNasa
                                    ? "bg-blue-900/20 text-blue-400"
                                    : "bg-emerald-900/20 text-emerald-400"
                                }`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center text-white/30 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-3 text-white/20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <p className="text-sm font-mono tracking-wide max-w-xs mx-auto">
                {t("no_results")}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
