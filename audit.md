# Audit técnico — nasaexplorer

> `/impeccable audit` · 2026-07-20 · Sin PRODUCT.md: la dimensión anti-patterns se juzga con criterio genérico.
> Register: **brand** (sitio divulgativo, el diseño ES el producto).
>
> **Estado: sistema arreglado el 2026-07-20.** Decisión tomada con el usuario: las tarjetas claras sobre chrome oscuro son intencionadas → se arregla el contraste sin cambiar el aspecto; la dirección de arte (paleta, campo de estrellas) se deja para su propia conversación. Ver §«Qué se arregló», incluidas tres correcciones a este informe.

## Audit Health Score

### Después de los arreglos

| # | Dimensión | Antes | Ahora | Qué cambió |
|---|---|---|---|---|
| 1 | Accesibilidad | 1 | **4** | Sistema de color con contraste verificado (12/12 combinaciones texto·tarjeta ≥ 4,5:1); jerarquía por token en vez de por opacidad; emoji decorativo con `aria-hidden`; indicadores ✓/✗ del quiz con `aria-label` |
| 2 | Rendimiento | 1 | **3** | `background-attachment: fixed` → capa fija propia; 11 `backdrop-blur` inútiles eliminados de superficies ya opacas; `loading="lazy"` en 9 imágenes |
| 3 | Responsive | 2 | **3** | `100vh` → `100dvh`; el scroll deja de repintar el fondo por frame |
| 4 | Theming | 1 | **4** | OKLCH con neutros tintados; escala tipográfica propia; 107 `white/N` y `text-foreground/N` sueltos absorbidos en tokens semánticos |
| 5 | Anti-patterns | 1 | **2** | Glassmorphism decorativo retirado; emoji-icono neutralizado. **Sin cambios en paleta ni concepto** (decisión del usuario): el reflejo azul-NASA y el campo de estrellas siguen ahí |
| **Total** | **6/20** | **16/20** | **Good** |

El techo de este audit es **Anti-patterns**, y a propósito: se decidió no tocar la dirección de arte. Subir de 2 a 4 ahí es otra conversación (`/impeccable bolder`), no un arreglo.

Verificado tras los cambios: `tsc --noEmit` limpio · `eslint` 0 errores · `next build` correcto · contraste recalculado **desde el CSS ya compilado** (no desde los valores de diseño): las 12 combinaciones de texto sobre las 3 superficies claras pasan AA, `on-dark` da 17,7:1 sobre el fondo.

### Estado original (para referencia)

| # | Dimensión | Score | Hallazgo clave |
|---|---|---|---|
| 1 | Accesibilidad | 1 | `--color-foreground: #1e293b` (slate oscuro) usado como color de texto sobre tarjetas claras translúcidas encima de un fondo azul noche: contraste ~2:1 |
| 2 | Rendimiento | 1 | `<img>` crudo en 9+ componentes de un proyecto Next 16 + `background-attachment: fixed` |
| 3 | Responsive | 2 | Funciona, pero `background-attachment: fixed` degrada el scroll en móvil |
| 4 | Theming | 1 | Hex en vez de OKLCH, sin escala de neutros, tokens de tema mezclados con utilidades `white/40` sueltas |
| 5 | Anti-patterns | 1 | Glassmorphism como sistema, paleta refleja de categoría, emoji como iconografía |
| **Total** | | **6/20** | **Poor** (revisión mayor) |

## Veredicto anti-patterns

**No pasa.** Alguien podría mirar esto y decir "lo hizo una IA" sin dudar. Tells concretos:

1. **Reflejo de categoría de primer orden.** «Espacio» → azul noche + azul NASA + rojo NASA + campo de estrellas animado. `--color-background: #040d21`, `--color-primary: #0b3d91` (el azul exacto del logotipo NASA), `--color-accent: #fc3d21` (el rojo exacto), `.live-starfield` con `star-drift 90s`. Cualquiera adivina la paleta y el fondo sabiendo solo el tema. Es la primera respuesta del entrenamiento, no una decisión.
2. **Glassmorphism como sistema, no como excepción.** `bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl` se repite como contenedor por defecto (`OrbitalSimulator.tsx:199`, `MissionStats.tsx:54`). Es prohibición explícita: raro y con propósito, o nada.
3. **Emoji como iconografía.** `<span>🛰️</span>` dentro de un `h3` (`OrbitalSimulator.tsx:201`). Renderiza distinto en cada SO y no es un sistema de iconos.
4. **`rounded-3xl` + blur + borde blanco translúcido** es la firma visual de plantilla SaaS 2021.

