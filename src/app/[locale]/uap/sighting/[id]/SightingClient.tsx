"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";

interface UapStory {
  id: string;
  meta: string;
  year: string;
  agency: string;
  region: string;
  tags: string[];
  title_es: string;
  title_en: string;
  body_es: string;
  body_en: string;
  image: string;
  images?: string[];
  video?: string;
  url: string;
}

interface SightingClientProps {
  story: UapStory;
  locale: string;
}

export default function SightingClient({ story, locale }: SightingClientProps) {
  const t = useTranslations("uap");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const title = locale === "es" ? story.title_es : story.title_en;
  const body = locale === "es" ? story.body_es : story.body_en;

  const visualAssets = useMemo(() => {
    if (story.images && story.images.length > 0) {
      return story.images;
    }
    if (story.image) {
      return [story.image];
    }
    return [];
  }, [story]);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 relative z-20">
      
      {/* Back Link */}
      <div className="mb-8 font-mono">
        <Link
          href="/uap"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
        >
          &lt; {t("back_to_archive")}
        </Link>
      </div>

      {/* Outer terminal window border */}
      <div className="border border-emerald-500/25 rounded-lg bg-slate-950 overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.05)]">
        
        {/* Terminal Window Header Bar */}
        <div className="bg-slate-900 border-b border-emerald-500/20 px-4 py-3 flex items-center justify-between font-mono text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/30 border border-green-500/40" />
            <span className="text-emerald-500 font-bold ml-2">CLASSIFIED_RECORD_#{story.id.toUpperCase()}</span>
          </div>
          <span className="text-slate-500">SYSTEM_OK // STABLE</span>
        </div>

        {/* Sighting Details Body */}
        <div className="p-6 md:p-8">
          
          {/* Metadata tags line */}
          <div className="flex flex-wrap items-center gap-3 mb-6 font-mono text-xs">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-bold uppercase">
              {story.agency.toUpperCase()}
            </span>
            <span className="text-slate-500">
              {story.meta}
            </span>
            <span className="text-slate-600 ml-auto hidden sm:inline">
              YEAR: {story.year}
            </span>
          </div>

          {/* Sighting Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase font-mono border-b border-emerald-500/20 pb-4 mb-6 leading-tight">
            {title}
          </h1>

          {/* Video Attachment (HTML5 player) */}
          {story.video && (
            <div className="mb-6 rounded border border-emerald-500/25 bg-slate-900 overflow-hidden shadow-inner">
              <video
                controls
                preload="metadata"
                className="w-full max-h-[450px]"
              >
                <source
                  src={`/nasaexplorer/assets/uap/${story.video.split("/").pop()}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
              <div className="bg-slate-900 px-4 py-2 border-t border-emerald-500/10 font-mono text-[9px] text-slate-500 uppercase tracking-wider">
                Attached Video Feed // Source File: {story.video.split("/").pop()}
              </div>
            </div>
          )}

          {/* Visual attachments (Image grid) */}
          {visualAssets.length > 0 && (
            <div className="mb-6">
              <h3 className="font-mono text-slate-500 text-[10px] uppercase block mb-3 tracking-wider">
                Attached Visual References ({visualAssets.length})
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {visualAssets.map((asset, i) => {
                  const filename = asset.split("/").pop();
                  const cleanPath = `/nasaexplorer/assets/uap/${filename}`;
                  return (
                    <div
                      key={asset}
                      onClick={() => setActiveImage(cleanPath)}
                      className="group relative h-28 md:h-36 rounded overflow-hidden border border-emerald-500/10 bg-slate-900 cursor-zoom-in hover:border-emerald-400 transition-all"
                    >
                      <img
                        src={cleanPath}
                        alt={`${title} - Reference ${i + 1}`}
                        className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-300"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 p-1.5 font-mono text-[8px] text-slate-400 group-hover:text-emerald-400 transition-colors uppercase border-t border-emerald-500/10 truncate">
                        REF_{i + 1}: {filename}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Document Text Content */}
          <div className="space-y-4 font-mono text-sm leading-relaxed text-slate-300 bg-slate-900/20 border border-emerald-500/5 rounded-lg p-5 mb-8">
            <span className="text-emerald-500/60 font-bold block border-b border-emerald-500/10 pb-1 mb-3 text-[10px] tracking-widest uppercase">
              &gt;&gt; DOCUMENT_DECRYPTION_LOG
            </span>
            <p className="whitespace-pre-line">{body}</p>
          </div>

          {/* File Source Block */}
          <div className="border border-emerald-500/20 bg-slate-900/50 rounded-lg p-5 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-slate-500 uppercase text-[9px] block mb-1 tracking-wider">
                {t("source_label")}
              </span>
              <span className="text-slate-300 break-all font-bold">
                {story.url.split("/").pop()}
              </span>
            </div>
            
            <a
              href={story.url}
              target="_blank"
              rel="noopener"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase tracking-wider rounded text-[10px] tracking-wide transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] whitespace-nowrap"
            >
              {t("access_file")}
            </a>
          </div>

          {/* Tags row */}
          <div className="mt-8 pt-6 border-t border-emerald-500/10 flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 border border-emerald-500/25 rounded font-mono text-[9px] text-emerald-400 uppercase bg-emerald-500/5"
              >
                #{tag}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* Lightbox for visual references */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setActiveImage(null)}
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:text-white px-3 py-1 rounded font-mono text-xs uppercase transition-colors"
            >
              [Close]
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={activeImage}
              alt="Classified Sighting Reference Enlarged"
              className="max-w-full max-h-[85vh] object-contain border border-emerald-500/20 rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
