const STARS: [number, number][] = [
  [140,25],[195,70],[270,12],[345,50],[415,22],[475,65],[545,38],[645,72],
  [115,105],[235,125],[375,95],[455,140],[515,110],[585,155],[665,45],
  [165,178],[295,190],[425,170],[555,185],[635,165],[320,80],[490,30],
];

export default function TrajectoryMap({ locale = "en" }: { locale?: string }) {
  const labels = {
    earth: locale === "es" ? "Tierra" : "Earth",
    tli: "TLI",
    loi: "LOI",
    tei: locale === "es" ? "TEI · Regreso" : "TEI · Return",
    outbound: locale === "es" ? "Ida" : "Outbound",
    ret: locale === "es" ? "Regreso" : "Return",
    title: locale === "es" ? "Perfil de Misión · Artemis" : "Mission Profile · Artemis",
  };

  return (
    <div
      className="rounded-2xl overflow-hidden border border-gray-800/20 w-full"
      style={{ background: "radial-gradient(ellipse at 50% 50%, #0d1b3e 0%, #05090f 100%)" }}
    >
      <p className="px-5 pt-4 pb-0 text-white/45 text-xs font-mono uppercase tracking-widest">
        {labels.title}
      </p>
      <svg viewBox="0 0 700 220" className="w-full" style={{ maxHeight: 220 }}>
        <defs>
          <radialGradient id="traj-earth" cx="38%" cy="35%">
            <stop offset="0%" stopColor="#5b9bd5" />
            <stop offset="55%" stopColor="#1e4a8a" />
            <stop offset="100%" stopColor="#091530" />
          </radialGradient>
          <radialGradient id="traj-moon" cx="38%" cy="35%">
            <stop offset="0%" stopColor="#d0d0d0" />
            <stop offset="60%" stopColor="#888" />
            <stop offset="100%" stopColor="#3a3a3a" />
          </radialGradient>
          <filter id="traj-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {STARS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={0.9} fill="white" opacity={0.3 + (i % 5) * 0.08} />
        ))}

        {/* Outbound arc */}
        <path
          d="M 120 132 C 210 38, 460 28, 590 100"
          fill="none" stroke="#FC3D21" strokeWidth="1.8"
          strokeDasharray="6 4" opacity="0.85"
        />
        {/* Return arc */}
        <path
          d="M 590 120 C 455 205, 215 205, 120 170"
          fill="none" stroke="#60a5fa" strokeWidth="1.8"
          strokeDasharray="6 4" opacity="0.75"
        />

        {/* Lunar orbit ellipse */}
        <ellipse cx="610" cy="110" rx="38" ry="24"
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3" />

        {/* Earth glow + body */}
        <circle cx="90" cy="152" r="52" fill="rgba(59,130,246,0.1)" />
        <circle cx="90" cy="152" r="34" fill="url(#traj-earth)" filter="url(#traj-glow)" />
        <text x="90" y="198" textAnchor="middle"
          fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="monospace">{labels.earth}</text>

        {/* Moon glow + body */}
        <circle cx="610" cy="110" r="38" fill="rgba(200,200,200,0.06)" />
        <circle cx="610" cy="110" r="22" fill="url(#traj-moon)" filter="url(#traj-glow)" />
        <text x="610" y="145" textAnchor="middle"
          fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="monospace">Moon</text>

        {/* SLS at launch */}
        <circle cx="120" cy="118" r="4.5" fill="#FC3D21" filter="url(#traj-glow)" />

        {/* TLI waypoint */}
        <circle cx="238" cy="62" r="3" fill="rgba(252,61,33,0.75)" />
        <text x="238" y="50" textAnchor="middle"
          fill="rgba(252,61,33,0.65)" fontSize="7" fontFamily="monospace">{labels.tli}</text>

        {/* LOI waypoint */}
        <circle cx="540" cy="48" r="3" fill="rgba(252,61,33,0.75)" />
        <text x="540" y="38" textAnchor="middle"
          fill="rgba(252,61,33,0.65)" fontSize="7" fontFamily="monospace">{labels.loi}</text>

        {/* Orion on orbit */}
        <circle cx="648" cy="110" r="4" fill="#60a5fa" filter="url(#traj-glow)" />

        {/* Return label */}
        <text x="350" y="214" textAnchor="middle"
          fill="rgba(96,165,250,0.6)" fontSize="7" fontFamily="monospace">{labels.tei}</text>

        {/* Legend */}
        <line x1="28" y1="10" x2="52" y2="10"
          stroke="#FC3D21" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="57" y="14" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">
          {labels.outbound}
        </text>
        <line x1="28" y1="23" x2="52" y2="23"
          stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="57" y="27" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">
          {labels.ret}
        </text>
      </svg>
    </div>
  );
}
