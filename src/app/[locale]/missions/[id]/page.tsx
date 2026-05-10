import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getMissions } from "@/lib/nasa";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateStaticParams() {
  const missions = await getMissions().catch(() => []);
  return missions.map((m) => ({ id: m.id }));
}

export const dynamicParams = false;

export default async function MissionDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/60 flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-xs font-mono tracking-widest text-foreground/35 uppercase mb-3">
          Mission Detail
        </p>
        <h1 className="text-2xl font-bold text-primary mb-2">{id}</h1>
        <p className="text-foreground/45 text-sm">Coming soon — full detail page</p>
      </div>
    </main>
  );
}
