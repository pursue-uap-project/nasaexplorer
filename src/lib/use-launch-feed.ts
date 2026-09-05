"use client";

/**
 * Hook compartido del feed de lanzamientos.
 *
 * La portada pinta el mismo dato en dos sitios (la barra de telemetría del hero
 * y el tablero de lanzamientos). Sin este módulo cada componente lanzaría su
 * propia petición a Launch Library en cada visita: dos llamadas idénticas a una
 * API pública con límite de cuota. `inFlight` guarda la promesa en curso a nivel
 * de módulo, así que la primera llamada la comparten todos los suscriptores.
 *
 * El valor inicial es SIEMPRE la instantánea horneada por el cron, nunca `null`:
 * el HTML del export estático y el del primer render del cliente coinciden y no
 * hay error de hidratación.
 */

import { useEffect, useState } from "react";
import { BAKED_LAUNCHES, fetchLaunches, type LaunchFeed } from "@/lib/launches";

let cached: LaunchFeed | null = null;
let inFlight: Promise<LaunchFeed> | null = null;

function load(): Promise<LaunchFeed> {
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = fetchLaunches()
      .then((feed) => {
        cached = feed;
        return feed;
      })
      .catch(() => BAKED_LAUNCHES)
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export function useLaunchFeed(): {
  feed: LaunchFeed;
  live: boolean;
  /** Próximos lanzamientos que aún no han despegado. */
  upcoming: LaunchFeed["upcoming"];
} {
  const [feed, setFeed] = useState<LaunchFeed>(cached ?? BAKED_LAUNCHES);
  const [live, setLive] = useState(cached !== null);
  // `null` hasta que monta: la instantánea horneada puede tener semanas y sus
  // primeros «próximos» ya haber despegado, pero filtrar por la hora del cliente
  // durante el primer render rompería la hidratación del export estático.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    // El primer `now` va en un timeout de 0 y no en el cuerpo del efecto:
    // `react-hooks/set-state-in-effect` marca el setState síncrono, y el CI del
    // monorepo trata los warnings como fatales.
    const first = setTimeout(() => alive && setNow(Date.now()), 0);
    const id = setInterval(() => alive && setNow(Date.now()), 30_000);
    load().then((f) => {
      if (!alive) return;
      setFeed(f);
      setLive(true);
    });
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const upcoming =
    now === null ? feed.upcoming : feed.upcoming.filter((l) => new Date(l.net).getTime() > now);

  return { feed, live, upcoming };
}
