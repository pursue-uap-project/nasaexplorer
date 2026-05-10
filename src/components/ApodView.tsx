"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

type ApodData = {
  title: string;
  url: string;
  hdurl?: string;
  media_type: string;
  explanation: string;
  date: string;
  copyright?: string;
};

const MIN_DATE = "1995-06-16";

function todayStr(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function shiftDate(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + n);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function randomApodDate(): string {
  const start = new Date(MIN_DATE).getTime();
  const end = Date.now();
  const rand = new Date(start + Math.random() * (end - start));
  return [
    rand.getFullYear(),
    String(rand.getMonth() + 1).padStart(2, "0"),
    String(rand.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function ApodView() {
  const t = useTranslations("apod");
  const locale = useLocale();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [apod, setApod] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const today = todayStr();
  const isPrevDisabled = selectedDate <= MIN_DATE;
  const isNextDisabled = selectedDate >= today;

  useEffect(() => {
    setLoading(true);
    setError(false);
    setApod(null);
    setExpanded(false);
    const key = process.env.NEXT_PUBLIC_NASA_API_KEY ?? "DEMO_KEY";
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}&date=${selectedDate}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setApod)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const formattedDate = (() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(
      locale === "es" ? "es-ES" : "en-US",
      { weekday: "short", year: "numeric", month: "long", day: "numeric" }
    );
  })();

  const shortLen = 480;
  const isLong = (apod?.explanation.length ?? 0) > shortLen;

  const navBtn =
    "p-2 rounded-xl border border-white/80 bg-white/65 backdrop-blur-sm text-foreground/60 hover:text-primary hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150";

  return (
    <div>
      {/* ── Sticky date navigation bar ─────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm mb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">

          {/* ← Prev day */}
          <button
            onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
            disabled={isPrevDisabled}
            aria-label={t("prev_day")}
            className={navBtn}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Date display — overlaid native date input */}
          <div className="relative flex-1 sm:flex-none sm:min-w-[260px]">
            <div className="px-4 py-2 rounded-xl border border-white/80 bg-white/65 backdrop-blur-sm text-sm font-medium text-foreground/70 text-center select-none hover:bg-white hover:text-primary transition-all cursor-pointer">
              <span className="flex items-center gap-2 justify-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary/50 shrink-0">
                  <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                </svg>
                {formattedDate}
              </span>
            </div>
            <input
              type="date"
              value={selectedDate}
              min={MIN_DATE}
              max={today}
              onChange={(e) => { if (e.target.value) setSelectedDate(e.target.value); }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label={t("pick_date")}
            />
          </div>

          {/* → Next day */}
          <button
            onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
            disabled={isNextDisabled}
            aria-label={t("next_day")}
            className={navBtn}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex-1 hidden sm:block" />

          {/* Today */}
          {selectedDate !== today && (
            <button
              onClick={() => setSelectedDate(today)}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-150"
            >
              {t("today")}
            </button>
          )}

          {/* Random date */}
          <button
            onClick={() => setSelectedDate(randomApodDate())}
            title={t("random")}
            className="px-3 py-2 rounded-xl text-xs font-medium border border-white/80 bg-white/65 text-foreground/55 hover:bg-white hover:text-primary transition-all duration-150 flex items-center gap-1.5 shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
            </svg>
            <span className="hidden sm:inline">{t("random")}</span>
          </button>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}

      {/* Loading skeleton */}
      {loading && (
        <div className="animate-pulse bg-white/65 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gray-200/80 w-full h-[55vh]" />
          <div className="px-6 sm:px-8 py-6 space-y-4">
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-28" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded w-[95%]" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-4/6" />
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-white/65 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-sm p-16 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-foreground/20 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-foreground/50 text-sm">{t("error")}</p>
        </div>
      )}

      {/* APOD card */}
      {!loading && !error && apod && (
        <div className="bg-white/65 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl ring-1 ring-inset ring-white/50 overflow-hidden">

          {/* Media */}
          {apod.media_type === "image" ? (
            <div className="bg-gray-950 flex items-center justify-center" style={{ minHeight: "40vh" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={apod.hdurl ?? apod.url}
                alt={apod.title}
                className="w-full max-h-[72vh] object-contain"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-950">
              <iframe
                src={apod.url}
                title={apod.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          {/* Info */}
          <div className="px-6 sm:px-8 py-6 bg-white/30">

            {/* Meta row */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4 text-xs font-mono text-foreground/35">
              <time dateTime={apod.date}>{apod.date}</time>
              <div className="flex items-center gap-4">
                {apod.copyright && (
                  <span>© {apod.copyright.trim().replace(/\n/g, " ")}</span>
                )}
                {apod.hdurl && apod.media_type === "image" && (
                  <a
                    href={apod.hdurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary/60 hover:text-primary transition-colors normal-case not-italic"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                    </svg>
                    {t("view_hd")}
                  </a>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-primary leading-tight mb-4">
              {apod.title}
            </h2>

            {/* Explanation */}
            <p className="text-foreground/65 leading-relaxed text-sm max-w-3xl">
              {expanded || !isLong
                ? apod.explanation
                : apod.explanation.slice(0, shortLen) + "…"}
            </p>

            {isLong && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="mt-3 text-sm text-primary hover:underline font-medium transition-colors"
              >
                {expanded ? t("show_less") : t("show_more")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
