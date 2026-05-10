"use client";

import { useMemo } from "react";
import type { Mission } from "@/lib/nasa";
import { PROGRAM_COLORS } from "@/lib/nasa";

type Props = { missions: Mission[] };

export default function Timeline({ missions }: Props) {
  const sorted = useMemo(
    () =>
      [...missions]
        .filter((m) => m.launch_details.date)
        .sort((a, b) => new Date(a.launch_details.date).getTime() - new Date(b.launch_details.date).getTime()),
    [missions]
  );

  return (
    <ol className="relative pl-6 space-y-3 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-primary/40 before:via-accent/25 before:to-transparent">
      {sorted.map((m) => {
        const color = PROGRAM_COLORS[m.program] ?? "#0B3D91";
        const year = m.launch_details.date.slice(0, 4);

        return (
          <li key={m.id} className="relative group">
            {/* Timeline dot */}
            <span
              className="absolute -left-[1.375rem] top-3.5 w-3 h-3 rounded-full border-2 border-background shadow-sm group-hover:scale-125 transition-transform duration-200"
              style={{ background: color }}
            />
            {/* Glass card */}
            <div className="bg-white/65 backdrop-blur-xl border border-white/80 rounded-xl px-4 py-3 shadow-sm ring-1 ring-inset ring-white/50 hover:shadow-md hover:-translate-y-px transition-all duration-200">
              <div className="flex items-center gap-2 mb-1">
                <time className="text-xs font-mono text-foreground/35">{year}</time>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                  style={{ background: color }}
                >
                  {m.program}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                {m.name}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
