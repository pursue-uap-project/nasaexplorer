import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Mission } from "@/lib/nasa";
import { PROGRAM_COLORS } from "@/lib/nasa";

type Props = { mission: Mission };

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-100 text-slate-500",
  planned: "bg-blue-100 text-blue-700",
};

export default function MissionCard({ mission }: Props) {
  const t = useTranslations("mission");
  const thumb = mission.multimedia?.images?.[0];
  const color = PROGRAM_COLORS[mission.program] ?? "#0B3D91";
  const year = mission.launch_details.date?.slice(0, 4);

  return (
    <article className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col">
      <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-900 shrink-0">
        {thumb && (
          <Image
            src={thumb}
            alt={mission.name}
            fill
            unoptimized
            className="object-cover opacity-80"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        <span
          className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
          style={{ background: color }}
        >
          {mission.program}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-2 flex-1">
        <h2 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
          {mission.name}
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[mission.launch_details.status] ?? ""}`}
          >
            {t(`status_${mission.launch_details.status}`)}
          </span>
          {year && <span className="text-xs text-foreground/30 ml-auto">{year}</span>}
        </div>
        {mission.description.en && (
          <p className="text-xs text-foreground/55 line-clamp-3 leading-relaxed mt-1">
            {mission.description.en}
          </p>
        )}
      </div>
    </article>
  );
}
