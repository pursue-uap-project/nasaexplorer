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
    { val: "65+",  label: t("stats_years") },
    { val: "10+",  label: t("stats_programs") },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">

      {/* ── Decorative background blobs ──────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%]  w-[500px] h-[500px] bg-blue-100/70   rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-8%] w-[420px] h-[420px] bg-indigo-100/60 rounded-full blur-3xl" />
        <div className="absolute top-[40%] left-[55%]  w-[300px] h-[300px] bg-red-50/50      rounded-full blur-3xl" />
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-8 py-20 max-w-3xl w-full">

        {/* NASA logo */}
        <img
          src="/nasaexplorer/nasa-logo.png"
          alt="NASA"
          className="h-28 sm:h-40 w-auto drop-shadow-sm"
        />

        {/* Subtitle */}
        <p className="text-foreground/60 text-lg sm:text-xl max-w-lg leading-relaxed">
          {t("subtitle")}
        </p>

        {/* CTA */}
        <Link
          href="/missions"
          className="bg-accent text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/35 hover:-translate-y-0.5 transition-all duration-200"
        >
          {t("cta")}
        </Link>

        {/* ── Stats — glass cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mt-2 w-full max-w-sm">
          {stats.map(({ val, label }) => (
            <div
              key={label}
              className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl px-4 py-5 shadow-sm ring-1 ring-inset ring-white/50 text-center"
            >
              <p className="text-2xl sm:text-3xl font-bold text-primary">{val}</p>
              <p className="text-foreground/40 text-xs mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
