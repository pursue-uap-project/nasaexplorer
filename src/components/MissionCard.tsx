import Image from "next/image";
import { useTranslations } from "next-intl";
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
  const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const thumb = mission.image ? `${BASE}/${mission.image}` : mission.multimedia?.images?.[0];
  const color = PROGRAM_COLORS[mission.program] ?? "#0B3D91";
  const year = mission.launch_details.date?.slice(0, 4);

  return (
    <article className="bg-white/65 backdrop-blur-xl border border-white/80 rounded-2xl shadow-sm ring-1 ring-inset ring-white/50 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
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
          className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm backdrop-blur-sm"
          style={{ background: `${color}dd` }}
        >
          {mission.program}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-2 flex-1 bg-white/40">
        <h2 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
          {mission.name}
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[mission.launch_details.status] ?? ""}`}>
            {t(`status_${mission.launch_details.status}`)}
          </span>
          {year && <span className="text-xs text-foreground/30 ml-auto font-mono">{year}</span>}
        </div>
        {mission.description.en && (
          <p className="text-xs text-foreground/50 line-clamp-3 leading-relaxed mt-1">
            {mission.description.en}
          </p>
        )}
      </div>
    </article>
  );
}
