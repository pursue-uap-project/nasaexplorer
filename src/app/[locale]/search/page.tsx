import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import SearchClient from "./SearchClient";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return buildMetadata({
    locale,
    path: "search",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mb-4" />
        <p className="text-white/50 text-sm font-mono tracking-wider animate-pulse">
          INITIALIZING DATABASE ACCESS...
        </p>
      </div>
    }>
      <SearchClient locale={locale as "en" | "es"} />
    </Suspense>
  );
}
