import { getTranslations, setRequestLocale } from "next-intl/server";
import ApodView from "@/components/ApodView";

type Props = { params: Promise<{ locale: string }> };

export default async function ApodPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("apod");

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>
          <p className="text-foreground/55 mt-2">{t("subtitle")}</p>
        </div>

        <ApodView />
      </div>
    </main>
  );
}
