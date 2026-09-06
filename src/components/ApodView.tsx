"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import horneada from "@/data/apod.json";
import {
  MIN_DATE,
  todayStr,
  shiftDate,
  randomApodDate,
  respaldoPara,
  respaldoUrl,
  type ApodData,
} from "@/lib/apod-dates";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Resultado de una fecha concreta.
 *
 * Va emparejado con su fecha a propósito. Antes eran cuatro `useState` sueltos
 * que el efecto reseteaba a mano al cambiar de día — un `setState` síncrono
 * dentro de un efecto, que es lo que obligaba a un `eslint-disable`. Guardando
 * a qué fecha pertenece el resultado, «cargando» se **deriva**: si lo que
 * tenemos no es de la fecha pedida, es que aún no ha llegado. No hay nada que
 * resetear.
 */
type Resultado =
  | { estado: "loading" }
  | { estado: "ok"; data: ApodData; respaldo: boolean }
  | { estado: "error" };

const CACHE_KEY = "nasaexplorer_apod_today";

function readCache(): ApodData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: { date: string; data: ApodData } = JSON.parse(raw);
    if (parsed.date === todayStr()) return parsed.data;
    return null;
  } catch {
    return null;
  }
}

function writeCache(data: ApodData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayStr(), data }));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export default function ApodView() {
  const t = useTranslations("apod");
  const locale = useLocale();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [cargado, setCargado] = useState<{ fecha: string; r: Resultado }>({
    fecha: todayStr(),
    r: { estado: "loading" },
  });
  const [expandidoPara, setExpandidoPara] = useState<string | null>(null);

  // Todo lo que antes se reseteaba en el efecto sale de aquí.
  const resultado: Resultado =
    cargado.fecha === selectedDate ? cargado.r : { estado: "loading" };
  const apod = resultado.estado === "ok" ? resultado.data : null;
  const loadState = resultado.estado;
  const isFallback = resultado.estado === "ok" && resultado.respaldo;
  const expanded = expandidoPara === selectedDate;
  const setExpanded = (v: boolean) => setExpandidoPara(v ? selectedDate : null);

  const today = todayStr();
  const isPrevDisabled = selectedDate <= MIN_DATE;
  const isNextDisabled = selectedDate >= today;
  const isToday = selectedDate === today;

  useEffect(() => {
    const fecha = selectedDate;
    const esHoy = fecha === todayStr();
    let vivo = true;
    // Cada respuesta se publica junto a la fecha que pidió, así que una que
    // llegue tarde tras cambiar de día no pisa a la buena.
    const publicar = (r: Resultado) => vivo && setCargado({ fecha, r });

    if (esHoy) {
      const cache = readCache();
      if (cache) {
        publicar({ estado: "ok", data: cache, respaldo: false });
        return;
      }
    }

    // `||`, no `??`: cuando el workflow declara la variable pero el secret no
    // existe, Next incrusta la cadena vacía, y `??` solo cubre null/undefined.
    // El resultado era `api_key=` a secas, que la API rechaza siempre.
    const key = process.env.NEXT_PUBLIC_NASA_API_KEY || "DEMO_KEY";
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}&date=${fecha}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: ApodData) => {
        if (esHoy) writeCache(data);
        publicar({ estado: "ok", data, respaldo: false });
      })
      .catch(() => {
        // Respaldo SOLO con la foto que de verdad corresponde a esta fecha; ver
        // `respaldoPara` en `@/lib/apod-dates`. Servir la de otro día rotulada
        // con esta sería mentir, y el badge «Respaldo Local» no lo arregla.
        const propio = respaldoPara(fecha);
        if (propio) {
          publicar({
            estado: "ok",
            respaldo: true,
            data: {
              title: locale === "es" ? propio.title_es : propio.title,
              url: respaldoUrl(propio, BASE),
              hdurl: respaldoUrl(propio, BASE),
              media_type: "image",
              explanation: locale === "es" ? propio.explanation_es : propio.explanation,
              date: propio.date,
              copyright: propio.credit,
            },
          });
          return;
        }

        // Para hoy queda la foto que hornea el cron. Para cualquier otra fecha
        // se dice que no se pudo cargar, que es la verdad.
        if (esHoy && horneada?.url) {
          publicar({
            estado: "ok",
            respaldo: true,
            data: {
              title: horneada.title,
              url: horneada.url,
              hdurl: horneada.hdurl ?? horneada.url,
              media_type: horneada.media_type === "video" ? "video" : "image",
              explanation: horneada.explanation,
              date: horneada.date,
              copyright: horneada.copyright ?? undefined,
            },
          });
          return;
        }

        publicar({ estado: "error" });
      });

    return () => {
      vivo = false;
    };
  }, [selectedDate, locale]);

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
    "p-2 rounded-xl border border-white/15 bg-white/[0.07] text-white/55 hover:text-white hover:bg-white/12 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150";

  return (
    <div>
      {/* ── Sticky date navigation bar ─────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-[#040D21]/90 backdrop-blur-xl border-b border-white/8 shadow-[0_1px_0_0_rgba(255,255,255,0.05)] mb-8">
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
            <div className="px-4 py-2 rounded-xl border border-white/15 bg-white/[0.07] text-sm font-medium text-white/65 text-center select-none hover:bg-white/12 hover:text-white transition-all cursor-pointer">
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
          {!isToday && (
            <button
              onClick={() => setSelectedDate(today)}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-white/20 bg-white/10 text-white/75 hover:bg-white/18 hover:text-white transition-all duration-150"
            >
              {t("today")}
            </button>
          )}

          {/* Random date */}
          <button
            onClick={() => setSelectedDate(randomApodDate())}
            title={t("random")}
            className="px-3 py-2 rounded-xl text-xs font-medium border border-white/15 bg-white/6 text-white/45 hover:bg-white/12 hover:text-white transition-all duration-150 flex items-center gap-1.5 shrink-0"
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

      {/* Skeleton screen */}
      {loadState === "loading" && (
        <div className="animate-pulse bg-card border border-card-border rounded-3xl shadow-2xl overflow-hidden">
          {/* Image placeholder */}
          <div className="bg-linear-to-br from-slate-200/80 to-slate-300/60 w-full" style={{ height: "52vh" }}>
            {/* Shimmer overlay */}
            <div className="w-full h-full relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
          {/* Text placeholders */}
          <div className="px-6 sm:px-8 py-7 space-y-4 bg-card-sunken">
            <div className="flex justify-between items-center">
              <div className="h-2.5 bg-slate-200 rounded-full w-24" />
              <div className="h-2.5 bg-slate-200 rounded-full w-20" />
            </div>
            <div className="h-7 bg-slate-200/80 rounded-lg w-3/4" />
            <div className="space-y-2.5 pt-1">
              <div className="h-2.5 bg-slate-100 rounded-full" />
              <div className="h-2.5 bg-slate-100 rounded-full w-[97%]" />
              <div className="h-2.5 bg-slate-100 rounded-full w-11/12" />
              <div className="h-2.5 bg-slate-100 rounded-full w-4/5" />
              <div className="h-2.5 bg-slate-100 rounded-full w-3/5" />
            </div>
          </div>
        </div>
      )}

      {/* Error / fallback */}
      {loadState === "error" && (
        <div className="bg-card border border-card-border rounded-3xl shadow-xs p-12 sm:p-16 text-center">
          {/* Star / telescope icon */}
          <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14 mx-auto mb-5 text-primary/20">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
            <path d="M24 14v10l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="24" r="2" fill="currentColor" />
          </svg>
          <p className="text-muted text-base font-medium mb-2">
            {t("error_title")}
          </p>
          <p className="text-faint text-sm max-w-sm mx-auto mb-8 leading-relaxed">
            {t("error_body")}
          </p>
          <a
            href="https://apod.nasa.gov/apod/astropix.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-md hover:bg-primary/90 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            {t("error_cta")}
          </a>
        </div>
      )}

      {/* APOD card */}
      {loadState === "ok" && apod && (
        <div className="bg-card border border-card-border rounded-3xl shadow-2xl overflow-hidden">

          {/* Media */}
          {apod.media_type === "image" ? (
            <div className="bg-gray-950 flex items-center justify-center" style={{ minHeight: "40vh" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async"
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
          <div className="px-6 sm:px-8 py-6 bg-card-sunken">

            {/* Meta row */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4 text-xs font-mono text-faint">
              <div className="flex items-center gap-3">
                <time dateTime={apod.date}>{apod.date}</time>
                {isFallback ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-sans font-medium uppercase tracking-wide border border-amber-500/20 shadow-[0_0_6px_rgba(245,158,11,0.1)]">
                    {locale === "es" ? "Respaldo Local" : "Local Backup"}
                  </span>
                ) : isToday ? (
                  <span className="px-2 py-0.5 rounded-full bg-primary/8 text-primary/60 text-[10px] font-sans font-medium uppercase tracking-wide border border-primary/15">
                    {t("cached")}
                  </span>
                ) : null}
              </div>
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
            <p className="text-body leading-relaxed text-sm max-w-3xl">
              {expanded || !isLong
                ? apod.explanation
                : apod.explanation.slice(0, shortLen) + "…"}
            </p>

            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 text-sm text-primary hover:underline font-medium transition-colors"
              >
                {expanded ? t("show_less") : t("show_more")}
              </button>
            )}

            {/* Official link — always shown at the bottom */}
            <div className="mt-6 pt-5 border-t border-card-border flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-faint font-mono">NASA · APOD</span>
              <a
                href="https://apod.nasa.gov/apod/astropix.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors border border-card-border bg-card hover:bg-white px-3 py-1.5 rounded-lg"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                {t("official_archive")}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
