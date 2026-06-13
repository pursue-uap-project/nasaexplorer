import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import SearchClient from "./SearchClient";

type Props = { params: Promise<{ locale: string }> };

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
