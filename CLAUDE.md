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
- **Animación**: framer-motion. (Zustand y el SDK de Cloudinary estaban en
  `package.json` sin que los importara nadie; se retiraron.)
- **Estilo**: Tailwind CSS v4 con tokens en `@theme` (`src/app/globals.css`).

> No hay React Three Fiber ni visor 3D. `public/models/` se borró: eran 18 MB de `.glb`
> que no cargaba ningún componente. Si algún día vuelve el visor, vuelven los modelos.

## Comandos
- `npm run dev` · `npm run build` (genera `out/`) · `npm run lint` · `npx tsc --noEmit`
- `npm test` — runner de Node, sin dependencias. Cubre el parser del guardia
  (que lee TypeScript con expresión regular y puede quedarse ciego en un
  refactor) y la forma de los JSON horneados. Corre en el CI del monorepo.
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
Seis bloques, todos alimentados por datos reales:

| Componente | Qué pinta | Fuente |
|---|---|---|
| `HomeHero` | foto real del archivo NASA + barra de telemetría | JWST NGC 3324 · Launch Library 2 |
| `HomeLaunchBoard` | próximos 6 lanzamientos | Launch Library 2 (vivo + horneado) |
| `HomeMissionGrid` | las 4 misiones de `ACTIVE_MISSIONS` | `src/lib/nasa.ts` |
| `HomeExoplanets` | recuento y últimos confirmados | `src/data/exoplanets.json` |
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
- **Toda foto lleva `imageCredit` e `imageNasaId`.** Sin crédito no se distingue una
  fotografía del archivo de una ilustración, y esa distinción es el argumento del sitio.
  Cuando la imagen sea un concepto artístico (Voyager, por ejemplo, que no tiene fotos de
  sí mismo en el espacio), el crédito **tiene que decirlo**.
- **Las imágenes se sirven en WebP optimizado**, no en PNG de origen. Los cuatro héroes
  de misión pesaban 33 MB en PNG; ahora 0,5 MB en WebP a 1440 px.
- **Nada de cifras decorativas.** Fuera los contadores del tipo «300+ misiones»: si un
  número aparece, sale de un dato real y se dice de dónde.
- `ACTIVE_MISSIONS` y `MISSIONS` en `src/lib/nasa.ts` están escritos a mano: son el único
  contenido del sitio que no viene de una API y por tanto el único que puede quedarse
  obsoleto en silencio. Lo vigila `scripts/check-catalog.mjs` (ver abajo), pero el
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
- `src/data/exoplanets.json` — **cada 15 días**. El NASA Exoplanet Archive **no manda
  CORS** (comprobado mandando `Origin:`: la respuesta llega sin
  `access-control-allow-origin`), así que esto no se puede pedir desde el navegador. Se
  consulta por TAP, que es SQL sobre HTTP. Usa la tabla **`pscomppars`**, con una fila por
  planeta; `ps` tiene una fila por planeta **y referencia**, así que contar ahí sale de más.
- `src/data/live-channels.json` — **cada 30 min**. Un id de directo de YouTube dura horas;
  esto NO se puede hacer en cliente (ni el RSS ni `/@handle/live` mandan CORS).

## Guardia del catálogo
`scripts/check-catalog.mjs` lo lanza el job `catalogo` de `nasaexplorer-sync.yml`
(cron quincenal y a mano) y falla en rojo si el catálogo miente:

- `planned` con la fecha ya pasada, o `completed`/`active` con fecha futura.
- `countdownTarget` vencido.
- Discrepancia contra Launch Library 2, solo para misiones de 2015 en adelante
  (LL2 no cubre Mercury ni Apollo con fiabilidad).
- **Recursos que no existen**: ficheros de `public/` que el catálogo enlaza y no
  están, y enlaces externos que no devuelven 200.
- **Vínculos rotos**: un `missionId` de `ACTIVE_MISSIONS` que no exista en
  `MISSIONS_LIST`.
- **Cifras caducadas**: `stats` que llevan un año escrito y ya han pasado, como
  «~165 AU (2025)» o «Mission end: Sep 2025 (est.)». Son medidas del momento, no
  hitos, y envejecen solas. Sale como **aviso**, no como error: el script sabe que
  el dato está viejo, pero no cuál es el nuevo. Se refresca a mano con la fuente
  delante. Un hito con fecha («Pluto flyby: Jul 14, 2015») no se marca nunca.

```bash
node scripts/check-catalog.mjs           # todo
node scripts/check-catalog.mjs --local   # sin red, solo coherencia interna
```

Lee `nasa.ts` **como texto, con expresión regular**, porque el fichero no se puede
importar desde Node (importa `./youtube` sin extensión). Si un refactor cambia la forma
del catálogo el parser dejaría de encajar, así que aborta si saca menos de 15 misiones:
un guardia ciego que pasa en verde es peor que no tenerlo.

