# CLAUDE.md

## Project: nasaexplorer
Educational, bilingual (ES/EN) interactive explorer of all NASA missions history.
Interactive dashboard with 3D models, live hub and multimedia archive.

## Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **i18n**: next-intl (EN/ES, auto-detect)
- **3D Viewer**: React Three Fiber + @react-three/drei
- **State**: Zustand
- **Styling**: Tailwind CSS + CSS variables (design tokens)
- **APIs**: NASA Open API, YouTube Data API v3, Cloudinary

## Design tokens
- Background: #F8FAFC | Primary: #0B3D91 | Accent: #FC3D21 | Text: #1E293B

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint check

## Architecture
src/app/         → Next.js App Router pages
src/components/  → UI components (MissionCard, Viewer3D, LiveHub)
src/lib/         → API clients (nasa.ts, youtube.ts, cloudinary.ts)
src/i18n/        → Translation files (en.json, es.json)
src/store/       → Zustand stores
public/models/   → .glb 3D models from nasa3d.arc.nasa.gov

## Key constraints
- Never write mission data as static text — always fetch from NASA Open API
- i18n keys follow the schema defined in the project brief
- Mission schema: { id, name, program, launch_details, description:{es,en}, multimedia, stats[] }
- 3D models: free sources from nasa3d.arc.nasa.gov and Sketchfab/NASA
- Images hosted on Cloudinary (user's account)