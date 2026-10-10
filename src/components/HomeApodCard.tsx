"use client";

/**
 * Imagen astronómica del día.
 *
 * Arranca con la foto que hornea `scripts/sync-space-data.mjs` en
 * `src/data/apod.json`, así que la tarjeta pinta contenido real en el primer
 * render —también para un rastreador, que no ejecuta el efecto—. Después
 * intenta la API en vivo y, si contesta, sustituye el dato horneado.
 *
 * Por qué no basta con pedirla en vivo: la API puede fallar o tardar, y el
 * dato horneado garantiza que la tarjeta nunca enseña «no se ha podido cargar».
 * Desde 2026-09-29 la fuente es el WordPress de science.nasa.gov (ver
 * `src/lib/apod-fuente.ts`): api.nasa.gov devolvía un relleno con el logo.
 *
 * `media_type` puede ser `video`. La API nueva no da la URL del vídeo, solo un
 * fotograma (y a veces ni eso), así que la tarjeta pinta el fotograma si lo hay
 * y un botón a la página del día en science.nasa.gov, que es donde se ve.
 */

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import horneada from "@/data/apod.json";
import { paginaApod } from "@/lib/apod-dates";
import { normalizarApod, urlApod } from "@/lib/apod-fuente";

type Apod = {
  title: string;
  explanation: string;
  date: string;
  url: string | null;
  hdurl?: string;
  media_type: "image" | "video";
  copyright?: string;
  pageUrl?: string;
};


export default function HomeApodCard() {
  const t = useTranslations("home");
  const format = useFormatter();
  // El JSON horneado tiene la misma forma que la respuesta de la API, salvo que
  // sus campos opcionales llegan como `null` en vez de ausentes.
  const semilla: Apod | null = horneada?.title
    ? {
        title: horneada.title,
        explanation: horneada.explanation,
        date: horneada.date,
        url: horneada.url ?? null,
        hdurl: horneada.hdurl ?? undefined,
        media_type: horneada.media_type === "video" ? "video" : "image",
        copyright: horneada.copyright ?? undefined,
        pageUrl: horneada.pageUrl ?? undefined,
      }
    : null;

  const [apod, setApod] = useState<Apod | null>(semilla);

  useEffect(() => {
    let alive = true;
    fetch(urlApod())
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((crudo: unknown) => {
        const d = normalizarApod(crudo);
        if (!alive) return;
        // Una imagen sin foto no mejora lo horneado: se queda lo que hay.
        if (d.media_type === "image" && !d.url) return;
        setApod({ ...d, hdurl: d.hdurl ?? undefined, copyright: d.copyright ?? undefined });
      })
      // Un fallo aquí no se pinta: se queda la foto horneada.
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div className="overflow-hidden rounded-lg border border-white/12 bg-surface-dark">
          <div className="relative aspect-16/9 bg-black">
            {apod?.media_type === "image" && apod.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={apod.url}
                alt={apod.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : apod?.media_type === "video" ? (
              <div className="relative h-full w-full">
                {apod.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={apod.url}
                    alt={apod.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover opacity-60"
                  />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <p className="font-mono text-2xs uppercase tracking-[0.2em] text-on-dark-faint">
                    {t("apod_is_video")}
                  </p>
                  <a
                    href={apod.pageUrl ?? paginaApod(apod.date)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-white/25 bg-black/40 px-4 py-2 text-sm font-semibold text-on-dark transition hover:border-white/50 hover:bg-white/10"
                  >
                    {t("apod_watch_on_nasa")} ↗
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center px-6 text-center font-mono text-2xs uppercase tracking-[0.2em] text-on-dark-faint">
                {t("apod_error")}
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.22em] text-on-dark-faint">
            {t("apod_eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-on-dark sm:text-3xl">
            {apod?.title ?? t("apod_title_fallback")}
          </h2>
          {apod && (
            <p className="mt-2 font-mono text-2xs uppercase tracking-[0.16em] text-on-dark-faint">
              {format.dateTime(new Date(`${apod.date}T12:00:00Z`), { dateStyle: "long" })}
              {apod.copyright ? ` · © ${apod.copyright.trim()}` : " · NASA"}
            </p>
          )}
          <p className="mt-4 line-clamp-6 leading-relaxed text-on-dark-muted">
            {apod?.explanation ?? t("apod_lede")}
          </p>
          <Link
            href="/apod"
            className="mt-6 inline-block rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-on-dark transition hover:border-white/50 hover:bg-white/5"
          >
            {t("apod_cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
