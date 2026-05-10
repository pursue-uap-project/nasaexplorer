"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/missions", label: t("missions") },
    { href: "/active",   label: t("active") },
    { href: "/timeline", label: t("timeline") },
    { href: "/solar",    label: t("solar") },
    { href: "/iss",      label: t("iss") },
    { href: "/live",     label: t("live") },
    { href: "/apod",     label: t("apod") },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <img src="/nasaexplorer/nasa-logo.png" alt="NASA" className="h-8 w-auto" />
          <span className="hidden sm:inline font-bold text-primary tracking-tight text-lg leading-none">
            Explorer
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-0.5">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ${
                  isActive(href)
                    ? "bg-primary text-white shadow-sm"
                    : "text-foreground/55 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Language switcher */}
        <div className="flex items-center gap-1 shrink-0">
          {(["en", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => router.replace(pathname, { locale: l })}
              className={`text-xs px-2.5 py-1 rounded font-mono uppercase transition-all duration-150 ${
                locale === l
                  ? "bg-primary text-white shadow-sm"
                  : "text-foreground/40 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile scrollable links */}
      <div className="md:hidden border-t border-slate-100">
        <ul className="flex overflow-x-auto px-4 gap-1 py-2 scrollbar-none">
          {links.map(({ href, label }) => (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                className={`text-xs px-3 py-1.5 rounded-full block font-medium transition-all duration-150 ${
                  isActive(href)
                    ? "bg-primary text-white shadow-sm"
                    : "text-foreground/50 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
