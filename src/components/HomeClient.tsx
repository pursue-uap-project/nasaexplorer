"use client";

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
    { val: "300+", label: statsMissionsLabel },
    { val: "65+", label: statsYearsLabel },
    { val: "10+", label: statsProgramsLabel },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mt-2 w-full max-w-lg md:max-w-xl px-4 relative z-20">
      {stats.map(({ val, label }) => (
        <div
          key={label}
          className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-2xl px-4 py-5 shadow-lg ring-1 ring-inset ring-white/50 text-center flex flex-col justify-center min-h-[120px]"
        >
          <p className="text-2xl sm:text-3xl font-bold text-primary">{val}</p>
          <p className="text-foreground/50 text-xs mt-1 leading-tight font-medium">{label}</p>
        </div>
      ))}
    </div>
  );
}
