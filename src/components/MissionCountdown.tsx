"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

type Props = {
  targetDate: string;
  missionName: string;
};

export default function MissionCountdown({ targetDate, missionName }: Props) {
  const t = useTranslations("countdown");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s, isOver: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isOver) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/20 backdrop-blur-xl rounded-3xl p-6 text-center max-w-xl mx-auto my-8">
        <span className="text-3xl">🚀</span>
        <h4 className="text-white font-bold text-sm mt-2">{t("completed_title", { name: missionName })}</h4>
        <p className="text-white/60 text-xs mt-1">{t("completed_desc")}</p>
      </div>
    );
  }

  // Format digit to ensure 2 numbers (e.g. 09)
  const formatDigit = (num: number) => {
    return num < 10 ? `0${num}` : num.toString();
  };

  return (
    <div className="bg-[#0b1428]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 max-w-xl mx-auto my-8 shadow-2xl relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />

      <h4 className="text-white/50 text-[10px] uppercase font-mono tracking-widest text-center mb-4">
        ⌛ {t("countdown_title", { name: missionName })}
      </h4>

      <div className="flex items-center justify-around gap-2 max-w-sm mx-auto">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="bg-[#040d21] border border-white/10 rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-extrabold text-blue-400 font-mono tracking-wide">
              {formatDigit(timeLeft.days)}
            </span>
          </div>
          <span className="text-[10px] text-white/40 uppercase font-mono mt-2">{t("days")}</span>
        </div>

        <span className="text-xl font-bold text-white/30 mb-5">:</span>

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="bg-[#040d21] border border-white/10 rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-extrabold text-blue-400 font-mono tracking-wide">
              {formatDigit(timeLeft.hours)}
            </span>
          </div>
          <span className="text-[10px] text-white/40 uppercase font-mono mt-2">{t("hours")}</span>
        </div>

        <span className="text-xl font-bold text-white/30 mb-5">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="bg-[#040d21] border border-white/10 rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-extrabold text-blue-400 font-mono tracking-wide">
              {formatDigit(timeLeft.minutes)}
            </span>
          </div>
          <span className="text-[10px] text-white/40 uppercase font-mono mt-2">{t("minutes")}</span>
        </div>

        <span className="text-xl font-bold text-white/30 mb-5">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="bg-[#040d21] border border-white/10 rounded-2xl w-14 h-14 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-extrabold text-orange-400 font-mono tracking-wide">
              {formatDigit(timeLeft.seconds)}
            </span>
          </div>
          <span className="text-[10px] text-white/40 uppercase font-mono mt-2">{t("seconds")}</span>
        </div>
      </div>
    </div>
  );
}
