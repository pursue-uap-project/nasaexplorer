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
    { href: "/solar",    label: t("solar") },
    { href: "/iss",      label: t("iss") },
    { href: "/live",     label: t("live") },
    { href: "/apod",     label: t("apod") },
    { href: "/search",   label: "🔍 " + t("search") },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="bg-[#040D21]/85 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-50 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <img src="/nasaexplorer/nasa-logo.png" alt="NASA" className="h-8 w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity" />
          <span className="hidden sm:inline font-bold text-white/85 tracking-[0.04em] text-lg leading-none group-hover:text-white transition-colors">
            Explorer
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-0.5">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium tracking-[0.03em] transition-all duration-150 ${
                  isActive(href)
                    ? "bg-white/[0.12] text-white ring-1 ring-inset ring-white/20"
                    : "text-white/50 hover:text-white hover:bg-white/[0.07]"
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
              className={`text-xs px-2.5 py-1 rounded font-mono uppercase tracking-widest transition-all duration-150 ${
                locale === l
                  ? "bg-white/15 text-white ring-1 ring-inset ring-white/20"
                  : "text-white/35 hover:text-white hover:bg-white/[0.07]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile scrollable links */}
      <div className="md:hidden border-t border-white/[0.06]">
        <ul className="flex overflow-x-auto px-4 gap-1 py-2 scrollbar-none">
          {links.map(({ href, label }) => (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                className={`text-xs px-3 py-1.5 rounded-full block font-medium tracking-[0.03em] transition-all duration-150 ${
                  isActive(href)
                    ? "bg-white/[0.12] text-white ring-1 ring-inset ring-white/15"
                    : "text-white/45 hover:text-white hover:bg-white/[0.07]"
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
