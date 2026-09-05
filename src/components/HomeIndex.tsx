"use client";

/**
 * Índice de secciones + procedencia de los datos.
 *
 * La portada anterior solo enlazaba a dos sitios (/missions y /iss) desde el
 * último fotograma del scroll: las otras seis secciones existían pero no había
 * forma de llegar a ellas salvo la barra de navegación. Aquí se listan todas,
 * cada una con lo que realmente contiene.
 *
 * El bloque de fuentes no es decorativo: es lo que separa este sitio de una
 * página de adornos espaciales. Dice de dónde sale cada dato y cada cuánto se
 * refresca, y enlaza a la API original para que se pueda comprobar.
 */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const SECTIONS = [
  { href: "/missions", key: "missions" },
  { href: "/launches", key: "launches" },
  { href: "/active", key: "active" },
  { href: "/solar", key: "solar" },
  { href: "/exoplanets", key: "exoplanets" },
  { href: "/iss", key: "iss" },
  { href: "/live", key: "live" },
  { href: "/apod", key: "apod" },
  { href: "/search", key: "search" },
] as const;

const SOURCES = [
  { name: "NASA Open APIs", url: "https://api.nasa.gov/", key: "nasa" },
  { name: "NASA Image and Video Library", url: "https://images.nasa.gov/", key: "images" },
  { name: "Launch Library 2", url: "https://thespacedevs.com/llapi", key: "ll2" },
  { name: "Open Notify · ISS", url: "http://open-notify.org/", key: "iss" },
] as const;

export default function HomeIndex() {
  const t = useTranslations("home");

  return (
    <section className="border-t border-white/10 bg-background-deep">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="font-mono text-2xs uppercase tracking-[0.22em] text-on-dark-faint">
          {t("index_eyebrow")}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-on-dark sm:text-3xl">
          {t("index_title")}
        </h2>

        <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/12 bg-white/12 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map(({ href, key }) => (
            <li key={href} className="bg-surface-dark">
              <Link href={href} className="group flex h-full flex-col p-5 transition hover:bg-surface-dark-hi">
                <h3 className="font-bold text-on-dark group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                  {t(`index_${key}_title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-on-dark-muted">
                  {t(`index_${key}_text`)}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Procedencia ── */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <h3 className="font-mono text-2xs uppercase tracking-[0.22em] text-on-dark-faint">
            {t("sources_title")}
          </h3>
          <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {SOURCES.map((s) => (
              <li key={s.name} className="text-sm">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-on-dark underline decoration-white/25 underline-offset-4 hover:decoration-white"
                >
                  {s.name}
                </a>
                <span className="text-on-dark-muted"> — {t(`sources_${s.key}`)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-on-dark-faint">
            {t("sources_note")}
          </p>
        </div>
      </div>
    </section>
  );
}
