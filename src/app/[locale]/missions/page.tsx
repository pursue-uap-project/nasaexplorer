import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMissions } from "@/lib/nasa";
import MissionsClient from "./MissionsClient";

type Props = { params: Promise<{ locale: string }> };

export default async function MissionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("missions");
  const missions = await getMissions();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-2">
        <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>
        <p className="text-foreground/50 mt-1 text-sm">{missions.length} {t("count_suffix")}</p>
      </div>
      <MissionsClient missions={missions} />
    </main>
  );
}
