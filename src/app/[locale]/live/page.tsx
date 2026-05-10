import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApod } from "@/lib/nasa";
import LiveHub from "@/components/LiveHub";
import LiveStreams from "@/components/LiveStreams";

type Props = { params: Promise<{ locale: string }> };

export default async function LivePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("live");

  let apod = null;
  try {
    apod = await getApod(process.env.NASA_API_KEY ?? "DEMO_KEY");
  } catch {
    // falls through to null — LiveHub handles the empty state
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-primary mb-10">{t("title")}</h1>

      <LiveStreams />

      <section>
        <h2 className="text-2xl font-bold text-primary mb-2">{t("apod_title")}</h2>
        <p className="text-foreground/50 text-sm mb-6">nasa.gov · APOD</p>
        <LiveHub apod={apod} />
      </section>
    </main>
  );
}
