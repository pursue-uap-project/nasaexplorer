import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import HomeClient from "@/components/HomeClient";
import uapStoriesData from "@/data/uap-stories.json";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const uapCount = uapStoriesData.length;
  return <HomeContent uapCount={uapCount} />;
}

function HomeContent({ uapCount }: { uapCount: number }) {
  const t = useTranslations("home");

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">

      {/* ── Cosmic nebula blobs ───────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-8%]  w-[600px] h-[600px] bg-blue-900/30   rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/25 rounded-full blur-[100px]" />
        <div className="absolute top-[35%] left-[50%]  w-[350px] h-[350px] bg-accent/[0.06]   rounded-full blur-[80px]" />
        {/* Star field */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-8 py-20 max-w-3xl w-full">

        {/* NASA logo */}
        <img
          src="/nasaexplorer/nasa-logo.png"
          alt="NASA"
          className="h-28 sm:h-40 w-auto brightness-0 invert opacity-90 drop-shadow-2xl"
        />

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-[0.02em] leading-tight">
          {t("title")}
        </h1>

        {/* Subtitle */}
        <p className="text-white/55 text-lg sm:text-xl max-w-lg leading-relaxed">
          {t("subtitle")}
        </p>

        {/* CTA */}
        <Link
          href="/missions"
          className="bg-accent text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/35 hover:-translate-y-0.5 transition-all duration-200 tracking-[0.03em]"
        >
          {t("cta")}
        </Link>

        {/* ── Stats & UAP Secret Portal ───────────────────────────────── */}
        <HomeClient
          uapCount={uapCount}
          statsMissionsLabel={t("stats_missions")}
          statsYearsLabel={t("stats_years")}
          statsProgramsLabel={t("stats_programs")}
        />
      </div>
    </main>
  );
}
