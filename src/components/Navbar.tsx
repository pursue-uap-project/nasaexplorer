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
    { href: "/active", label: t("active") },
    { href: "/timeline", label: t("timeline") },
    { href: "/explorer", label: t("explorer") },
    { href: "/live", label: t("live") },
  ];

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="text-accent text-xl">✦</span>
          <span className="hidden sm:inline tracking-tight">NASA Explorer</span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                  pathname.startsWith(href)
                    ? "bg-white/15 text-white"
                    : "text-white/65 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          {(["en", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => router.replace(pathname, { locale: l })}
              className={`text-xs px-2.5 py-1 rounded font-mono uppercase transition-colors ${
                locale === l
                  ? "bg-accent text-white"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </nav>

      <div className="md:hidden border-t border-white/10">
        <ul className="flex overflow-x-auto px-4 gap-1 py-2 scrollbar-none">
          {links.map(({ href, label }) => (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                className={`text-xs px-3 py-1.5 rounded-full block font-medium transition-colors ${
                  pathname.startsWith(href)
                    ? "bg-white/15 text-white"
                    : "text-white/55 hover:text-white"
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
