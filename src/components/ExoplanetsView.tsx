"use client";

/**
 * Página de exoplanetas: el reparto completo por método, la curva por año y la
 * tabla de los últimos confirmados.
 *
 * Todo sale de `src/data/exoplanets.json`, que hornea el cron. Nada se pide en
 * vivo: el NASA Exoplanet Archive no manda CORS.
 */

import { useFormatter, useTranslations } from "next-intl";
import exoplanetas from "@/data/exoplanets.json";

const METODO_ES: Record<string, string> = {
  Transit: "Tránsito",
  "Radial Velocity": "Velocidad radial",
  Microlensing: "Microlente gravitatoria",
  Imaging: "Imagen directa",
  "Transit Timing Variations": "Variación del tiempo de tránsito",
  "Eclipse Timing Variations": "Variación del tiempo de eclipse",
  "Orbital Brightness Modulation": "Modulación de brillo orbital",
  "Pulsar Timing": "Cronometría de púlsar",
  Astrometry: "Astrometría",
  "Pulsation Timing Variations": "Variación de pulsaciones",
  "Disk Kinematics": "Cinemática del disco",
};

/** Radio en radios terrestres → familia. Los cortes son los que usa la NASA. */
function familia(radioTierras: number | null) {
  if (radioTierras == null) return null;
  if (radioTierras < 1.6) return "rocoso";
  if (radioTierras < 4) return "superTierra";
  if (radioTierras < 10) return "neptuniano";
  return "gigante";
}

export default function ExoplanetsView({ locale }: { locale: string }) {
  const t = useTranslations("exoplanets");
  const format = useFormatter();
  const es = locale === "es";
  const nombreMetodo = (m: string) => (es ? METODO_ES[m] ?? m : m);

  const { total, esteAnio, anio, metodos, porAnio, recientes } = exoplanetas;
  const maxMetodo = metodos[0]?.n ?? 1;
  const maxAnio = Math.max(...porAnio.map((a) => a.n), 1);

  return (
    <div className="space-y-14">
      {/* ── Cifra principal ── */}
      <section>
        <p className="font-mono text-6xl font-black tabular-nums text-white sm:text-7xl">
          {format.number(total)}
        </p>
        <p className="mt-3 max-w-2xl text-lg text-white/70">{t("lede", { anio, esteAnio })}</p>
      </section>

      {/* ── Métodos ── */}
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          {t("methods_title")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">{t("methods_note")}</p>

        <dl className="mt-6 space-y-4">
          {metodos.map(({ metodo, n }) => (
            <div key={metodo}>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-sm text-white/80">{nombreMetodo(metodo)}</dt>
                <dd className="font-mono text-sm tabular-nums text-white/60">
                  {format.number(n)}
                  <span className="ml-2 text-white/35">
                    {((n / total) * 100).toFixed(1)}%
                  </span>
                </dd>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-400/70"
                  style={{ width: `${Math.max(0.6, (n / maxMetodo) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Por año ── */}
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          {t("per_year_title")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">{t("per_year_note", { anio })}</p>

        <ul className="mt-6 flex items-end gap-1.5 overflow-x-auto pb-2 sm:gap-2">
          {[...porAnio].reverse().map(({ anio: a, n }) => (
            <li key={a} className="flex min-w-9 flex-1 flex-col items-center gap-2">
              <span className="font-mono text-2xs tabular-nums text-white/45">{n}</span>
              <div
                className={`w-full rounded-t ${a === anio ? "bg-cyan-400/80" : "bg-white/20"}`}
                style={{ height: `${Math.max(4, (n / maxAnio) * 140)}px` }}
                role="presentation"
              />
              <span className="font-mono text-2xs tabular-nums text-white/35">
                {String(a).slice(2)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Últimos ── */}
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          {t("recent_title", { anio })}
        </h2>

        <div className="mt-6 overflow-x-auto rounded-xl border border-white/12">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/12 text-left font-mono text-2xs uppercase tracking-wider text-white/40">
                <th scope="col" className="px-4 py-3 font-medium">{t("col_planet")}</th>
                <th scope="col" className="px-4 py-3 font-medium">{t("col_method")}</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">{t("col_distance")}</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">{t("col_radius")}</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">{t("col_period")}</th>
              </tr>
            </thead>
            <tbody>
              {recientes.map((p) => {
                const fam = familia(p.radioTierras);
                return (
                  <tr key={p.nombre} className="border-b border-white/8 last:border-b-0">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white">{p.nombre}</span>
                      <span className="ml-2 text-white/40">{p.instalacion}</span>
                    </td>
                    <td className="px-4 py-3 text-white/70">{nombreMetodo(p.metodo)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-white/70">
                      {p.distanciaAl == null ? "—" : `${format.number(p.distanciaAl)} ${t("ly")}`}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-white/70">
                      {p.radioTierras == null ? (
                        "—"
                      ) : (
                        <>
                          {p.radioTierras}
                          {fam && <span className="ml-2 text-white/40">{t(`family_${fam}`)}</span>}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-white/70">
                      {p.periodoDias == null ? "—" : `${format.number(p.periodoDias)} d`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-white/40">{t("recent_note")}</p>
      </section>

      <p className="border-t border-white/10 pt-6 font-mono text-2xs uppercase tracking-[0.16em] text-white/35">
        <a
          href="https://exoplanetarchive.ipac.caltech.edu/"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-white/20 underline-offset-4 hover:text-white/60"
        >
          NASA Exoplanet Archive
        </a>{" "}
        · {t("source_note")} ·{" "}
        {format.dateTime(new Date(exoplanetas.checkedAt), { dateStyle: "long" })}
      </p>
    </div>
  );
}