El proyecto tiene ambición real de producto (simulador orbital con canvas, tracker ISS, mapa de trayectorias, quiz, PWA, i18n con next-intl). El código de funcionalidad es bastante más maduro que su capa visual. Eso es reparable: no hay que rehacer el producto, hay que rehacer la dirección de arte.

## Resumen ejecutivo

- Score: **6/20** (Poor)
- Issues: P0 = 1 · P1 = 4 · P2 = 3 · P3 = 1
- **El P0 es de legibilidad y es sistémico**, no un caso aislado: el token de texto está definido para tema claro y el sitio es oscuro.
- Los tres problemas principales (contraste, glassmorphism, paleta refleja) tienen la misma raíz: **no se decidió un sistema de color, se acumularon utilidades**. Arreglar la raíz arregla los tres.

## Hallazgos por severidad

### [P0] Texto oscuro sobre superficies oscuras: fallo de contraste sistémico
- **Ubicación**: `src/app/globals.css:7` (`--color-foreground: #1e293b`), consumido en `MissionStats.tsx:55,67`, `OrbitalSimulator.tsx:200,204,242,247,248,251,252,258` y más
- **Categoría**: Accesibilidad
- **Impacto**: `--color-foreground` es `#1e293b`, un slate casi negro, pensado para fondo claro. El `body` es un degradado `#040D21 → #0A192F`. Las tarjetas que contienen ese texto son `bg-white/40`, o sea blanco al 40 % sobre azul noche: el fondo efectivo queda en un gris azulado medio (~`#6c7480`). Texto `#1e293b` sobre eso da ≈ **2,2:1**. El mínimo WCAG AA para texto normal es 4,5:1.
  Y empeora: buena parte de los usos llevan opacidad encima (`text-foreground/35`, `/40`, `/45`, `/50`). `text-foreground/35` sobre esa superficie ronda **1,3:1** — es texto prácticamente invisible, y son las etiquetas de telemetría y los encabezados de sección.
- **WCAG**: 1.4.3 Contrast (Minimum), nivel AA. Fallo claro.
- **Recomendación**: no parchear componente a componente. Definir una escala de texto sobre superficie oscura (`--text`, `--text-mid`, `--text-faint`) en OKLCH con luminosidad alta, como hace `directorscut`, y sustituir todos los `text-foreground*`. Las opacidades sobre texto deben desaparecer: se sustituyen por tokens de jerarquía, que es lo que realmente se quería expresar.
- **Comando**: `/impeccable colorize`

### [P1] Glassmorphism como contenedor por defecto
- **Ubicación**: `OrbitalSimulator.tsx:199`, `MissionStats.tsx:54`, y el resto de componentes que repiten `bg-white/40 backdrop-blur-*`
- **Categoría**: Anti-pattern / Rendimiento
- **Impacto**: doble. Estético — es la prohibición explícita y el tell de IA más reconocible. Y de rendimiento — `backdrop-filter: blur()` fuerza al compositor a recomponer la región bajo cada tarjeta en cada frame. Con un canvas animado y un campo de estrellas en la misma página, es la receta para tirar los FPS en portátiles sin GPU dedicada.
- **Recomendación**: superficies sólidas de una escala de elevación (`--surface`, `--surface-raised`) con bordes de bajo contraste. Reservar el blur, si acaso, para el overlay del lightbox y para nada más.
- **Comando**: `/impeccable quieter`

