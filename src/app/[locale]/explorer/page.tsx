import { getTranslations, setRequestLocale } from "next-intl/server";
import ModelViewer from "@/components/ModelViewer";

type Props = { params: Promise<{ locale: string }> };

export default async function ExplorerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("explorer");

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>
        <p className="text-foreground/55 mt-2">{t("subtitle")}</p>
      </div>

      <ModelViewer />

      <p className="text-center text-xs text-foreground/35 mt-3">{t("hint")}</p>
    </main>
  );
}
