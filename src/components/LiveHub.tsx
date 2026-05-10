"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

type ApodData = {
  title: string;
  url: string;
  hdurl?: string;
  media_type: string;
  explanation: string;
  date: string;
  copyright?: string;
};

export default function LiveHub() {
  const t = useTranslations("live");
  const [apod, setApod] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_NASA_API_KEY ?? "DEMO_KEY";
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setApod(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-foreground/5 p-12 text-center text-foreground/40 animate-pulse">
        Loading…
      </div>
    );
  }

  if (!apod) {
    return (
      <div className="rounded-2xl bg-foreground/5 p-12 text-center text-foreground/40">
        {t("no_apod")}
      </div>
    );
  }

  return (
    <section className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {apod.media_type === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={apod.hdurl ?? apod.url}
          alt={apod.title}
          className="w-full max-h-[60vh] object-cover"
        />
      )}
      {apod.media_type === "video" && (
        <iframe
          src={apod.url}
          className="w-full aspect-video"
          allowFullScreen
          title={apod.title}
        />
      )}
      <div className="p-6 bg-white">
        <div className="flex items-center justify-between mb-3">
          <time className="text-xs font-mono text-foreground/40">{apod.date}</time>
          {apod.copyright && (
            <span className="text-xs text-foreground/35">© {apod.copyright.trim()}</span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-primary mb-3">{apod.title}</h2>
        <p className="text-sm text-foreground/70 leading-relaxed">{apod.explanation}</p>
      </div>
    </section>
  );
}
