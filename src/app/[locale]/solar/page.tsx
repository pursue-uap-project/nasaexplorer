import { getTranslations, setRequestLocale } from "next-intl/server";
import SolarSystem from "@/components/SolarSystem";

type Props = { params: Promise<{ locale: string }> };

export default async function SolarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("solar");

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-[0.02em]">{t("title")}</h1>
          <p className="text-white/55 mt-2">{t("subtitle")}</p>
        </div>

        <SolarSystem locale={locale} />

        <div className="mt-6 flex flex-wrap gap-6 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#4b9de0] inline-block" />
            <span>{t("legend_planets")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#a78bfa] inline-block ring-1 ring-[#a78bfa]/50" />
            <span>{t("legend_missions")}</span>
          </div>
          <span className="text-white/25">{t("hint")}</span>
        </div>
      </div>
    </main>
  );
}
