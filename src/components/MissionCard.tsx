import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { nombrePrograma } from "@/lib/labels";
import type { Mission } from "@/lib/nasa";
import { PROGRAM_COLORS } from "@/lib/nasa";

type Props = { mission: Mission };

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60",
  completed: "bg-slate-100/80   text-slate-500   border border-slate-200/60",
  planned:   "bg-blue-100/80    text-blue-700    border border-blue-200/60",
};

export default function MissionCard({ mission }: Props) {
  const t = useTranslations("mission");
  const tPrograma = useTranslations("mission_program");
  // Iba cableado a `description.en`: las 25 tarjetas del listado salían en
  // inglés en la versión española, teniendo el texto en español escrito.
  const locale = useLocale() === "es" ? "es" : "en";
  const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const thumb = mission.image ? `${BASE}/${mission.image}` : mission.multimedia?.images?.[0];
  const color = PROGRAM_COLORS[mission.program] ?? "#0B3D91";
  const year = mission.launch_details.date?.slice(0, 4);

  return (
    <article className="bg-card border border-card-border rounded-2xl shadow-xs overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Thumbnail */}
      <div className="relative h-44 shrink-0 overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}22, #0B3D9115)` }}>
        {thumb && (
          <Image
            src={thumb}
            alt={mission.name}
            fill
            unoptimized
            className="object-cover opacity-90 transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        <span
          className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-xs backdrop-blur-xs"
          style={{ background: `${color}dd` }}
        >
          {nombrePrograma(tPrograma, mission.program)}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-2 flex-1 bg-card">
        <h2 className="font-semibold text-ink text-sm leading-snug line-clamp-2">
          {mission.name}
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[mission.launch_details.status] ?? ""}`}>
            {t(`status_${mission.launch_details.status}`)}
          </span>
          {year && <span className="text-xs text-faint ml-auto font-mono">{year}</span>}
        </div>
        {mission.description[locale] && (
          <p className="text-xs text-muted line-clamp-3 leading-relaxed mt-1">
            {mission.description[locale]}
          </p>
        )}
      </div>
    </article>
  );
}
