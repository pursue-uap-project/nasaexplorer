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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8">{t("title")}</h1>
      <MissionsClient missions={missions} />
    </main>
  );
}
