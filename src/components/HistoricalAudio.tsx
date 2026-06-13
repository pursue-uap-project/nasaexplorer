"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

type TranscriptLine = {
  time: number;
  es: string;
  en: string;
};

type Props = {
  audioUrl: string;
  transcripts: TranscriptLine[];
  missionName: string;
  color: string;
};

export default function HistoricalAudio({ audioUrl, transcripts, missionName, color }: Props) {
  const t = useTranslations("audio_player");
  const locale = useLocale();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Sync active transcript line based on current playback time
  useEffect(() => {
    let bestIdx = -1;
    for (let i = 0; i < transcripts.length; i++) {
      if (currentTime >= transcripts[i].time) {
        bestIdx = i;
      }
    }
    setActiveIndex(bestIdx);
  }, [currentTime, transcripts]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.log("Audio play failed:", err));
    }
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const onLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const seekTo = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      audioRef.current.play().catch((err) => console.log("Audio play failed:", err));
    }
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 mt-8">
      <h3 className="text-foreground font-bold text-base mb-2 flex items-center gap-2">
        <span>🎙️</span>
        {t("title", { name: missionName })}
      </h3>
      <p className="text-foreground/50 text-xs mb-6">
        {t("subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Retro visualizer + player controls */}
        <div className="md:col-span-1 bg-[#040d21] border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-[180px] relative overflow-hidden">
          {/* Animated Oscilloscope wave lines (using CSS keyframes for a retro look) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-around px-8">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-blue-500 rounded-full transition-all duration-150"
                style={{
                  height: isPlaying ? `${Math.floor(Math.random() * 50) + 10}px` : "6px",
                  animation: isPlaying ? `pulse 0.4s ease-in-out infinite alternate ${i * 0.05}s` : "none",
                }}
              />
            ))}
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />

          <span className="text-white/30 text-[10px] uppercase font-mono tracking-widest relative z-10">
            {t("audio_status")}
          </span>

          {/* Control bar */}
          <div className="flex items-center gap-4 relative z-10">
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white border border-white/20 hover:scale-105 active:scale-95 transition-all shadow-md"
              style={{ backgroundColor: color }}
            >
              {isPlaying ? (
                // Pause icon
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                </svg>
              ) : (
                // Play icon
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <div className="flex-1">
              {/* Progress slider */}
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{ width: `${progressPercent}%`, backgroundColor: color }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-white/40 mt-1.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sync interactive transcript */}
        <div className="md:col-span-2 bg-[#040d21]/95 border border-white/10 rounded-2xl p-5 h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          <div className="space-y-4">
            {transcripts.map((line, idx) => {
              const isActive = idx === activeIndex;
              const text = locale === "es" ? line.es : line.en;

              return (
                <div
                  key={idx}
                  onClick={() => seekTo(line.time)}
                  className={`cursor-pointer pl-4 border-l-2 py-1 transition-all duration-200 hover:pl-5 group ${
                    isActive
                      ? "border-blue-400 text-white font-semibold scale-[1.01]"
                      : "border-white/5 text-white/40 hover:text-white/70"
                  }`}
                  style={{
                    borderLeftColor: isActive ? color : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono shrink-0 ${
                      isActive ? "text-blue-400" : "text-white/20"
                    }`} style={{ color: isActive ? color : undefined }}>
                      {formatTime(line.time)}
                    </span>
                    <p className="text-xs leading-relaxed">{text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
