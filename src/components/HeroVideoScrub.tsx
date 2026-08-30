"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number";

interface HeroVideoScrubProps {
  statsMissionsLabel: string;
  statsYearsLabel: string;
  statsProgramsLabel: string;
}

export default function HeroVideoScrub({
  statsMissionsLabel,
  statsYearsLabel,
  statsProgramsLabel,
}: HeroVideoScrubProps) {
  const t = useTranslations("home");
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [progress, setProgress] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Target current time for smooth inertia damping
  const targetTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setIsVideoLoaded(true);
    };

    if (video.readyState >= 1) {
      setIsVideoLoaded(true);
    } else {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) return;

      // Calculate scroll progress from 0 to 1
      const currentScroll = Math.max(0, -rect.top);
      const rawProgress = Math.min(1, Math.max(0, currentScroll / totalScrollable));
      
      setProgress(rawProgress);

      if (video.duration) {
        targetTimeRef.current = rawProgress * video.duration;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Smooth inertia interpolation loop for video.currentTime
    const updateVideoFrame = () => {
      if (video && video.duration) {
        const diff = targetTimeRef.current - video.currentTime;
        if (Math.abs(diff) > 0.001) {
          // Damped lerp for silky smooth frame scrubbing
          video.currentTime += diff * 0.18;
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateVideoFrame);
    };

    animationFrameRef.current = requestAnimationFrame(updateVideoFrame);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVideoLoaded]);

  // Calculations for progress-locked typography stages
  // Stage 1: 0.0 - 0.32
  const stage1Opacity = Math.max(0, Math.min(1, (0.30 - progress) / 0.15));
  const stage1Y = (progress / 0.30) * -30;

  // Stage 2: 0.35 - 0.68
  let stage2Opacity = 0;
  if (progress >= 0.28 && progress <= 0.72) {
    if (progress < 0.45) {
      stage2Opacity = (progress - 0.28) / 0.17;
    } else if (progress > 0.58) {
      stage2Opacity = (0.72 - progress) / 0.14;
    } else {
      stage2Opacity = 1;
    }
  }
  const stage2Y = (progress - 0.5) * -40;

  // Stage 3: 0.70 - 1.0
  const stage3Opacity = Math.max(0, Math.min(1, (progress - 0.68) / 0.18));
  const stage3Y = (1 - Math.max(0, (progress - 0.68) / 0.32)) * 30;

  const stats = [
    { num: 300, suffix: "+", label: statsMissionsLabel },
    { num: 65, suffix: "+", label: statsYearsLabel },
    { num: 10, suffix: "+", label: statsProgramsLabel },
  ];

  return (
    <section ref={containerRef} className="relative w-full h-[280vh] bg-black">
      {/* Sticky Fullscreen Media Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Background Space Video */}
        <video
          ref={videoRef}
          src="/nasaexplorer/assets/hero_space.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover scale-[1.02] filter brightness-90 contrast-105 transition-opacity duration-700"
          style={{ opacity: isVideoLoaded ? 1 : 0 }}
        />

        {/* Fallback space background if video is loading */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/40 to-slate-950 animate-pulse flex items-center justify-center">
            <span className="text-xs uppercase tracking-[0.3em] text-cyan-400/60 font-mono">
              Initializing Space Telemetry…
            </span>
          </div>
        )}

        {/* Cinematic Vignette & Color Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90 pointer-events-none" />

        {/* ── STAGE 1: Main Title & Orbital Intro (0.0 - 0.30) ── */}
        <div
          className="absolute z-20 flex flex-col items-center text-center px-4 max-w-4xl transition-transform duration-75 ease-out pointer-events-none"
          style={{
            opacity: stage1Opacity,
            transform: `translateY(${stage1Y}px)`,
            pointerEvents: stage1Opacity > 0.2 ? "auto" : "none",
          }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono tracking-[0.25em] text-cyan-200 uppercase">
              {t("scrub_subtitle_1")}
            </span>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nasaexplorer/nasa-logo.png"
            alt="NASA"
            className="h-20 sm:h-28 w-auto brightness-0 invert opacity-95 drop-shadow-[0_10px_35px_rgba(0,180,255,0.3)] mb-4"
          />

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none drop-shadow-2xl">
            {t("title")}
          </h1>

          <p className="mt-4 text-lg sm:text-2xl text-slate-300 max-w-2xl font-light leading-relaxed drop-shadow">
            {t("subtitle")}
          </p>

          {/* Scroll Nudge Indicator */}
          <div className="mt-10 flex flex-col items-center gap-2 text-slate-400/80 animate-bounce">
            <span className="text-xs font-mono tracking-widest uppercase text-cyan-400/80">
              {t("scroll_nudge")}
            </span>
            <svg
              className="w-5 h-5 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* ── STAGE 2: Deep Space Telemetry & Stats (0.35 - 0.68) ── */}
        <div
          className="absolute z-20 flex flex-col items-center text-center px-4 max-w-5xl transition-transform duration-75 ease-out"
          style={{
            opacity: stage2Opacity,
            transform: `translateY(${stage2Y}px)`,
            pointerEvents: stage2Opacity > 0.2 ? "auto" : "none",
          }}
        >
          <span className="text-xs font-mono tracking-[0.3em] text-cyan-400 uppercase font-semibold mb-2">
            — {t("scrub_stage_2_tag")} —
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase mb-8 drop-shadow-lg">
            {t("scrub_stage_2_title")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl">
            {stats.map(({ num, suffix, label }, i) => (
              <div
                key={label}
                className="group relative bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="absolute -top-3 left-6 px-2 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-[10px] font-mono text-cyan-300 uppercase">
                  RECORD {i + 1}
                </div>
                <p className="text-4xl sm:text-5xl font-black text-cyan-400 tracking-tight">
                  <CountingNumber number={num} inView={stage2Opacity > 0.5} delay={i * 150} />
                  <span className="text-cyan-200">{suffix}</span>
                </p>
                <p className="text-slate-300 text-xs sm:text-sm font-medium uppercase tracking-wider mt-2">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── STAGE 3: Final Launch & CTA (0.70 - 1.0) ── */}
        <div
          className="absolute z-20 flex flex-col items-center text-center px-4 max-w-3xl transition-transform duration-75 ease-out"
          style={{
            opacity: stage3Opacity,
            transform: `translateY(${stage3Y}px)`,
            pointerEvents: stage3Opacity > 0.2 ? "auto" : "none",
          }}
        >
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
            {t("scrub_stage_3_title")}
          </h2>
          <p className="mt-4 text-base sm:text-xl text-slate-300 font-light max-w-xl">
            {t("scrub_stage_3_subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/missions"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-[0_0_30px_rgba(0,180,255,0.4)] hover:shadow-[0_0_45px_rgba(0,180,255,0.7)] hover:scale-105 transition-all duration-300"
            >
              <span>{t("cta")}</span>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/iss"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-semibold text-base px-6 py-4 rounded-full transition-all"
            >
              <span>ISS Live Tracker</span>
            </Link>
          </div>
        </div>

        {/* Progress Bar Line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 transition-all duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}
