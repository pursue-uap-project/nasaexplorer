import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("home");

  const stats = [
    { val: "300+", label: t("stats_missions") },
    { val: "65+", label: t("stats_years") },
    { val: "10+", label: t("stats_programs") },
  ];

  return (
    <main
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center"
      style={{
        background: "linear-gradient(160deg, #0B3D91 0%, #0c1f4a 55%, #160a2e 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-8 py-20 max-w-4xl">
        <p className="text-accent font-mono text-xs tracking-[0.4em] uppercase">
          NASA · {new Date().getFullYear()}
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight">
          {t("title")}
        </h1>
        <p className="text-white/60 text-lg max-w-xl leading-relaxed">
          {t("subtitle")}
        </p>
        <Link
          href="/missions"
          className="bg-accent text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-red-600 transition-colors shadow-xl shadow-accent/30"
        >
          {t("cta")}
        </Link>

        <div className="grid grid-cols-3 gap-8 mt-6 pt-8 border-t border-white/10 w-full max-w-sm">
          {stats.map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-white">{val}</p>
              <p className="text-white/40 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