Nació de dos casos reales. Artemis II figuraba como `2026-09-30 / planned` con el
comentario «Updated to September 2026 for a long countdown» cuando había despegado el
2026-04-01. Y dos de los tres clips de audio históricos daban 404 desde que la NASA
reorganizó su web: dos fichas ofrecían un reproductor mudo, y ni el build ni los tipos
podían verlo porque el fallo era de un recurso, no de código.

## Audio histórico
Los clips se sirven desde `public/assets/audio/`, **no enlazados a nasa.gov**: es lo que
se rompió. Salen de [Historical Sounds](https://www.nasa.gov/historical-sounds/) (dominio
público) y cada `audioClip` guarda en `source` la URL original para poder rastrearla.
Freedom 7 se quedó sin clip a propósito: el de Shepard («light this candle») ya no existe
en el archivo y poner el de otra misión sería falsear la ficha.

## PWA
El registro, el manifest y el Service Worker **tienen que llevar el basePath**. Los
cuatro lo ignoraban y la PWA no funcionaba: `register("/sw.js")` daba 404 en cada carga
y `cache.addAll()` —que es atómico— rechazaba entera porque tres de sus cuatro rutas no
existían. `public/sw.js` se sirve tal cual, así que no puede leer `process.env`: el
basePath va escrito y hay que cambiarlo a mano si cambia en `next.config.ts`.

Los iconos (`icon-192.png`, `icon-512.png`) son cuadrados y se generan desde
`nasa-logo.png`, que es 16:9: declararlo como icono `maskable` lo recortaba mal.

## Las dos listas de misiones
`MISSIONS_LIST` es el **archivo** (una ficha por lanzamiento, 25) y `ACTIVE_MISSIONS` el
**panel de lo que opera hoy** (4), con objetivos, cronología e instrumentos que el archivo
no tiene. Tres coinciden —ISS, Perseverance y JWST— y lo declaran con `missionId`, que el
guardia comprueba. No se fusionan a propósito: describen cosas distintas, y `artemis` es un
programa entero sin ficha equivalente. Al tocar una de las tres, **mirar las dos listas**.

## Iconos
`src/components/Icon.tsx`: SVG inline, sin dependencias. **Nada de emoji en la interfaz**
— renderizan distinto en cada sistema y un lector de pantalla los lee con su nombre
Unicode («🔍 Buscar» se oía «lupa Buscar»). Decorativos por defecto; si el icono va solo
dentro de un botón, hay que pasarle `label`. Los canales de `live-channels.json` guardan
un nombre de icono en `icon`, no un emoji.

## Buscador
`src/lib/search-index.ts` aplana las seis fuentes (misiones, en curso, astronautas,
lanzamientos, exoplanetas y secciones) a documentos con la misma forma; `fuzzy.ts` solo
puntúa texto y no sabe de dónde viene cada cosa. **Toda fuente nueva de contenido debería
entrar ahí**, o queda fuera del buscador — que es lo que le pasaba a los astronautas.

## SEO
`src/lib/seo.ts` centraliza los metadatos: `buildMetadata()` genera título, descripción,
canónica, `alternates.languages` (con `x-default`) y las etiquetas Open Graph con URL
**absolutas** — las relativas no las resuelve ningún rastreador ni scraper.

Toda página nueva debe exportar su `generateMetadata` usando ese helper, y toda sección
nueva entrar en `SECCIONES` de `src/app/sitemap.ts`.

**La imagen de Open Graph no puede ser la de la ficha.** Las fotos del archivo son WebP y
de proporción libre (varias son verticales); las previsualizaciones de redes esperan JPEG
a 1200×630. Por eso existe `public/assets/og-missions/`: el mismo recorte, en el formato
que entienden los scrapers. Al añadir una misión hay que generar también el suyo. `robots.ts` y `sitemap.ts` se generan
en el build y salen como `/robots.txt` y `/sitemap.xml`.

## Arquitectura
```
src/app/[locale]/   → páginas (missions, launches, active, solar, iss, live, apod, search)
src/components/     → UI. Home*.tsx son los bloques de la portada
src/lib/            → nasa.ts (catálogo + APIs), launches.ts, live-channels.ts, youtube.ts
src/data/           → JSON horneado por el cron + astronautas
src/i18n/messages/  → en.json · es.json
scripts/            → sync-space-data.mjs (cron) · check-catalog.mjs (guardia)
public/assets/      → fotos reales del archivo NASA en WebP
                      · missions/    imagen de cada ficha
                      · og-missions/ el mismo recorte a 1200×630 JPEG para Open Graph
                      · audio/       clips históricos de Historical Sounds
```

## Claves de API
No hay servidor: lo que se consulta desde el navegador usa
`NEXT_PUBLIC_NASA_API_KEY` con `DEMO_KEY` como respaldo (APOD). `NASA_API_KEY` solo
existe en build (fotos de róveres marcianos). Nunca subir claves al repo.
