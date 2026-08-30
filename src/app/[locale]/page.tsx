import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import HeroVideoScrub from "@/components/HeroVideoScrub";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("home");

  return (
    <main className="w-full bg-black text-white selection:bg-cyan-500 selection:text-black">
      {/* ── Oneshot Hero Video-Scrubbing Section ── */}
      <HeroVideoScrub
        statsMissionsLabel={t("stats_missions")}
        statsYearsLabel={t("stats_years")}
        statsProgramsLabel={t("stats_programs")}
      />
    </main>
  );
}
