"use client";

/**
 * Exoplanetas confirmados.
 *
 * Es la pata que le faltaba al sitio: contaba **qué despega** y **qué opera**,
 * pero no **qué se ha encontrado**. Y es la única cifra del portal que crece
 * sola sin que nadie la toque, así que es la que mejor sostiene el argumento de
 * «datos reales, con la fuente al lado».
 *
 * Sale horneada del cron, no en vivo: el NASA Exoplanet Archive no manda CORS
 * (comprobado con `Origin:` puesto), así que el navegador bloquearía la
 * petición. Mismo caso que los directos de YouTube.
 */

import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import exoplanetas from "@/data/exoplanets.json";
import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number";

/** Los métodos vienen en inglés desde el archivo; se traducen los frecuentes. */
const METODO_ES: Record<string, string> = {
  Transit: "Tránsito",
  "Radial Velocity": "Velocidad radial",
  Microlensing: "Microlente gravitatoria",
  Imaging: "Imagen directa",
  "Transit Timing Variations": "Variación de tránsitos",
};

export default function HomeExoplanets() {
  const t = useTranslations("home");
  const format = useFormatter();

  const { total, esteAnio, anio, metodos, recientes } = exoplanetas;
  const principales = metodos.slice(0, 4);
  const mayor = principales[0]?.n ?? 1;

  return (
    <section className="border-y border-white/10 bg-background-deep">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.22em] text-on-dark-faint">
              {t("exo_eyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-on-dark sm:text-3xl">
              {t("exo_title")}
            </h2>
          </div>
          <Link
            href="/exoplanets"
            className="text-sm font-semibold text-on-dark-muted underline decoration-white/25 underline-offset-4 transition hover:text-on-dark hover:decoration-white"
          >
            {t("exo_all")}
          </Link>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* ── Cifra y reparto por método ── */}
          <div>
            <p className="font-mono text-5xl font-black tabular-nums text-on-dark sm:text-6xl">
              <CountingNumber number={total} inView />
            </p>
            <p className="mt-2 text-on-dark-muted">
              {t("exo_lede", { anio, esteAnio })}
            </p>

            <dl className="mt-8 space-y-3">
              {principales.map(({ metodo, n }) => (
                <div key={metodo} className="grid grid-cols-[1fr_auto] items-baseline gap-x-3">
                  <dt className="text-sm text-on-dark-muted">{METODO_ES[metodo] ?? metodo}</dt>
                  <dd className="font-mono text-sm tabular-nums text-on-dark">
                    {format.number(n)}
                  </dd>
                  <div
                    className="col-span-2 h-1 rounded-full bg-white/12"
                    role="presentation"
                  >
                    <div
                      className="h-full rounded-full bg-cyan-400/70"
                      style={{ width: `${Math.max(2, (n / mayor) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* ── Últimos confirmados ── */}
          <div>
            <h3 className="font-mono text-2xs uppercase tracking-[0.18em] text-on-dark-faint">
              {t("exo_recent", { anio })}
            </h3>
            <ul className="mt-4 overflow-hidden rounded-lg border border-white/12 bg-surface-dark">
              {recientes.slice(0, 5).map((p) => (
                <li
                  key={p.nombre}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-t border-white/10 px-4 py-3 first:border-t-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-on-dark">{p.nombre}</p>
                    <p className="truncate text-sm text-on-dark-muted">
                      {METODO_ES[p.metodo] ?? p.metodo} · {p.instalacion}
                    </p>
                  </div>
                  {p.distanciaAl != null && (
                    <span className="whitespace-nowrap font-mono text-sm tabular-nums text-on-dark-muted">
                      {format.number(p.distanciaAl)} {t("exo_ly")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 font-mono text-2xs uppercase tracking-[0.16em] text-on-dark-faint">
          <a
            href="https://exoplanetarchive.ipac.caltech.edu/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-on-dark-muted"
          >
            NASA Exoplanet Archive
          </a>{" "}
          · {format.dateTime(new Date(exoplanetas.checkedAt), { dateStyle: "medium" })}
        </p>
      </div>
    </section>
  );
}
