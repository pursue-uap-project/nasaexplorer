"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export default function Footer() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const credits =
    locale === "es"
      ? "Datos e imágenes cortesía de"
      : "Data & imagery courtesy of";

  return (
    <footer className="border-t border-white/[0.07] bg-[#040D21]/80 backdrop-blur-xl mt-auto shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/35">

        {/* Left: NASA credits */}
        <div className="flex items-center gap-2.5">
          <img src="/nasaexplorer/nasa-logo.png" alt="NASA" className="h-5 w-auto brightness-0 invert opacity-30" />
          <span>
            {credits}{" "}
            <a
              href="https://www.nasa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              NASA
            </a>
          </span>
        </div>

        {/* Right: repo + lang switcher */}
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/pursue-uap-project/nasaexplorer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>

          <div className="flex items-center gap-1">
            {(["en", "es"] as const).map((l) => (
              <button
                key={l}
                onClick={() => router.replace(pathname, { locale: l })}
                className={`text-xs px-2.5 py-1 rounded font-mono uppercase tracking-widest transition-colors ${
                  locale === l
                    ? "bg-white/15 text-white"
                    : "hover:text-white hover:bg-white/[0.07]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
