import { getTranslations, setRequestLocale } from "next-intl/server";
import IssTracker from "@/components/IssTracker";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "iss" });
  return buildMetadata({
    locale,
    path: "iss",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function IssPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("iss");

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>
          {/* on-dark y no muted: este subtítulo va directo sobre el fondo de
              página, no dentro de una tarjeta clara. Antes era
              text-foreground/55, o sea gris oscuro sobre azul noche: 1,3:1. */}
          <p className="text-on-dark-muted mt-1.5 text-sm">{t("subtitle")}</p>
        </div>
        <IssTracker />
      </div>
    </main>
  );
}
