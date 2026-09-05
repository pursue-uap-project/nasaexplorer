"use client";

/**
 * Buscador del portal.
 *
 * Se llamaba «unificado» pero solo miraba en `MISSIONS`: 19 fichas. Buscar
 * «Glenn», «TESS» o «Starlink» no devolvía nada aunque las tres cosas
 * estuvieran escritas en el sitio. Y el filtro ofrecía dos botones, «todo» y
 * «NASA», que devolvían exactamente lo mismo.
 *
 * Ahora indexa las seis fuentes que hay (`src/lib/search-index.ts`) y los
 * filtros son por tipo, con su recuento. El índice se construye en memoria a
 * partir de datos estáticos u horneados, así que no hay ninguna petición.
 */

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { performUnifiedSearch } from "@/lib/fuzzy";
import { buildSearchIndex, type SearchKind } from "@/lib/search-index";

interface SearchClientProps {
  locale: "en" | "es";
}

/** Orden de los filtros; el color distingue el tipo de un vistazo. */
const TIPOS: { kind: SearchKind; tono: string }[] = [
  { kind: "mission", tono: "text-sky-300 bg-sky-500/12 ring-sky-500/30" },
  { kind: "active", tono: "text-emerald-300 bg-emerald-500/12 ring-emerald-500/30" },
  { kind: "astronaut", tono: "text-amber-300 bg-amber-500/12 ring-amber-500/30" },
  { kind: "launch", tono: "text-indigo-300 bg-indigo-500/12 ring-indigo-500/30" },
  { kind: "exoplanet", tono: "text-fuchsia-300 bg-fuchsia-500/12 ring-fuchsia-500/30" },
  { kind: "section", tono: "text-white/70 bg-white/10 ring-white/20" },
];

const TONO = Object.fromEntries(TIPOS.map((t) => [t.kind, t.tono])) as Record<SearchKind, string>;

export default function SearchClient({ locale }: SearchClientProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [filtro, setFiltro] = useState<SearchKind | null>(null);

  // El índice no depende de la consulta: se construye una vez por idioma.
  const docs = useMemo(() => buildSearchIndex(locale), [locale]);

  // Refleja la consulta en la URL, para poder compartir una búsqueda.
  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (query.trim()) params.set("q", query);
      else params.delete("q");
      const qs = params.toString();
      router.replace(`/${locale}/search${qs ? `?${qs}` : ""}`);
    }, 300);
    return () => clearTimeout(id);
  }, [query, router, locale]);

  // Navegación atrás/adelante: la URL manda. Va en un timeout porque
  // `react-hooks/set-state-in-effect` marca el setState síncrono y el CI del
  // monorepo trata los warnings como fatales.
  useEffect(() => {
    const id = setTimeout(() => setQuery((actual) => (actual === urlQuery ? actual : urlQuery)), 0);
    return () => clearTimeout(id);
  }, [urlQuery]);

  const todos = useMemo(() => performUnifiedSearch(query, docs), [query, docs]);
  const resultados = useMemo(
    () => (filtro ? todos.filter((r) => r.kind === filtro) : todos),
    [todos, filtro],
  );

  const recuentos = useMemo(() => {
    const acc = {} as Record<SearchKind, number>;
    for (const r of todos) acc[r.kind] = (acc[r.kind] ?? 0) + 1;
    return acc;
  }, [todos]);

  const conConsulta = query.trim().length >= 2;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-white/55">{t("subtitle")}</p>
      </header>

      {/* ── Campo de búsqueda ── */}
      <div className="rounded-lg border border-white/12 bg-surface-dark focus-within:border-white/35">
        <div className="flex items-center gap-3 px-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5 shrink-0 text-white/40"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("title")}
            autoComplete="off"
            className="w-full border-0 bg-transparent py-3.5 text-base text-white outline-hidden placeholder:text-white/35"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("clear")}
              className="rounded p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden>
                <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 font-mono text-2xs uppercase tracking-[0.16em] text-white/35">
        {t("index_hint", { total: docs.length })}
      </p>

      {/* ── Filtros por tipo ── */}
      {conConsulta && (
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-white/10 pb-5">
          <button
            type="button"
            onClick={() => setFiltro(null)}
            aria-pressed={filtro === null}
            className={`rounded px-3 py-1.5 font-mono text-2xs uppercase tracking-wider ring-1 ring-inset transition ${
              filtro === null ? "bg-white text-background ring-white" : "text-white/60 ring-white/15 hover:text-white"
            }`}
          >
            {t("all")} ({todos.length})
          </button>

          {TIPOS.filter(({ kind }) => recuentos[kind]).map(({ kind, tono }) => (
            <button
              key={kind}
              type="button"
              onClick={() => setFiltro(filtro === kind ? null : kind)}
              aria-pressed={filtro === kind}
              className={`rounded px-3 py-1.5 font-mono text-2xs uppercase tracking-wider ring-1 ring-inset transition ${
                filtro === kind ? tono : "text-white/60 ring-white/15 hover:text-white"
              }`}
            >
              {t(`kind_${kind}`)} ({recuentos[kind]})
            </button>
          ))}
        </div>
      )}

      {/* ── Resultados ── */}
      <div className="mt-6">
        {!conConsulta ? (
          <p className="rounded-lg border border-dashed border-white/12 px-6 py-14 text-center text-sm text-white/40">
            {t("empty_prompt")}
          </p>
        ) : resultados.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/12 px-6 py-14 text-center text-sm text-white/40">
            {t("no_results", { query })}
          </p>
        ) : (
          <ul className="space-y-2">
            {resultados.map((r) => (
              <li key={`${r.kind}-${r.id}`}>
                <Link
                  href={r.url}
                  className="group block rounded-lg border border-white/10 bg-surface-dark p-4 transition hover:border-white/30 hover:bg-surface-dark-hi"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider ring-1 ring-inset ${TONO[r.kind]}`}
                    >
                      {t(`kind_${r.kind}`)}
                    </span>
                    <h2 className="font-semibold text-white group-hover:underline group-hover:underline-offset-4">
                      {r.title}
                    </h2>
                    <span className="text-sm text-white/45">{r.subtitle}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/60">
                    {r.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