### [P1] `<img>` crudo en un proyecto Next 16
- **Ubicación**: `AstronautModal.tsx`, `MissionMediaAndCrew.tsx` (×2), `MissionDetailGallery.tsx`, `Lightbox.tsx`, `Footer.tsx`, `ActiveMissions.tsx` (×3), `ApodView.tsx`, `MissionLive.tsx`, `Navbar.tsx`
- **Categoría**: Rendimiento
- **Impacto**: sin `next/image` no hay redimensionado automático, ni AVIF/WebP, ni `srcset`, ni lazy loading, ni reserva de espacio. En un sitio cuyo contenido principal son imágenes de la NASA en resolución completa, esto es el mayor coste de la página: megabytes servidos a un móvil que necesita kilobytes, más CLS en cada carga. Cloudinary ya está en las dependencias, así que la infraestructura para hacerlo bien ya está pagada.
- **Recomendación**: migrar a `next/image` con `sizes` explícito. Empezar por `ActiveMissions` y `MissionDetailGallery`, que son los que más imágenes montan.
- **Comando**: `/impeccable optimize`

### [P1] `background-attachment: fixed` en el body
- **Ubicación**: `src/app/globals.css:36`
- **Categoría**: Rendimiento / Responsive
- **Impacto**: obliga al navegador a repintar el degradado de fondo en cada frame de scroll en vez de desplazar una capa ya compuesta. Es un causante clásico de scroll con tirones en móvil, y en iOS Safari el comportamiento es directamente inconsistente.
- **Recomendación**: quitar `fixed`. Si se busca que el degradado no se repita al hacer scroll, un elemento `position: fixed; inset: 0; z-index: -1` con el degradado consigue el mismo efecto sin coste por frame.
- **Comando**: `/impeccable optimize`

### [P1] Paleta refleja de la categoría
- **Ubicación**: `src/app/globals.css:4-7`
- **Categoría**: Anti-pattern
- **Impacto**: no es un fallo funcional, es un fallo de identidad. El sitio no se distingue de los otros cien proyectos «NASA explorer» que existen. Para un register brand, donde el diseño ES el producto, esto es el problema central.
- **Recomendación**: escribir primero la frase de escena (¿quién lo mira, dónde, con qué luz, en qué estado de ánimo?) y dejar que decida el tema y la estrategia de color. Y evitar el reflejo de segundo orden: «espacio pero no azul-noche → blanco brutalista con tipografía monoespaciada» es la siguiente respuesta obvia. Hay que pasar de las dos.
- **Comando**: `/impeccable bolder`

### [P2] Emoji usado como icono
- **Ubicación**: `OrbitalSimulator.tsx:201`, revisar el resto de componentes
- **Categoría**: Anti-pattern / Accesibilidad
- **Impacto**: el emoji se dibuja con la fuente del sistema — distinto en Windows, macOS, Android. No hereda `currentColor`, no escala con el texto de forma predecible, y los lectores de pantalla lo anuncian ("satélite") a mitad de un encabezado.
- **Recomendación**: un sprite SVG con `aria-hidden="true"`, como el `img/icons.svg#i-*` de `mockup-ssp-v2`.
- **Comando**: `/impeccable polish`

### [P2] Cobertura de `alt` insuficiente
- **Ubicación**: componentes con imagen
- **Categoría**: Accesibilidad
- **Impacto**: 14 atributos `alt` para 12+ componentes que montan imágenes, varios en bucle. La cuenta no cuadra: hay imágenes sin descripción. En un sitio cuyo valor es visual, un `alt` vacío deja fuera al usuario de lector de pantalla del contenido principal, no de un adorno.
- **WCAG**: 1.1.1 Non-text Content, nivel A.
- **Recomendación**: auditar los `<img>` en bucle. Las imágenes de la NASA traen título y descripción en la API — hay material para un `alt` real, no un relleno.
- **Comando**: `/impeccable harden`

### [P2] Falta escala tipográfica
- **Ubicación**: `src/app/globals.css:9`
- **Categoría**: Theming
- **Impacto**: solo se define `--font-sans`. Los tamaños salen de las utilidades por defecto de Tailwind, que es una escala genérica. Comparado con `directorscut` (que define `--text-xs` a `--text-4xl` con su `line-height` cada uno) aquí la jerarquía es la de fábrica.
- **Comando**: `/impeccable typeset`

