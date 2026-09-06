"use client";

/**
 * Barra de navegación.
 *
 * Eran nueve enlaces sueltos en una fila, ya al límite del ancho a 1440 px — al
 * añadir Exoplanetas los enlaces empezaron a envolver a dos líneas y hubo que
 * subir el menú de `md` a `lg`. La décima sección no habría cabido.
 *
 * Ahora hay dos grupos, y no son arbitrarios: separan lo que **cambia solo**
 * (lanzamientos, ISS, directos, imagen del día) de lo que se **consulta**
 * (archivo de misiones, misiones en curso, sistema solar, exoplanetas). Es la
 * misma división que ya usa la portada, y deja sitio para crecer.
 *
 * En móvil se mantiene la fila desplazable con todo plano: un desplegable
 * dentro de otro menú es peor que una fila que se arrastra.
 */

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import Icon, { type IconName } from "@/components/Icon";

type Enlace = { href: string; label: string; icon?: IconName };

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const explorar: Enlace[] = [
    { href: "/missions", label: t("missions") },
    { href: "/active", label: t("active") },
    { href: "/solar", label: t("solar") },
    { href: "/exoplanets", label: t("exoplanets") },
  ];
  const enVivo: Enlace[] = [
    { href: "/launches", label: t("launches") },
    { href: "/iss", label: t("iss") },
    { href: "/live", label: t("live") },
    { href: "/apod", label: t("apod") },
  ];
  const todos: Enlace[] = [...explorar, ...enVivo, { href: "/search", label: t("search"), icon: "search" }];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#040D21]/85 shadow-[0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            decoding="async"
            src="/nasaexplorer/nasa-logo.png"
            alt="NASA"
            className="h-8 w-auto opacity-90 brightness-0 invert transition-opacity group-hover:opacity-100"
          />
          <span className="hidden text-lg font-bold leading-none tracking-nav text-white/85 transition-colors group-hover:text-white sm:inline">
            Explorer
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          <li>
            <Menu titulo={t("group_explore")} enlaces={explorar} isActive={isActive} />
          </li>
          <li>
            <Menu titulo={t("group_live")} enlaces={enVivo} isActive={isActive} />
          </li>
          <li>
            <Link
              href="/search"
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium tracking-[0.03em] transition ${
                isActive("/search")
                  ? "bg-white/12 text-white ring-1 ring-inset ring-white/20"
                  : "text-white/50 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon name="search" className="h-3.5 w-3.5" />
              {t("search")}
            </Link>
          </li>
        </ul>

        <div className="flex shrink-0 items-center gap-1">
          {(["en", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => router.replace(pathname, { locale: l })}
              aria-current={locale === l ? "true" : undefined}
              className={`rounded px-2.5 py-1 font-mono text-xs uppercase tracking-widest transition ${
                locale === l
                  ? "bg-white/15 text-white ring-1 ring-inset ring-white/20"
                  : "text-white/35 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </nav>

      {/* Móvil: todo plano en una fila que se arrastra. */}
      <div className="border-t border-white/6 md:hidden">
        <ul className="scrollbar-none flex gap-1 overflow-x-auto px-4 py-2">
          {todos.map(({ href, label, icon }) => (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                className={`block whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium tracking-[0.03em] transition ${
                  isActive(href)
                    ? "bg-white/12 text-white ring-1 ring-inset ring-white/15"
                    : "text-white/45 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                {icon && <Icon name={icon} className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />}
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

/** Desplegable de un grupo. Cierra con Escape y al pinchar fuera. */
function Menu({
  titulo,
  enlaces,
  isActive,
}: {
  titulo: string;
  enlaces: Enlace[];
  isActive: (href: string) => boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const id = useId();
  const activo = enlaces.some((e) => isActive(e.href));

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={id}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium tracking-[0.03em] transition ${
          activo || abierto
            ? "bg-white/12 text-white ring-1 ring-inset ring-white/20"
            : "text-white/50 hover:bg-white/[0.07] hover:text-white"
        }`}
      >
        {titulo}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          className={`h-3 w-3 transition-transform ${abierto ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {abierto && (
        <ul
          id={id}
          className="absolute left-0 top-full z-50 mt-1.5 min-w-52 overflow-hidden rounded-lg border border-white/12 bg-[#0a1526] py-1 shadow-2xl"
        >
          {enlaces.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setAbierto(false)}
                className={`block px-4 py-2 text-sm transition ${
                  isActive(href) ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/8 hover:text-white"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
