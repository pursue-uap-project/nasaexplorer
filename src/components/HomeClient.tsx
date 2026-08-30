"use client";

import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number";

interface Props {
  statsMissionsLabel: string;
  statsYearsLabel: string;
  statsProgramsLabel: string;
}

export default function HomeClient({
  statsMissionsLabel,
  statsYearsLabel,
  statsProgramsLabel,
}: Props) {
  const stats = [
    { num: 300, suffix: "+", label: statsMissionsLabel },
    { num: 65, suffix: "+", label: statsYearsLabel },
    { num: 10, suffix: "+", label: statsProgramsLabel },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mt-2 w-full max-w-lg md:max-w-xl px-4 relative z-20">
      {stats.map(({ num, suffix, label }, i) => (
        <div
          key={label}
          className="bg-card-hi border border-card-border rounded-2xl px-4 py-5 shadow-lg text-center flex flex-col justify-center min-h-[120px]"
        >
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            <CountingNumber number={num} inView delay={i * 150} />
            {suffix}
          </p>
          <p className="text-muted text-xs mt-1 leading-tight font-medium">{label}</p>
        </div>
      ))}
    </div>
  );
}
