/**
 * Navegación al pie de una ficha de misión.
 *
 * Desde una ficha solo se podía volver al listado: no había forma de saltar a
 * la misión siguiente ni de ver las hermanas del mismo programa. Con 25 fichas
 * ordenadas por fecha y agrupadas por programa, eso era desaprovechar la única
 * estructura que el catálogo ya tiene.
 *
 * El orden es cronológico, que es como se entiende un programa espacial: la
 * anterior es la que despegó antes, no la de al lado en el array.
 */

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Icon from "@/components/Icon";
import { nombrePrograma } from "@/lib/labels";
import { PROGRAM_COLORS, type Mission } from "@/lib/nasa";

type Props = { actual: Mission; todas: Mission[] };

/**
 * Secciones del sitio que tienen que ver con cada programa.
 *
 * Las fichas eran callejones sin salida hacia el resto del portal: una misión a
 * Júpiter no enlazaba al simulador del Sistema Solar y la ISS no enlazaba a su
 * propio tracker en vivo, teniendo las dos cosas en el sitio.
 */
const RELACIONADAS: Record<string, { href: string; key: string }[]> = {
  ISS: [
    { href: "/iss", key: "iss" },
    { href: "/live", key: "live" },
  ],
  Mars: [
    { href: "/active", key: "active" },
    { href: "/solar", key: "solar" },
  ],
  "Deep Space": [
    { href: "/solar", key: "solar" },
    { href: "/exoplanets", key: "exoplanets" },
  ],
  JWST: [
    { href: "/exoplanets", key: "exoplanets" },
    { href: "/apod", key: "apod" },
  ],
  Hubble: [{ href: "/apod", key: "apod" }],
  Artemis: [
    { href: "/launches", key: "launches" },
    { href: "/active", key: "active" },
  ],
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function MissionNav({ actual, todas }: Props) {
  const t = useTranslations("mission_detail");
  const tPrograma = useTranslations("mission_program");
  const tNav = useTranslations("nav");
  const locale = useLocale() === "es" ? "es" : "en";

  const cronologicas = [...todas].sort((a, b) =>
    a.launch_details.date.localeCompare(b.launch_details.date),
  );
  const i = cronologicas.findIndex((m) => m.id === actual.id);
  const anterior = i > 0 ? cronologicas[i - 1] : null;
  const siguiente = i >= 0 && i < cronologicas.length - 1 ? cronologicas[i + 1] : null;

  const hermanas = cronologicas.filter(
    (m) => m.program === actual.program && m.id !== actual.id,
  );

  const color = PROGRAM_COLORS[actual.program] ?? "#0B3D91";
  const relacionadas = RELACIONADAS[actual.program] ?? [];

  return (
    <nav aria-label={t("more_missions")} className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
      {/* ── Anterior / siguiente ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {anterior ? (
          <Link
            href={`/missions/${anterior.id}`}
            className="group flex items-center gap-3 rounded-lg border border-white/12 bg-surface-dark p-4 transition hover:border-white/30"
          >
            <Icon name="arrowRight" className="h-4 w-4 rotate-180 shrink-0 text-white/40" />
            <span className="min-w-0">
              <span className="block font-mono text-2xs uppercase tracking-[0.16em] text-white/40">
                {t("previous_mission")}
              </span>
              <span className="block truncate font-semibold text-white group-hover:underline">
                {anterior.name}
              </span>
            </span>
            <span className="ml-auto shrink-0 font-mono text-xs text-white/35">
              {anterior.launch_details.date.slice(0, 4)}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {siguiente && (
          <Link
            href={`/missions/${siguiente.id}`}
            className="group flex items-center gap-3 rounded-lg border border-white/12 bg-surface-dark p-4 text-right transition hover:border-white/30 sm:justify-end"
          >
            <span className="shrink-0 font-mono text-xs text-white/35">
              {siguiente.launch_details.date.slice(0, 4)}
            </span>
            <span className="ml-auto min-w-0 sm:ml-0">
              <span className="block font-mono text-2xs uppercase tracking-[0.16em] text-white/40">
                {t("next_mission")}
              </span>
              <span className="block truncate font-semibold text-white group-hover:underline">
                {siguiente.name}
              </span>
            </span>
            <Icon name="arrowRight" className="h-4 w-4 shrink-0 text-white/40" />
          </Link>
        )}
      </div>

      {/* ── Otras del mismo programa ── */}
      {hermanas.length > 0 && (
        <section className="mt-10">
          <h2 className="font-mono text-2xs uppercase tracking-[0.2em] text-white/40">
            {t("same_program", { program: nombrePrograma(tPrograma, actual.program) })}
          </h2>

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {hermanas.slice(0, 4).map((m) => (
              <li key={m.id}>
                <Link
                  href={`/missions/${m.id}`}
                  className="group block overflow-hidden rounded-lg border border-white/12 bg-surface-dark transition hover:border-white/30"
                >
                  <span className="block aspect-16/10 overflow-hidden bg-black">
                    {m.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${BASE}/${m.image}`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    )}
                  </span>
                  <span className="block p-3">
                    <span className="block truncate text-sm font-semibold text-white">{m.name}</span>
                    <span className="mt-0.5 block font-mono text-2xs text-white/40">
                      {m.launch_details.date.slice(0, 4)} · {m.description[locale].split(".")[0].slice(0, 40)}…
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-4">
            <Link
              href={`/missions?program=${encodeURIComponent(actual.program)}`}
              className="font-mono text-2xs uppercase tracking-[0.16em] underline decoration-white/25 underline-offset-4 hover:decoration-white"
              style={{ color }}
            >
              {t("see_all_program", { program: nombrePrograma(tPrograma, actual.program) })}
            </Link>
          </p>
        </section>
      )}
      {/* ── Secciones relacionadas ── */}
      {relacionadas.length > 0 && (
        <section className="mt-10 border-t border-white/10 pt-6">
          <h2 className="font-mono text-2xs uppercase tracking-[0.2em] text-white/40">
            {t("keep_exploring")}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {relacionadas.map(({ href, key }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-3.5 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  {tNav(key)}
                  <Icon name="arrowRight" className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </nav>
  );
}