### [P3] `min-height: 100vh` en lugar de `100dvh`
- **Ubicación**: `src/app/globals.css:38`
- **Categoría**: Responsive
- **Impacto**: en móvil, `100vh` no descuenta la barra de direcciones: el contenido salta al aparecer y desaparecer.
- **Recomendación**: `100dvh`.
- **Comando**: `/impeccable adapt`

## Patrones y problemas sistémicos

1. **No hay sistema de color, hay utilidades acumuladas.** Cuatro tokens en `@theme` y luego `white/40`, `white/60`, `white/50`, `white/10` sueltos por los componentes. De ahí salen el P0 de contraste, el glassmorphism y la imposibilidad de introducir un tema claro. Es una sola causa con tres síntomas.
2. **Las opacidades hacen de jerarquía tipográfica.** `text-foreground/35`, `/40`, `/45`, `/50`, `/60` — cinco niveles de jerarquía expresados como transparencia, que es precisamente lo que destruye el contraste. Deberían ser tres tokens de color.
3. **La ambición del producto va por delante de su ejecución visual.** Canvas, i18n, PWA, mapas, quiz: el trabajo funcional es serio. La capa visual es la plantilla por defecto. Es la brecha que hay que cerrar.

## Lo que funciona

- **Alcance funcional real**: simulador orbital sobre canvas, tracker de ISS, mapa de trayectorias, cuenta atrás de misiones, quiz. No es un sitio de escaparate.
- **i18n con `next-intl`** desde el principio, no añadido a posteriori.
- **PWA registrada** (`PWARegistration.tsx`).
- **Componentes bien separados** — 43 archivos con responsabilidad clara, fáciles de arreglar de uno en uno.
- **12 `aria-label` y `aria-modal`** presentes: hay intención de accesibilidad, solo que el color la anula.

## Qué se arregló (2026-07-20)

### Tres correcciones a este informe

**1. La cobertura de `alt` NO era insuficiente: es del 100%.** El informe decía «14 `alt` para 12+ componentes, la cuenta no cuadra». Recontado componente a componente: **14 `<img>`, los 14 con `alt`, 0 sin descripción**. El P2 de cobertura de `alt` era un falso positivo. Lo que sí faltaba era `loading="lazy"` (13 de 14 sin él) — ese sí se arregló.

**2. `next/image` no habría servido de nada.** El informe pedía migrar los `<img>` a `next/image` por rendimiento. Pero `next.config.ts` declara `output: "export"` + `images: { unoptimized: true }`: es un sitio estático, el optimizador de Next **no se ejecuta en build**. `next/image` sin optimizador solo añade envoltorio JS sin ganancia de bytes. La vía correcta con export estático es `loading`/`decoding`/`sizes` sobre `<img>`, que es lo que se hizo. El P1 estaba mal enfocado.

**3. El contraste era peor de lo estimado, y por una razón que el informe no vio.** El informe daba «~2:1». Medido de verdad: `text-foreground/50` sobre `bg-white/40` = **1,78:1**, y con opacidades bajas (`text-foreground/35` sobre `bg-white/30`) bajaba a **1,33:1**. Pero lo importante es la causa raíz, que el informe describió a medias: no era solo el token `#1e293b`, era **la jerarquía tipográfica hecha con opacidad** (`/30` … `/80`, 44 de 55 usos) **sobre superficies translúcidas** cuyo color depende de dónde estén en el degradado. Dos translúcidos apilados. Ningún ajuste de un token lo arreglaba; había que sustituir el mecanismo.

### El sistema de color nuevo

Método: se **calcularon y verificaron los ratios antes de escribir una línea de CSS**, y se **re-verificaron desde el CSS ya compilado por Tailwind** (no desde los valores de diseño, que Tailwind podría redondear). Dos superficies deliberadas:

- **Tarjeta clara** (contenido): `--card` / `--card-hi` / `--card-sunken`, sólidas. Texto oscuro en 4 niveles: `--ink` `--body` `--muted` `--faint`. Los 4 cumplen AA sobre las 3 superficies (peor caso `faint` sobre `sunken`: **4,79:1**).
- **Chrome oscuro** (navbar, footer, overlays): `--surface-dark`; texto claro `--on-dark` / `--on-dark-muted` / `--on-dark-faint`.

