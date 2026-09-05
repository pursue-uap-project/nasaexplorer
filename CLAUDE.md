# CLAUDE.md

## Project: nasaexplorer
Portal divulgativo bilingüe (ES/EN) sobre el programa espacial: lanzamientos, misiones
en curso, seguimiento de la ISS, imagen astronómica del día y archivo histórico de
misiones de la NASA.

**La web pública NO se sirve desde este repo.** Sale de `pursue-uap-project/nasaexplorer`
→ https://pursue-uap-project.github.io/nasaexplorer/. Commitear aquí **no despliega nada**
por sí solo: el espejo lo hace el job `mirror` de `.github/workflows/nasaexplorer-sync.yml`
del monorepo, que necesita el secret `PAGES_KEY_NASAEXPLORER`.

## Stack
- **Next.js 16 (App Router) + React 19 + TypeScript**, con `output: "export"`
  (**estático**: no hay servidor, no hay rutas de API, no hay `revalidate`).
- `basePath: "/nasaexplorer"` — toda ruta a `public/` se escribe
  `${process.env.NEXT_PUBLIC_BASE_PATH}/…`, nunca `/assets/…` a pelo.
- **i18n**: next-intl (EN/ES). Mensajes en `src/i18n/messages/{en,es}.json`.
- **Mapas**: Leaflet (import dinámico; rompe en SSR).
- **Animación**: framer-motion. **Estado**: zustand.
- **Estilo**: Tailwind CSS v4 con tokens en `@theme` (`src/app/globals.css`).

> No hay React Three Fiber ni visor 3D. `public/models/` se borró: eran 18 MB de `.glb`
> que no cargaba ningún componente. Si algún día vuelve el visor, vuelven los modelos.

## Comandos
- `npm run dev` · `npm run build` (genera `out/`) · `npm run lint` · `npx tsc --noEmit`
- El CI trata los **warnings de ESLint como fatales** (regla del monorepo). Ojo con
  `react-hooks/set-state-in-effect`: si el `setState` en un efecto es inevitable, va
  dentro de un `setTimeout(…, 0)`.

## Sistema de color
Dos superficies deliberadas y documentadas en `globals.css`:
- **Chrome oscuro** (`--surface-dark`, texto `--on-dark*`): navbar, footer, portada,
  lanzamientos, misiones en curso.
- **Tarjeta clara** (`--card*`, texto `--ink/--body/--muted/--faint`): bloques de datos
  dentro de páginas de contenido.

La jerarquía se expresa **con token de color, nunca con opacidad** (`text-foreground/40`
era la causa del fallo de contraste que arregló `audit.md`). Nada de glassmorphism como
contenedor por defecto ni emoji como iconografía.

## Portada (`src/app/[locale]/page.tsx`)
Cinco bloques, todos alimentados por datos reales:

| Componente | Qué pinta | Fuente |
|---|---|---|
| `HomeHero` | foto real del archivo NASA + barra de telemetría | JWST NGC 3324 · Launch Library 2 |
| `HomeLaunchBoard` | próximos 6 lanzamientos | Launch Library 2 (vivo + horneado) |
| `HomeMissionGrid` | las 4 misiones de `ACTIVE_MISSIONS` | `src/lib/nasa.ts` |
| `HomeApodCard` | imagen astronómica de hoy | `src/data/apod.json` + `api.nasa.gov` en vivo |
| `HomeIndex` | índice de secciones + procedencia de datos | — |

`useLaunchFeed()` (`src/lib/use-launch-feed.ts`) comparte **una sola** petición a LL2
entre el hero y el tablero, y filtra los lanzamientos ya despegados usando un `now`
que solo existe tras montar (si se filtrara en el primer render se rompería la
hidratación del export estático).

## Reglas de contenido — IMPORTANTES
- **Nada de imágenes generadas por IA.** Toda foto de misión sale del archivo público
  (`images.nasa.gov`), va acreditada y enlaza a su ficha por `nasa_id`. Las anteriores
  eran ilustraciones de IA — una llevaba la marca de agua del generador visible y otra
  un transbordador inventado rotulado «STARGAZER» con el logotipo de la NASA — y en un
  portal cuyo argumento es «datos reales» eso desmiente todo lo demás.
