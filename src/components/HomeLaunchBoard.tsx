"use client";

/**
 * Tablero de próximos lanzamientos de la portada.
 *
 * Es lo primero que hay bajo el hero a propósito: es el único dato de la web
 * que cambia cada día, así que es lo que justifica volver. Sale de Launch
 * Library 2 (que manda CORS, así que se refresca en cada visita) sobre la
 * instantánea horneada por el cron, que es lo que se pinta en el primer frame.
 */

import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useLaunchFeed } from "@/lib/use-launch-feed";
import { statusTone, type Launch } from "@/lib/launches";

function Row({ launch }: { launch: Launch }) {
  const format = useFormatter();
  const tone = statusTone(launch);
  const net = new Date(launch.net);

  return (
    <li className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1 border-t border-white/10 px-5 py-4 transition hover:bg-white/4 sm:grid-cols-[7.5rem_1fr_auto]">
      <time
        dateTime={launch.net}
        className="font-mono text-sm tabular-nums text-on-dark-muted"
        title={format.dateTime(net, { dateStyle: "full", timeStyle: "short" })}
      >
        {format.dateTime(net, { day: "2-digit", month: "short" })}
        <span className="ml-2 text-on-dark-faint">
          {format.dateTime(net, { hour: "2-digit", minute: "2-digit" })}
        </span>
      </time>

      <div className="col-span-2 min-w-0 sm:col-span-1">
        <p className="truncate font-semibold text-on-dark">{launch.mission?.name ?? launch.name}</p>
        <p className="truncate text-sm text-on-dark-muted">
          {[launch.rocket, launch.provider, launch.location].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* En móvil la insignia se coloca a la derecha de la fecha (fila 1) para que
          el título pueda ocupar el ancho completo debajo. */}
      <span
        className={`col-start-2 row-start-1 justify-self-end rounded px-2 py-0.5 font-mono text-2xs uppercase tracking-wider sm:col-start-auto sm:row-start-auto ${tone.text} ${tone.bg} ${tone.ring} ring-1 ring-inset`}
      >
        {launch.status.abbrev ?? "TBD"}
      </span>
    </li>
  );
}

export default function HomeLaunchBoard() {
  const t = useTranslations("home");
  const format = useFormatter();
  const { feed, live, upcoming } = useLaunchFeed();

  const rows = upcoming.slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-2xs uppercase tracking-[0.22em] text-on-dark-faint">
            {t("board_eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-on-dark sm:text-3xl">
            {t("board_title")}
          </h2>
        </div>
        <Link
          href="/launches"
          className="text-sm font-semibold text-on-dark-muted underline decoration-white/25 underline-offset-4 transition hover:text-on-dark hover:decoration-white"
        >
          {t("board_all")}
        </Link>
      </header>

      <div className="mt-6 overflow-hidden rounded-lg border border-white/12 bg-surface-dark">
        <ul>
          {rows.length > 0 ? (
            rows.map((l) => <Row key={l.id} launch={l} />)
          ) : (
            <li className="px-5 py-8 text-center text-sm text-on-dark-muted">{t("board_empty")}</li>
          )}
        </ul>
      </div>

      <p className="mt-3 font-mono text-2xs uppercase tracking-[0.16em] text-on-dark-faint">
        {live ? t("board_source_live") : t("board_source_cached")} ·{" "}
        {format.dateTime(new Date(feed.checkedAt), { dateStyle: "medium", timeStyle: "short" })}
      </p>
    </section>
  );
}
