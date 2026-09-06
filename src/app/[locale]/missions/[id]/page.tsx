import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getMissions, getMissionById, getMissionImages, PROGRAM_COLORS } from "@/lib/nasa";
import MissionDetailGallery from "@/components/MissionDetailGallery";
import MissionStats from "@/components/MissionStats";
import HistoricalAudio from "@/components/HistoricalAudio";
import MissionMediaAndCrew from "@/components/MissionMediaAndCrew";
import RocketScale from "@/components/RocketScale";
import MissionCountdown from "@/components/MissionCountdown";
import MissionNav from "@/components/MissionNav";
import { buildMetadata, SITE } from "@/lib/seo";
import { nombrePrograma } from "@/lib/labels";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateStaticParams() {
  const missions = await getMissions();
  return missions.map((m) => ({ id: m.id }));
}

export const dynamicParams = false;

/**
 * Las 38 fichas son la mayor parte de las URL del sitio y hasta ahora
 * compartían el título genérico del layout: en resultados de búsqueda y al
 * compartir un enlace, Apollo 11 y Voyager 2 se veían idénticas.
 *
 * La descripción sale de la propia ficha, recortada: es texto escrito para
 * humanos y describe la misión mejor que cualquier plantilla.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const mission = getMissionById(id);
  if (!mission) return {};

  const loc = locale === "es" ? "es" : "en";
  const anio = mission.launch_details.date?.slice(0, 4);
  const texto = mission.description[loc];

  return buildMetadata({
    locale,
    path: `missions/${mission.id}`,
    title: anio ? `${mission.name} (${anio}) · ${mission.program}` : `${mission.name} · ${mission.program}`,
    // Los buscadores cortan alrededor de 160 caracteres; mejor cortar por
    // palabra aquí que dejar que lo hagan a mitad de una.
    description: texto.length > 160 ? `${texto.slice(0, 157).replace(/\s+\S*$/, "")}…` : texto,
    // No se reutiliza `mission.image`: es WebP y de proporción libre, y las
    // previsualizaciones de redes esperan JPEG a 1200×630. `og-missions/`
    // guarda ese recorte para cada misión.
    image: `${SITE}/assets/og-missions/${mission.id}.jpg`,
  });
}

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-100/90 text-emerald-700 border border-emerald-200/60",
  completed: "bg-slate-100/90   text-slate-500   border border-slate-200/60",
  planned:   "bg-blue-100/90    text-blue-700    border border-blue-200/60",
};

export default async function MissionDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const mission = getMissionById(id);
  if (!mission) notFound();

  const allMissions = await getMissions();

  const t = await getTranslations("mission_detail");
  const tMission = await getTranslations("mission");
  const tPrograma = await getTranslations("mission_program");

  const color = PROGRAM_COLORS[mission.program] ?? "#0B3D91";
  const loc = locale as "en" | "es";
  const year = mission.launch_details.date?.slice(0, 4);

  // Solo se acota por año si la misión terminó: en una activa las fotos buenas
  // llegan años después del lanzamiento.
  const anioBusqueda =
    mission.launch_details.status === "completed" && year ? Number(year) : null;
  const images = await getMissionImages(
    mission.imageQuery ?? mission.name,
    8,
    anioBusqueda,
  ).catch(() => [] as string[]);

  return (
    <main className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {/* Antes eran 320 px de degradado vacío mientras la fotografía de la
          misión quedaba enterrada a media página. La foto ES la portada. */}
      <div className="relative h-80 overflow-hidden pt-2 sm:h-[26rem]">
        {mission.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${mission.image}`}
              alt={mission.name}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Velo: el título tiene que leerse sobre cualquier foto. */}
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-background/25" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${color}33 0%, ${color}15 50%, #0B3D9110 100%)` }}
          />
        )}

        {/* Migas: antes solo había un botón «atrás» flotando, sin decir de
            dónde se venía ni a qué programa pertenece la misión. */}
        <div className="absolute inset-x-0 top-0">
          <nav aria-label={t("breadcrumb")} className="mx-auto max-w-5xl px-6 pt-6 pb-5 sm:px-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-2xs uppercase tracking-[0.16em] text-white/55">
              <li>
                <Link href="/missions" className="hover:text-white">
                  {t("back")}
                </Link>
              </li>
              <li aria-hidden className="text-white/25">/</li>
              <li>
                <Link href={`/missions?program=${encodeURIComponent(mission.program)}`} className="hover:text-white">
                  {nombrePrograma(tPrograma, mission.program)}
                </Link>
              </li>
              <li aria-hidden className="text-white/25">/</li>
              <li className="text-white/80">{mission.name}</li>
            </ol>
          </nav>
        </div>

        <div className="absolute inset-x-0 bottom-0 pb-7">
          <div className="mx-auto max-w-5xl px-6 sm:px-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-xs"
                style={{ background: `${color}dd` }}
              >
                {nombrePrograma(tPrograma, mission.program)}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[mission.launch_details.status] ?? ""}`}>
                {tMission(`status_${mission.launch_details.status}`)}
              </span>
              {year && <span className="font-mono text-xs text-white/60">{year}</span>}
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-[0.02em] text-white drop-shadow-lg sm:text-5xl">
              {mission.name}
            </h1>
          </div>
        </div>

        {mission.imageCredit && (
          <p className="pointer-events-none absolute right-4 top-6 hidden max-w-[45%] truncate text-right font-mono text-2xs text-white/70 [text-shadow:0_1px_3px_rgb(0_0_0/0.9)] sm:block">
            <a
              href={`https://images.nasa.gov/details/${mission.imageNasaId ?? ""}`}
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto hover:text-white/70"
            >
              {mission.imageCredit}
            </a>
          </p>
        )}
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div
        className="bg-card border border-card-border shadow-2xl mx-0 sm:mx-4 lg:mx-auto lg:max-w-5xl sm:rounded-3xl overflow-hidden -mt-6 relative z-10"
        style={{ boxShadow: `0 25px 60px -10px ${color}15, 0 10px 30px -5px rgba(11,61,145,0.07)` }}
      >
        {/* Description + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-white/40">

          {/* Description */}
          <div className="lg:col-span-3 px-6 sm:px-8 py-8">
            <h2 className="text-faint text-xs font-mono uppercase tracking-widest mb-4">
              {t("about_title")}
            </h2>
            <p className="text-body leading-relaxed text-sm">
              {mission.description[loc]}
            </p>

            {/* Launch details row */}
            <div className="mt-6 pt-6 border-t border-card-border flex flex-wrap gap-4 text-xs text-muted">
              <span>
                <span className="font-mono uppercase tracking-wide text-faint mr-1.5">
                  {tMission("launch_date")}
                </span>
                {mission.launch_details.date
                  ? new Date(mission.launch_details.date).toLocaleDateString(
                      locale === "es" ? "es-ES" : "en-US",
                      { year: "numeric", month: "long", day: "numeric" }
                    )
                  : "—"}
              </span>
              <span>
                <span className="font-mono uppercase tracking-wide text-faint mr-1.5">
                  {tMission("program")}
                </span>
                {nombrePrograma(tPrograma, mission.program)}
              </span>
            </div>
          </div>

          {/* Clickable Crew Stats */}
          {mission.stats && mission.stats.length > 0 && (
            <MissionStats
              stats={mission.stats}
              color={color}
              allMissions={allMissions}
              statsTitle={t("stats_title")}
            />
          )}
        </div>

        {/* Orden: primero quién voló y qué pasó, después los módulos
            interactivos. Antes el audio y el comparador de cohetes iban por
            delante de la tripulación. */}
        <div className="space-y-6 px-6 pb-8 sm:px-8">
          {mission.countdownTarget && (
            <MissionCountdown targetDate={mission.countdownTarget} missionName={mission.name} />
          )}

          {/* La foto ya es el hero, así que este bloque se queda con la
              tripulación y no la repite. */}
          <MissionMediaAndCrew
            missionName={mission.name}
            crewNames={mission.stats?.find((s) => s.label.toLowerCase() === "crew" || s.label.toLowerCase() === "astronaut")?.value}
            color={color}
            allMissions={allMissions}
          />

          {mission.audioClip && (
            <HistoricalAudio
              // Los clips se sirven desde `public/`, así que llevan basePath.
              // Se acepta una URL absoluta por si alguna vez vuelve a apuntar
              // fuera, igual que hacen `MissionCard` y `AstronautModal`.
              audioUrl={
                mission.audioClip.url.startsWith("http")
                  ? mission.audioClip.url
                  : `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${mission.audioClip.url}`
              }
              transcripts={mission.audioClip.transcripts}
              missionName={mission.name}
              color={color}
            />
          )}

          {mission.rocketId && <RocketScale rocketId={mission.rocketId} />}
        </div>

        {/* Gallery */}
        <MissionDetailGallery
          images={images}
          youtubeId={mission.youtubeId}
          missionName={mission.name}
          color={color}
          galleryTitle={t("gallery_title")}
        />
      </div>

      <MissionNav actual={mission} todas={allMissions} />

      <div className="pb-16" />
    </main>
  );
}
