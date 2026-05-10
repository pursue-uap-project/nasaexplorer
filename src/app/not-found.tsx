"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const copy = {
  en: {
    code: "Error 404",
    heading: "Houston, we have a problem.",
    body: "This page drifted out of orbit. Let’s get you back on course.",
    cta: "Back to Mission Control",
    href: "/en/",
  },
  es: {
    code: "Error 404",
    heading: "Houston, tenemos un problema.",
    body: "Esta página se perdió en el espacio. Te llevamos de vuelta a la base.",
    cta: "Volver al Control de Misión",
    href: "/es/",
  },
};

export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname?.includes("/es") ? "es" : "en";
  const c = copy[locale];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/60 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%]  w-[500px] h-[500px] bg-blue-100/60  rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-8%] w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 max-w-md">
        <img
          src="/nasaexplorer/nasa-logo.png"
          alt="NASA"
          className="h-16 w-auto opacity-35"
        />

        <p className="text-xs font-mono tracking-[0.3em] text-foreground/30 uppercase">
          {c.code}
        </p>

        <h1 className="text-4xl sm:text-5xl font-bold text-primary leading-tight">
          {c.heading}
        </h1>

        <p className="text-foreground/50 leading-relaxed">
          {c.body}
        </p>

        <Link
          href={c.href}
          className="mt-2 bg-primary text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
        >
          {c.cta}
        </Link>
      </div>
    </main>
  );
}
