"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  BAKED_LAUNCHES,
  fetchLaunches,
  getHighlight,
  isInFlight,
  isRecent,
  statusTone,
  type Launch,
  type LaunchFeed as Feed,
} from "@/lib/launches";

type Tab = "upcoming" | "previous";

/** Cuenta atrás T- para lo que aún no ha despegado. */
function Countdown({ target }: { target: string }) {
  const t = useTranslations("launches");
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(new Date(target).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  // Hasta que corre el efecto, `null`: así el HTML del export estático y el
  // del cliente coinciden y no hay error de hidratación.
  if (left === null) return <span className="font-mono text-white/30">T− ··:··:··</span>;
  if (left <= 0) return <span className="font-mono text-white/50">{t("lifted_off")}</span>;

  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span className="font-mono tabular-nums text-white/85">
      T− {d > 0 && `${d}${t("days_short")} `}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

function LaunchImage({ launch }: { launch: Launch }) {
  const [broken, setBroken] = useState(false);

  if (!launch.image || broken) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-500/20 to-slate-800/40 text-3xl">
        <span aria-hidden>🚀</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={launch.image}
      alt={launch.mission?.name ?? launch.name}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className="h-full w-full object-cover"
    />
  );
}

function StatusBadge({ launch, liveLabel }: { launch: Launch; liveLabel: string }) {
  const tone = statusTone(launch);
  const flying = isInFlight(launch);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset ${tone.bg} ${tone.text} ${tone.ring}`}
    >
      {flying && <span className="onair-dot h-1.5 w-1.5 rounded-full bg-current" />}
      {flying ? liveLabel : launch.status.abbrev ?? launch.status.name ?? "—"}
    </span>
  );
}

// `isPast` llega como prop en vez de calcularse aquí con Date.now(): leer el
// reloj en el cuerpo del render es impuro y, en un export estático, haría que
// el HTML generado y el del navegador no coincidieran (error de hidratación).
function LaunchCard({ launch, isPast }: { launch: Launch; isPast: boolean }) {
  const t = useTranslations("launches");
  const format = useFormatter();
  const [open, setOpen] = useState(false);
  const description = launch.mission?.description;

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/3 transition hover:border-white/20">
      <div className="relative aspect-16/9 overflow-hidden bg-black/40">
        <LaunchImage launch={launch} />
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 to-transparent p-3">
          <StatusBadge launch={launch} liveLabel={t("in_flight")} />
        </div>
        {launch.imageCredit && (
          <span className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-white/60">
            © {launch.imageCredit}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-bold leading-snug text-white">
          {launch.mission?.name ?? launch.name}
        </h3>
        <p className="mt-1 text-xs text-white/45">
          {[launch.provider, launch.rocket].filter(Boolean).join(" · ")}
        </p>

        <dl className="mt-3 space-y-1.5 text-xs">
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 text-white/35">{t("date")}</dt>
            <dd className="text-white/75">
              {format.dateTime(new Date(launch.net), { dateStyle: "medium", timeStyle: "short" })}
            </dd>
          </div>
          {launch.location && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-white/35">{t("pad")}</dt>
              <dd className="min-w-0 text-white/75">{launch.location}</dd>
            </div>
          )}
          {launch.mission?.orbit && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-white/35">{t("orbit")}</dt>
              <dd className="text-white/75">{launch.mission.orbit}</dd>
            </div>
          )}
          {!isPast && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-white/35">{t("countdown")}</dt>
              <dd>
                <Countdown target={launch.net} />
              </dd>
            </div>
          )}
        </dl>

        {description && (
          <>
            <p className={`mt-3 text-xs leading-relaxed text-white/55 ${open ? "" : "line-clamp-3"}`}>
              {description}
            </p>
            <button
              onClick={() => setOpen((v) => !v)}
              className="mt-1.5 text-[11px] font-semibold text-blue-400 transition hover:text-blue-300"
            >
              {open ? t("read_less") : t("read_more")}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

/** Tarjeta grande para lo que está en vuelo o acaba de despegar. */
function Highlight({ launch }: { launch: Launch }) {
  const t = useTranslations("launches");
  const format = useFormatter();
  const flying = isInFlight(launch);

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-[#040D21]/60">
      <div className="live-starfield" aria-hidden />
      <div className="relative z-10 grid gap-0 md:grid-cols-[1.1fr_1fr]">
        <div className="relative aspect-16/9 md:aspect-auto md:min-h-64">
          <LaunchImage launch={launch} />
          <div className="absolute inset-0 bg-linear-to-t from-[#040D21] via-transparent to-transparent md:bg-linear-to-r" />
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge launch={launch} liveLabel={t("in_flight")} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              {flying ? t("happening_now") : t("just_launched")}
            </span>
          </div>

          <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl">
            {launch.mission?.name ?? launch.name}
          </h2>
          <p className="mt-1.5 text-sm text-white/50">
            {[launch.provider, launch.rocket, launch.location].filter(Boolean).join(" · ")}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/35">{t("liftoff")}</div>
              <div className="mt-0.5 font-mono text-white/85">
                {format.dateTime(new Date(launch.net), { dateStyle: "medium", timeStyle: "short" })}
              </div>
            </div>
            {launch.mission?.type && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/35">{t("type")}</div>
                <div className="mt-0.5 text-white/85">{launch.mission.type}</div>
              </div>
            )}
          </div>

          {launch.mission?.description && (
            <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-white/60">
              {launch.mission.description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function LaunchFeed() {
  const t = useTranslations("launches");
  const format = useFormatter();

  const [feed, setFeed] = useState<Feed>(BAKED_LAUNCHES);
  const [tab, setTab] = useState<Tab>("upcoming");
  // Arranca en `true`: el refresco se dispara siempre al montar, así que el
  // estado inicial ya es "actualizando" y no hay que tocarlo dentro del efecto.
  const [refreshing, setRefreshing] = useState(true);
  const [stale, setStale] = useState(false);

  // Refresco en cliente: LL2 permite CORS, así que un lanzamiento de hace diez
  // minutos aparece en la siguiente visita sin esperar al cron de 15 días.
  useEffect(() => {
    let alive = true;
    fetchLaunches()
      .then((fresh) => {
        if (alive) setFeed(fresh);
      })
      .catch(() => {
        // LL2 limita peticiones anónimas; nos quedamos con lo horneado.
        if (alive) setStale(true);
      })
      .finally(() => {
        if (alive) setRefreshing(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const highlight = useMemo(() => getHighlight(feed), [feed]);
  const list = feed[tab];

  const upcomingCount = feed.upcoming.length;
  const recentCount = feed.previous.filter((l) => isRecent(l)).length;

  return (
    <div>
      {highlight && <Highlight launch={highlight} />}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/3 p-1">
          {(["upcoming", "previous"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              aria-pressed={tab === k}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                tab === k ? "bg-white/12 text-white" : "text-white/45 hover:text-white/80"
              }`}
            >
              {t(k)}
              <span className="ml-1.5 text-white/35">
                {k === "upcoming" ? upcomingCount : feed.previous.length}
              </span>
            </button>
          ))}
        </div>

        {recentCount > 0 && (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
            {t("recent_count", { count: recentCount })}
          </span>
        )}

        <span className="ml-auto font-mono text-[10px] tracking-wider text-white/35">
          {refreshing
            ? t("refreshing")
            : stale
              ? t("baked_at", {
                  time: format.dateTime(new Date(feed.checkedAt), { dateStyle: "medium" }),
                })
              : t("updated_now")}
        </span>
      </div>

      {tab === "upcoming" && (
        <p className="mb-4 text-xs text-white/35">{t("next_hint")}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((l) => (
          <LaunchCard key={l.id} launch={l} isPast={tab === "previous"} />
        ))}
      </div>

      {list.length === 0 && (
        <p className="py-16 text-center text-sm text-white/30">{t("empty")}</p>
      )}

      <p className="mt-8 text-center text-[10px] text-white/25">
        {t("source")}
      </p>
    </div>
  );
}
