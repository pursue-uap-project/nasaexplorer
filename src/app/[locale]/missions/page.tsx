import { getTranslations, setRequestLocale } from "next-intl/server";
import { getMissions } from "@/lib/nasa";
import MissionsClient from "./MissionsClient";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "missions" });
  return buildMetadata({
    locale,
    path: "missions",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function MissionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("missions");
  const missions = await getMissions();

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-2">
        <h1 className="text-3xl font-bold text-white tracking-[0.02em]">{t("title")}</h1>
        <p className="text-white/45 mt-1 text-sm">{missions.length} {t("count_suffix")}</p>
      </div>
      <MissionsClient missions={missions} />
    </main>
  );
}
