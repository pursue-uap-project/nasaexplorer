import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LaunchFeed from "@/components/LaunchFeed";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "launches" });
  return buildMetadata({ locale, path: "launches", title: t("title"), description: t("subtitle") });
}

export default async function LaunchesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("launches");

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-[0.02em] text-white">{t("title")}</h1>
          <p className="mt-2 text-white/55">{t("subtitle")}</p>
        </div>

        <LaunchFeed />
      </div>
    </main>
  );
}
