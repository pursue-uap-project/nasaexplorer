"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchText, setGlitchText] = useState("");
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    const isPrevUap = prevPath.includes("/uap") || prevPath.includes("/uap/");
    const isCurrUap = pathname.includes("/uap") || pathname.includes("/uap/");

    // Check if we crossed portal boundary (NASA <-> UAP)
    if (isPrevUap !== isCurrUap) {
      if (isCurrUap) {
        setGlitchText("DECRYPTING SECURE SIGNAL... ACCESSING DECLASSIFIED UAP ARCHIVES...");
      } else {
        setGlitchText("TERMINATING SECURE LINK... RESTORING GENERAL NASA DATABASES...");
      }
      setIsGlitching(true);
      const timer = setTimeout(() => {
        setIsGlitching(false);
      }, 1000); // Glitch duration: 1.0s
      
      // Update ref immediately so we don't loop
      prevPathRef.current = pathname;
      return () => clearTimeout(timer);
    }
    prevPathRef.current = pathname;
  }, [pathname]);

  return (
    <div className="relative flex flex-col flex-1">
      {/* Glitch Overlay */}
      <AnimatePresence>
        {isGlitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.9, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, times: [0, 0.1, 0.2, 0.8, 0.9, 1] }}
            className="fixed inset-0 z-50 bg-[#020813] flex flex-col items-center justify-center font-mono overflow-hidden pointer-events-none select-none"
          >
            {/* Scanlines visual effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%),linear-gradient(90deg,rgba(16,185,129,0.06),rgba(0,255,0,0.01),rgba(16,185,129,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none" />
            
            {/* CRT Screen Flickering effect */}
            <div className="absolute inset-0 bg-transparent animate-[flicker_0.15s_infinite] pointer-events-none" />

            {/* Glowing noise background */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.9)_100%)]" />

            {/* Decrypting characters matrix */}
            <div className="absolute inset-0 opacity-15 select-none flex flex-wrap content-start gap-1 p-4 overflow-hidden text-emerald-500 text-[10px]">
              {Array.from({ length: 400 }).map((_, i) => (
                <span key={i} className="animate-[pulse_1.5s_infinite]">
                  {Math.random() > 0.5 ? "0" : "1"}
                </span>
              ))}
            </div>

            {/* Main Alert Message */}
            <div className="relative z-10 text-center px-6 max-w-lg flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-emerald-500/50 flex items-center justify-center mb-6 animate-[pulse_1s_infinite] bg-emerald-950/20">
                <span className="text-emerald-400 font-bold text-2xl font-mono animate-ping absolute">!</span>
                <span className="text-emerald-400 font-bold text-2xl font-mono relative">!</span>
              </div>
              
              <h2 className="text-emerald-500 text-lg font-bold uppercase tracking-[0.25em] mb-4 animate-[pulse_0.8s_infinite]">
                PORTAL LINK OVERLAY
              </h2>
              
              <p className="text-emerald-400/90 text-xs sm:text-sm leading-relaxed tracking-wider max-w-sm">
                {glitchText}
              </p>
              
              <div className="mt-8 flex justify-center items-center gap-2 text-xs text-emerald-600 font-mono">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>CROSSING SECURED ROUTE GATES...</span>
              </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes flicker {
                0% { opacity: 0.97; }
                50% { opacity: 1; }
                100% { opacity: 0.98; }
              }
            `}} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: isGlitching ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut", delay: isGlitching ? 0.75 : 0 }}
        className="flex flex-col flex-1"
      >
        {children}
      </motion.div>
    </div>
  );
}
