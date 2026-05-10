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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/60">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>
          <p className="text-foreground/55 mt-2">{t("subtitle")}</p>
        </div>
        <Timeline missions={missions} />
      </div>
    </main>
  );
}