- **Las imágenes se sirven en WebP optimizado**, no en PNG de origen. Los cuatro héroes
  de misión pesaban 33 MB en PNG; ahora 0,5 MB en WebP a 1440 px.
- **Nada de cifras decorativas.** Fuera los contadores del tipo «300+ misiones»: si un
  número aparece, sale de un dato real y se dice de dónde.
- `ACTIVE_MISSIONS` y `MISSIONS` en `src/lib/nasa.ts` están escritos a mano: son el único
  contenido del sitio que no viene de una API y por tanto el único que puede quedarse
  obsoleto en silencio. Lo vigila `scripts/check-mission-dates.mjs` (ver abajo), pero el
  guardia no sustituye a mirar la fuente al tocar una fecha.

## Datos volátiles
`scripts/sync-space-data.mjs` (lo lanza `nasaexplorer-sync.yml` en el monorepo) hornea:
- `src/data/launches.json` — cada 15 días. LL2 manda CORS, así que además se refresca en
  el navegador en cada visita; el JSON es la foto inicial (pinta al instante, indexable).
- `src/data/apod.json` — **cada día a las 06:00 UTC**. La portada y `/apod` piden la
  imagen en vivo, pero sin clave propia esa petición sale con `DEMO_KEY`, compartida
  por todo el mundo y en 429 buena parte del día. El JSON horneado es lo que se pinta
  en el primer render; el fetch del navegador solo lo mejora. Si `api.nasa.gov` falla,
  el script cae a `apod.nasa.gov/apod/astropix.html`, que no pide clave.
- `src/data/live-channels.json` — **cada 30 min**. Un id de directo de YouTube dura horas;
  esto NO se puede hacer en cliente (ni el RSS ni `/@handle/live` mandan CORS).

## Guardia del catálogo
`scripts/check-mission-dates.mjs` lo lanza el job `catalogo` de `nasaexplorer-sync.yml`
(cron quincenal y a mano) y falla en rojo si el catálogo miente:

- `planned` con la fecha ya pasada, o `completed`/`active` con fecha futura.
- `countdownTarget` vencido.
- Discrepancia contra Launch Library 2, solo para misiones de 2015 en adelante
  (LL2 no cubre Mercury ni Apollo con fiabilidad).

```bash
node scripts/check-mission-dates.mjs           # todo
node scripts/check-mission-dates.mjs --local   # sin red, solo coherencia interna
```

Lee `nasa.ts` **como texto, con expresión regular**, porque el fichero no se puede
importar desde Node (importa `./youtube` sin extensión). Si un refactor cambia la forma
del catálogo el parser dejaría de encajar, así que aborta si saca menos de 15 misiones:
un guardia ciego que pasa en verde es peor que no tenerlo.

Nació de un caso real: Artemis II figuraba como `2026-09-30 / planned` con el comentario
«Updated to September 2026 for a long countdown» cuando había despegado el 2026-04-01.

## Arquitectura
```
src/app/[locale]/   → páginas (missions, launches, active, solar, iss, live, apod, search)
src/components/     → UI. Home*.tsx son los bloques de la portada
src/lib/            → nasa.ts (catálogo + APIs), launches.ts, live-channels.ts, youtube.ts
src/data/           → JSON horneado por el cron + astronautas y glosario
src/i18n/messages/  → en.json · es.json
scripts/            → sync-space-data.mjs (cron) · check-mission-dates.mjs (guardia)
public/assets/      → fotografías reales del archivo NASA, en WebP
```

## Claves de API
No hay servidor: lo que se consulta desde el navegador usa
`NEXT_PUBLIC_NASA_API_KEY` con `DEMO_KEY` como respaldo (APOD). `NASA_API_KEY` solo
existe en build (fotos de róveres marcianos). Nunca subir claves al repo.
