import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function IssPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("iss");

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>
          <p className="text-foreground/55 mt-2">{t("subtitle")}</p>
        </div>
        {/* ISS tracker map — coming next */}
        <div className="bg-white/65 backdrop-blur-xl border border-white/80 rounded-2xl shadow-sm ring-1 ring-inset ring-white/50 h-[500px] flex items-center justify-center">
          <p className="text-foreground/30 font-mono text-sm">ISS live tracker — coming soon</p>
        </div>
      </div>
    </main>
  );
}
