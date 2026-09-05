"use client";

/**
 * Las cuatro misiones en curso, con foto real del archivo NASA.
 *
 * Sustituye a los tres contadores redondeados de la portada anterior
 * («300+ misiones · 65+ años · 10+ programas»), que no eran datos: eran
 * adornos. Aquí cada tarjeta lleva la fecha de inicio y el estado que ya
 * documenta `ACTIVE_MISSIONS`, y enlaza a su ficha con ancla.
 */

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ACTIVE_MISSIONS } from "@/lib/nasa";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const CARD_PHOTO: Record<string, string> = {
  artemis: `${BASE}/assets/artemis-hero.webp`,
  jwst: `${BASE}/assets/jwst-hero.webp`,
  perseverance: `${BASE}/assets/perseverance-hero.webp`,
  iss: `${BASE}/assets/iss-hero.webp`,
};

export default function HomeMissionGrid() {
  const t = useTranslations("home");
  const locale = useLocale() as "en" | "es";

  return (
    <section className="border-y border-white/10 bg-background-deep">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.22em] text-on-dark-faint">
              {t("missions_eyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-on-dark sm:text-3xl">
              {t("missions_title")}
            </h2>
          </div>
          <Link
            href="/active"
            className="text-sm font-semibold text-on-dark-muted underline decoration-white/25 underline-offset-4 transition hover:text-on-dark hover:decoration-white"
          >
            {t("missions_all")}
          </Link>
        </header>

        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIVE_MISSIONS.map((m) => (
            <li key={m.id}>
              <Link
                href={`/active#mission-${m.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/12 bg-surface-dark transition hover:border-white/30"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={CARD_PHOTO[m.id]}
                    alt={m.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <span
                    className="absolute left-3 top-3 rounded px-2 py-0.5 font-mono text-2xs font-bold uppercase tracking-wider text-white"
                    style={{ background: m.color }}
                  >
                    {m.program}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-on-dark">{m.name}</h3>
                  <p className="mt-1 text-sm text-on-dark-muted">{m.tagline[locale]}</p>
                  <p className="mt-4 border-t border-white/10 pt-3 font-mono text-2xs uppercase tracking-[0.14em] text-on-dark-faint">
                    {m.since ?? m.status?.[locale] ?? ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
