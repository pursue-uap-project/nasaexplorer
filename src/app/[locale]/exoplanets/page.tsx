import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import ExoplanetsView from "@/components/ExoplanetsView";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "exoplanets" });
  return buildMetadata({
    locale,
    path: "exoplanets",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function ExoplanetsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("exoplanets");

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-[0.02em] text-white">{t("title")}</h1>
          <p className="mt-2 text-white/55">{t("subtitle")}</p>
        </div>

        <ExoplanetsView locale={locale} />
      </div>
    </main>
  );
}
