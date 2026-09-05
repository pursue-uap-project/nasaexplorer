import { getTranslations, setRequestLocale } from "next-intl/server";
import ApodView from "@/components/ApodView";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apod" });
  return buildMetadata({
    locale,
    path: "apod",
    title: t("title"),
    description: t("subtitle"),
  });
}

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
