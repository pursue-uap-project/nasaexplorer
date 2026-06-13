import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMissions } from "@/lib/nasa";
import Timeline from "@/components/Timeline";

type Props = { params: Promise<{ locale: string }> };

export default async function TimelinePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("timeline");
  const missions = await getMissions();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white relative overflow-hidden pb-16">
      {/* ── Background Cosmic Ambience ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-emerald-950/20 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        {/* Title area */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-emerald-400">
            {t("title")}
          </h1>
          <p className="text-white/55 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="mt-4 text-[10px] font-mono tracking-widest text-white/30 uppercase">
            CHRONOLOGICAL MERGE: SYSTEM LOGS & SIGHTINGS
          </div>
        </div>

        <Timeline missions={missions} />
      </div>
    </main>
  );
}
