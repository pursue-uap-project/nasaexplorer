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

export default function ApodView() {
  const t = useTranslations("apod");
  const [apod, setApod] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_NASA_API_KEY ?? "DEMO_KEY";
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setApod(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="rounded-2xl bg-gray-200 w-full h-[60vh]" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
          <div className="h-3 bg-gray-100 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (!apod) {
    return (
      <div className="rounded-2xl bg-foreground/5 p-16 text-center">
        <p className="text-4xl mb-4">🔭</p>
        <p className="text-foreground/50">{t("error")}</p>
      </div>
    );
  }

  const shortExplanation = apod.explanation.slice(0, 380);
  const isLong = apod.explanation.length > 380;

  return (
    <div>
      {/* Media */}
      <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 mb-6">
        {apod.media_type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={apod.hdurl ?? apod.url}
            alt={apod.title}
            className="w-full max-h-[75vh] object-cover"
          />
        ) : (
          <div className="aspect-video bg-black">
            <iframe
              src={apod.url}
              className="w-full h-full"
              allowFullScreen
              title={apod.title}
            />
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-3 text-xs text-foreground/40 font-mono">
          <time>{apod.date}</time>
          {apod.copyright && <span>© {apod.copyright.trim()}</span>}
        </div>

        <h2 className="text-3xl font-bold text-primary mb-4 leading-tight">{apod.title}</h2>

        <p className="text-foreground/70 leading-relaxed text-sm">
          {expanded || !isLong ? apod.explanation : shortExplanation + "…"}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-3 text-sm text-primary hover:underline font-medium"
          >
            {expanded ? t("show_less") : t("show_more")}
          </button>
        )}
      </div>
    </div>
  );
}
