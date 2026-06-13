"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Mission } from "@/lib/nasa";

type Props = {
  missions: Mission[];
};

export default function MissionAnalytics({ missions }: Props) {
  const t = useTranslations("analytics");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  // Stats Calculations
  const stats = useMemo(() => {
    const total = missions.length;
    const crewed = missions.filter((m) => m.crewed).length;
    const robotic = total - crewed;

    // Status
    const active = missions.filter((m) => m.launch_details.status === "active").length;
    const completed = missions.filter((m) => m.launch_details.status === "completed").length;
    const planned = missions.filter((m) => m.launch_details.status === "planned").length;

    // Program Breakdown
    const programs: Record<string, number> = {};
    missions.forEach((m) => {
      programs[m.program] = (programs[m.program] || 0) + 1;
    });

    // Decades Breakdown
    const decades: Record<string, number> = {
      "1960s": 0,
      "1970s": 0,
      "1980s": 0,
      "1990s": 0,
      "2000s": 0,
      "2010s": 0,
      "2020s": 0,
    };
    missions.forEach((m) => {
      const year = parseInt(m.launch_details.date?.slice(0, 4) || "0", 10);
      if (year >= 1960 && year < 1970) decades["1960s"]++;
      else if (year >= 1970 && year < 1980) decades["1970s"]++;
      else if (year >= 1980 && year < 1990) decades["1980s"]++;
      else if (year >= 1990 && year < 2000) decades["1990s"]++;
      else if (year >= 2000 && year < 2010) decades["2000s"]++;
      else if (year >= 2010 && year < 2020) decades["2010s"]++;
      else if (year >= 2020 && year < 2030) decades["2020s"]++;
    });

    return { total, crewed, robotic, active, completed, planned, programs, decades };
  }, [missions]);

  if (!isOpen) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-2">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/80 hover:text-white font-medium text-sm transition-all duration-200 shadow-sm"
        >
          <span>📊</span>
          <span>{t("show_dashboard")}</span>
        </button>
      </div>
    );
  }

  // Bar Graph Calculations for Programs
  const programEntries = Object.entries(stats.programs).sort((a, b) => b[1] - a[1]);
  const maxProgramVal = Math.max(...programEntries.map((e) => e[1]), 1);

  // Decade Line Graph Coordinates
  const decadeEntries = Object.entries(stats.decades);
  const maxDecadeVal = Math.max(...decadeEntries.map((e) => e[1]), 1);
  const linePoints = decadeEntries
    .map(([, val], idx) => {
      const x = 50 + idx * 80;
      const y = 150 - (val / maxDecadeVal) * 110;
      return `${x},${y}`;
    })
    .join(" ");

  // Pie Chart calculations for Status (Active, Completed, Planned)
  const pieTotal = stats.active + stats.completed + stats.planned;
  const activePercent = (stats.active / pieTotal) * 100;
  const completedPercent = (stats.completed / pieTotal) * 100;
  const plannedPercent = (stats.planned / pieTotal) * 100;

  // SVG Donut slice helper
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
      <div className="bg-[#0b1428]/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-[-30%] left-[-20%] w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">{t("dashboard_title")}</h3>
            <p className="text-white/40 text-xs mt-0.5">{t("dashboard_subtitle")}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white text-xs font-semibold transition-all"
          >
            {t("hide_dashboard")}
          </button>
        </div>

        {/* ── Key Cards Row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-white/40 text-xs font-mono uppercase tracking-wider">{t("stat_total")}</span>
            <span className="text-3xl font-extrabold text-white mt-2 font-mono">{stats.total}</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-white/40 text-xs font-mono uppercase tracking-wider">{t("stat_crewed")}</span>
            <span className="text-3xl font-extrabold text-blue-400 mt-2 font-mono">{stats.crewed}</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-white/40 text-xs font-mono uppercase tracking-wider">{t("stat_robotic")}</span>
            <span className="text-3xl font-extrabold text-purple-400 mt-2 font-mono">{stats.robotic}</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-white/40 text-xs font-mono uppercase tracking-wider">{t("stat_active")}</span>
            <span className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">{stats.active}</span>
          </div>
        </div>

        {/* ── Visual Charts Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          
          {/* Chart 1: Missions Timeline by Decade */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5">
            <h4 className="text-white/70 text-sm font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3 rounded-full bg-blue-500" />
              {t("chart_timeline_title")}
            </h4>
            <div className="w-full flex items-center justify-center">
              <svg className="w-full max-w-[480px] h-[180px]" viewBox="0 0 540 180">
                {/* Horizontal Guide Lines */}
                <line x1="40" y1="40" x2="520" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                <line x1="40" y1="95" x2="520" y2="95" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                <line x1="40" y1="150" x2="520" y2="150" stroke="rgba(255,255,255,0.1)" />

                {/* Decade Markers */}
                {decadeEntries.map(([decade], idx) => {
                  const x = 50 + idx * 80;
                  return (
                    <text key={decade} x={x} y="170" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle" fontFamily="monospace">
                      {decade.replace("s", "")}
                    </text>
                  );
                })}

                {/* Line Area Gradient */}
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Area under the line */}
                <path
                  d={`M 50,150 L ${linePoints} L ${50 + (decadeEntries.length - 1) * 80},150 Z`}
                  fill="url(#chart-glow)"
                />

                {/* Main Sparkline */}
                <path
                  d={`M ${linePoints}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {decadeEntries.map(([, val], idx) => {
                  const x = 50 + idx * 80;
                  const y = 150 - (val / maxDecadeVal) * 110;
                  return (
                    <g key={idx} className="group/dot cursor-pointer">
                      <circle cx={x} cy={y} r="6" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="2" />
                      <circle cx={x} cy={y} r="12" fill="#60a5fa" fillOpacity="0" className="hover:fill-opacity-20 transition-all" />
                      <title>{`${val} ${t("count_suffix")}`}</title>
                      {/* Tooltip on hover */}
                      <text x={x} y={y - 12} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover/dot:opacity-100 transition-opacity bg-black duration-150">
                        {val}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Chart 2: Program Breakdowns */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <h4 className="text-white/70 text-sm font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3 rounded-full bg-purple-500" />
              {t("chart_programs_title")}
            </h4>
            <div className="space-y-3 pr-2">
              {programEntries.slice(0, 5).map(([name, val]) => {
                const widthPercent = (val / maxProgramVal) * 100;
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/80 font-medium">{name}</span>
                      <span className="text-white/40 font-mono">{val}</span>
                    </div>
                    <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
