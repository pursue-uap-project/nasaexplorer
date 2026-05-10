import { getTranslations, setRequestLocale } from "next-intl/server";
import IssTracker from "@/components/IssTracker";

type Props = { params: Promise<{ locale: string }> };

export default async function IssPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("iss");

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>
          <p className="text-foreground/55 mt-1.5 text-sm">{t("subtitle")}</p>
        </div>
        <IssTracker />
      </div>
    </main>
  );
}
