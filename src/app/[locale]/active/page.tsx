import { getTranslations, setRequestLocale } from "next-intl/server";
import { ACTIVE_MISSIONS, getMissionImages } from "@/lib/nasa";
import MissionSlider from "@/components/MissionSlider";

type Props = { params: Promise<{ locale: string }> };

export default async function ActivePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("active");

  const imagesByMission = Object.fromEntries(
    await Promise.all(
      ACTIVE_MISSIONS.map(async (m) => [m.id, await getMissionImages(m.imageQuery, 6)])
    )
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/60 px-4 sm:px-6 py-12">
      <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>
        <p className="text-foreground/55 mt-2">{t("subtitle")}</p>
      </div>

      <MissionSlider missions={ACTIVE_MISSIONS} images={imagesByMission} />
      </div>
    </main>
  );
}
