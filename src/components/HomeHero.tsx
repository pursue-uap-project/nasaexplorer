"use client";

/**
 * Hero de la portada.
 *
 * La versión anterior era un vídeo de 12 MB generado a partir de una imagen de
 * IA: un transbordador inventado rotulado «STARGAZER» con el logotipo de la NASA
 * encima. En un portal cuyo argumento es «datos reales de la NASA», una foto
 * falsa en la primera pantalla desmiente todo lo que viene detrás. Ahora es una
 * fotografía real del archivo público (JWST, NGC 3324), acreditada y enlazada a
 * su ficha, servida en WebP: 336 KB frente a 12,8 MB.
 *
 * El hero además ya no es la página entera. Antes la portada era solo este
 * bloque con scroll-scrubbing y tres contadores redondos («300+ misiones»);
 * ahora es una entrada a datos reales y el contenido vive debajo.
 */

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useLaunchFeed } from "@/lib/use-launch-feed";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** T− en vivo. Devuelve el guion hasta que corre el efecto (evita hidratación rota). */
function Countdown({ target }: { target: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(new Date(target).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (left === null) return <span className="tabular-nums text-on-dark-faint">T− ––:––:––</span>;

  const past = left <= 0;
  const abs = Math.abs(left);
  const d = Math.floor(abs / 86400000);
  const h = Math.floor((abs % 86400000) / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  const s = Math.floor((abs % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span className="tabular-nums text-on-dark">
      {past ? "T+ " : "T− "}
      {d > 0 && `${d}d `}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

export default function HomeHero() {
  const t = useTranslations("home");
  const format = useFormatter();
  const { feed, live, upcoming } = useLaunchFeed();

  const next = upcoming[0] ?? null;

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10">
      {/* ── Fotografía real del archivo NASA ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE}/assets/hero-carina-1920.webp`}
        srcSet={`${BASE}/assets/hero-carina-1024.webp 1024w, ${BASE}/assets/hero-carina-1920.webp 1920w`}
        sizes="100vw"
        alt={t("hero_photo_alt")}
        width={1920}
        height={1111}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      {/* Velo direccional: opaco donde va el texto (izquierda) y casi limpio a la
          derecha, para que la fotografía se vea. Un velo plano sobre toda la
          imagen la apagaba entera y dejaba el hero en un degradado azul. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-background from-15% via-background/85 to-background/30" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-background via-transparent to-background/25" />

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 sm:pt-24 sm:pb-14">
        <div className="max-w-3xl">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-2xs uppercase tracking-[0.22em] text-on-dark-muted">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400" : "bg-amber-400"}`}
                aria-hidden
              />
              {live ? t("hero_eyebrow_live") : t("hero_eyebrow_cached")}
            </span>
            <span className="text-on-dark-faint" aria-hidden>
              /
            </span>
            <span className="text-on-dark-faint">
              {t("hero_eyebrow_sources")}
            </span>
          </p>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-on-dark sm:text-6xl">
            {t("hero_title_line1")}
            <span className="block text-on-dark-muted">{t("hero_title_line2")}</span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-dark-muted">
            {t("hero_lede")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/launches"
              className="rounded-md bg-on-dark px-5 py-3 text-sm font-bold tracking-[0.02em] text-background transition hover:bg-white"
            >
              {t("hero_cta_primary")}
            </Link>
            <Link
              href="/missions"
              className="rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-on-dark transition hover:border-white/50 hover:bg-white/5"
            >
              {t("hero_cta_secondary")}
            </Link>
          </div>
        </div>

        {/* ── Barra de telemetría: tres datos reales, no tres contadores redondos ── */}
        <dl className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/12 bg-white/12 sm:mt-16 sm:grid-cols-3">
          <div className="bg-surface-dark px-5 py-4">
            <dt className="font-mono text-2xs uppercase tracking-[0.18em] text-on-dark-faint">
              {t("telemetry_next_launch")}
            </dt>
            <dd className="mt-2 font-mono text-lg font-semibold">
              {next ? <Countdown target={next.net} /> : <span className="text-on-dark-faint">—</span>}
            </dd>
            <dd className="mt-1 truncate text-sm text-on-dark-muted">
              {next ? next.name : t("telemetry_no_launch")}
            </dd>
          </div>

          <div className="bg-surface-dark px-5 py-4">
            <dt className="font-mono text-2xs uppercase tracking-[0.18em] text-on-dark-faint">
              {t("telemetry_orbit")}
            </dt>
            <dd className="mt-2 font-mono text-lg font-semibold tabular-nums text-on-dark">27 600 km/h</dd>
            <dd className="mt-1 text-sm text-on-dark-muted">
              <Link href="/iss" className="underline decoration-white/25 underline-offset-4 hover:decoration-white">
                {t("telemetry_orbit_detail")}
              </Link>
            </dd>
          </div>

          <div className="bg-surface-dark px-5 py-4">
            <dt className="font-mono text-2xs uppercase tracking-[0.18em] text-on-dark-faint">
              {t("telemetry_updated")}
            </dt>
            <dd className="mt-2 font-mono text-lg font-semibold tabular-nums text-on-dark">
              {format.dateTime(new Date(feed.checkedAt), { day: "2-digit", month: "short" })}
            </dd>
            <dd className="mt-1 truncate text-sm text-on-dark-muted">{feed.source ?? "Launch Library 2"}</dd>
          </div>
        </dl>
      </div>

      {/* Crédito de la fotografía. Va en el hero, no en el pie: es parte del argumento. */}
      <p className="pointer-events-none absolute bottom-2 right-3 hidden font-mono text-2xs text-on-dark-faint sm:block">
        <a
          href="https://images.nasa.gov/details/carina_nebula"
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto hover:text-on-dark-muted"
        >
          {t("hero_photo_credit")}
        </a>
      </p>
    </section>
  );
}
