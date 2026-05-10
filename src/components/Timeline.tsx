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
        .sort(
          (a, b) =>
            new Date(a.launch_details.date).getTime() -
            new Date(b.launch_details.date).getTime()
        ),
    [missions]
  );

  return (
    <ol className="relative pl-6 space-y-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-primary/50 before:via-accent/30 before:to-transparent">
      {sorted.map((m) => {
        const color = PROGRAM_COLORS[m.program] ?? "#0B3D91";
        const year = m.launch_details.date.slice(0, 4);

        return (
          <li key={m.id} className="relative group">
            <span
              className="absolute -left-[1.375rem] top-3 w-3 h-3 rounded-full border-2 border-background shadow group-hover:scale-125 transition-transform"
              style={{ background: color }}
            />
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