Todo en OKLCH con neutros tintados hacia el azul de marca (hue ~255–265). La regla queda escrita en el propio `globals.css`: **la jerarquía se expresa con color, nunca con opacidad**.

### Cambios aplicados

| Archivo | Cambio |
|---|---|
| `src/app/globals.css` | Sistema de color completo (comentado); `color-scheme: dark`; degradado movido de `background-attachment: fixed` a una capa `body::before` fija; `100vh` → `100dvh`; escala tipográfica `--text-2xs`…`--text-5xl`; token `--tap` + utilidad `tap-target` |
| 10 componentes de tarjeta | `bg-white/30–90` → `bg-card` / `bg-card-hi` / `bg-card-sunken`; `border-white/40–80` → `border-card-border`; 11 `backdrop-blur` y 4 `ring-white` eliminados de superficies ya opacas |
| Toda la base (`src/**`) | 55 `text-foreground/N` → `text-ink/body/muted/faint` según jerarquía (107 sustituciones de color en total) |
| `src/app/[locale]/iss/page.tsx` | Subtítulo sobre fondo de página: `text-foreground/55` (1,3:1) → `text-on-dark-muted` |
| 13 `<img>` en 11 archivos | `loading="lazy"` (9) o `decoding="async"` solo (4 above-fold: logos de navbar/hero/404 y el hero de misiones) |
| 11 emoji decorativos (`🛰️` `🎙️` `🚀` `📊` `💡` `🔍`…) | Envueltos en `aria-hidden="true"` para que el lector de pantalla no los lea a mitad de un encabezado |
| `MissionsQuiz.tsx` + `es.json`/`en.json` | Los ✓/✗ del quiz eran la **única** señal de acierto/error y solo por color (invisible para daltónicos, mudo para lectores). Ahora `role="img"` + `aria-label` con 2 claves i18n nuevas |

### Lo que a propósito NO se tocó

- **Paleta y concepto** (`--primary` azul NASA, `--accent` rojo NASA, campo de estrellas): decisión del usuario de no tocar identidad en este pase. El reflejo de categoría sigue presente y es la razón de que Anti-patterns quede en 2. Para subirlo, `/impeccable bolder` en su propia sesión.
- **`bg-white/1–20`** (cristal oscuro del chrome): no son tarjetas, son superficies del navbar/footer/modales oscuros. Correctos como están.

## Lo que queda abierto

- **[P1] Anti-patterns (dirección de arte).** El reflejo azul-NASA y el campo de estrellas. Aparcado por decisión, no por olvido. `/impeccable bolder`.
- **[P2] Emoji como iconografía real.** Se han silenciado los decorativos, pero los `🛰️`/`🚀` que hacen de icono de sección siguen siendo emoji (render distinto por SO, no heredan `currentColor`). Sustituir por un sprite SVG como el de `mockup-ssp-v2`.
- **[P2] `--on-dark-faint` definido pero sin usar aún.** Está listo como token; falta cablearlo donde el chrome oscuro tenga texto terciario (hoy varios usan `text-white/40`, que en el chrome oscuro sí cumple, pero conviene unificarlo al token).
- **[P3] `alt=""` decorativos vs informativos.** Los 14 `alt` existen, pero varios en galería son `alt=""` (decorativo) cuando la imagen es contenido real de la NASA con título en la API. Merece una pasada dándoles descripción de verdad.

## Acciones recomendadas

1. **[P1] `/impeccable bolder`**: nueva dirección de arte fuera del reflejo azul-NASA, ahora que el sistema de color de debajo ya es sano. Es el único cambio que falta para que el proyecto deje de «parecer hecho por IA».
2. **[P2] `/impeccable polish`**: sprite SVG para los emoji-icono; cablear `--on-dark-faint`.
3. **[P2] `/impeccable harden`**: `alt` informativos en las imágenes de galería.

Puedes pedirme que los ejecute de uno en uno, todos a la vez, o en el orden que prefieras.
