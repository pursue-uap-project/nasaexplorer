import { getTranslations, setRequestLocale } from "next-intl/server";
import ApodView from "@/components/ApodView";

type Props = { params: Promise<{ locale: string }> };

export default async function ApodPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("apod");

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-[0.02em]">{t("title")}</h1>
          <p className="text-white/55 mt-2">{t("subtitle")}</p>
        </div>

        <ApodView />
      </div>
    </main>
  );
}
