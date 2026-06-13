import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getMissions, getMissionById, getMissionImages, PROGRAM_COLORS } from "@/lib/nasa";
import MissionDetailGallery from "@/components/MissionDetailGallery";
import MissionStats from "@/components/MissionStats";
import HistoricalAudio from "@/components/HistoricalAudio";
import OrbitalSimulator from "@/components/OrbitalSimulator";
import RocketScale from "@/components/RocketScale";
import MissionCountdown from "@/components/MissionCountdown";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateStaticParams() {
  const missions = await getMissions();
  return missions.map((m) => ({ id: m.id }));
}

export const dynamicParams = false;

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

  const color = PROGRAM_COLORS[mission.program] ?? "#0B3D91";
  const loc = locale as "en" | "es";
  const year = mission.launch_details.date?.slice(0, 4);

  const images = await getMissionImages(
    mission.imageQuery ?? mission.name,
    8
  ).catch(() => [] as string[]);

  return (
    <main className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div
        className="relative h-72 sm:h-96 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}33 0%, ${color}15 50%, #0B3D9110 100%)` }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
          style={{ background: color }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        {/* Back link */}
        <div className="absolute top-5 left-5 sm:left-8">
          <Link
            href="/missions"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground/60 hover:text-primary transition-colors bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/80 shadow-sm"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
            {t("back")}
          </Link>
        </div>

        {/* Title area */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-7">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm"
              style={{ background: `${color}dd` }}
            >
              {mission.program}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[mission.launch_details.status] ?? ""}`}>
              {tMission(`status_${mission.launch_details.status}`)}
            </span>
            {year && (
              <span className="text-xs font-mono text-white/50">{year}</span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-[0.02em]">
            {mission.name}
          </h1>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div
        className="bg-white/65 backdrop-blur-2xl border border-white/80 shadow-2xl ring-1 ring-inset ring-white/50 mx-0 sm:mx-4 lg:mx-auto lg:max-w-5xl sm:rounded-3xl overflow-hidden -mt-6 relative z-10"
        style={{ boxShadow: `0 25px 60px -10px ${color}15, 0 10px 30px -5px rgba(11,61,145,0.07)` }}
      >
        {/* Description + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-white/40">

          {/* Description */}
          <div className="lg:col-span-3 px-6 sm:px-8 py-8">
            <h2 className="text-foreground/35 text-xs font-mono uppercase tracking-widest mb-4">
              {t("about_title")}
            </h2>
            <p className="text-foreground/70 leading-relaxed text-sm">
              {mission.description[loc]}
            </p>

            {/* Launch details row */}
            <div className="mt-6 pt-6 border-t border-white/60 flex flex-wrap gap-4 text-xs text-foreground/50">
              <span>
                <span className="font-mono uppercase tracking-wide text-foreground/30 mr-1.5">
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
                <span className="font-mono uppercase tracking-wide text-foreground/30 mr-1.5">
                  {tMission("program")}
                </span>
                {mission.program}
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

        {/* Additional Interactive Section Containers */}
        <div className="px-6 sm:px-8 pb-8 space-y-6">
          {/* Mission Countdown */}
          {mission.countdownTarget && (
            <MissionCountdown targetDate={mission.countdownTarget} missionName={mission.name} />
          )}

          {/* Historical Audio transcript */}
          {mission.audioClip && (
            <HistoricalAudio
              audioUrl={mission.audioClip.url}
              transcripts={mission.audioClip.transcripts}
              missionName={mission.name}
              color={color}
            />
          )}

          {/* Rocket Scale silhouette */}
          {mission.rocketId && (
            <RocketScale rocketId={mission.rocketId} />
          )}

          {/* Orbital Insertion Simulator */}
          <OrbitalSimulator missionName={mission.name} color={color} />
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

      <div className="pb-16" />
    </main>
  );
}
