"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface StreamConfig {
  id: string;
  hlsUrl: string;
  ytFallbackId: string;
  label: string;
  flag: string;
}

export default function LiveStreams() {
  const t = useTranslations("live");
  const [hlsLoaded, setHlsLoaded] = useState(false);
  const [useYtFallback, setUseYtFallback] = useState<Record<string, boolean>>({});
  
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const streams: StreamConfig[] = [
    {
      id: "nasa-public",
      hlsUrl: "https://nasa-otd.akamaized.net/hls/live/2032332/NASA-OTD1-HD/master.m3u8",
      ytFallbackId: "FuuC4dpSQ1M",
      label: t("nasa_channel"),
      flag: "🇺🇸",
    },
    {
      id: "nasa-es",
      hlsUrl: "https://nasa-otd.akamaized.net/hls/live/2032334/NASA-OTD2-HD/master.m3u8", // media channel as HLS fallback, or YT
      ytFallbackId: "21X5lGlDOfg", // YouTube NASA en Español
      label: t("nasa_es_channel"),
      flag: "🇪🇸",
    },
  ];

  // Dynamic HLS.js Script Loader
  useEffect(() => {
    if (typeof window === "undefined" || (window as any).Hls) {
      setHlsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js";
    script.async = true;
    script.onload = () => {
      setHlsLoaded(true);
    };
    script.onerror = () => {
      // Script load failed: fallback all to YouTube
      const fallbacks: Record<string, boolean> = {};
      streams.forEach(s => { fallbacks[s.id] = true; });
      setUseYtFallback(fallbacks);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize HLS streams on video elements
  useEffect(() => {
    if (!hlsLoaded) return;

    streams.forEach(stream => {
      const video = videoRefs.current[stream.id];
      if (!video || useYtFallback[stream.id]) return;

      const HlsClass = (window as any).Hls;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari/iOS)
        video.src = stream.hlsUrl;
      } else if (HlsClass && HlsClass.isSupported()) {
        // Hls.js fallback
        const hls = new HlsClass();
        hls.loadSource(stream.hlsUrl);
        hls.attachMedia(video);
        
        hls.on(HlsClass.Events.ERROR, (event: any, data: any) => {
          if (data.fatal) {
            console.warn(`HLS error for stream ${stream.id}, falling back to YouTube.`, data);
            setUseYtFallback(prev => ({ ...prev, [stream.id]: true }));
            hls.destroy();
          }
        });
      } else {
        // HLS not supported at all: fallback to YouTube
        setUseYtFallback(prev => ({ ...prev, [stream.id]: true }));
      }
    });
  }, [hlsLoaded, useYtFallback]);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white tracking-[0.02em] mb-2">{t("live_title")}</h2>
      <p className="text-white/50 text-sm mb-6">NASA TV · 24/7</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {streams.map((stream) => (
          <div key={stream.id} className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-[#040D21]/80 backdrop-blur-xl">
            {useYtFallback[stream.id] ? (
              // YouTube Embed Fallback
              <iframe
                src={`https://www.youtube.com/embed/${stream.ytFallbackId}?rel=0&modestbranding=1`}
                title={stream.label}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              // Native/Hls.js Video tag
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video
                  ref={el => { videoRefs.current[stream.id] = el; }}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full"
                  onError={() => {
                    // Triggers YouTube fallback if native playback fails
                    setUseYtFallback(prev => ({ ...prev, [stream.id]: true }));
                  }}
                />
              </div>
            )}
            
            <div className="px-4 py-3 bg-[#040D21] border-t border-white/5 flex items-center gap-2">
              <span className="text-lg">{stream.flag}</span>
              <span className="font-semibold text-sm text-white/80">{stream.label}</span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-white/50 font-mono tracking-wider">
                  {useYtFallback[stream.id] ? "LIVE (YT)" : "LIVE (HLS)"}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
