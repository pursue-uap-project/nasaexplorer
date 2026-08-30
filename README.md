# NASA Explorer

An interactive, high-performance web portal for **space exploration science**, bilingually localized (ES/EN). Built with Next.js, TypeScript, Tailwind CSS, and Leaflet.

---

## 🚀 Key Portals & Features

### 🌌 NASA Science Archive
Explore the wonders of space science and official NASA operational telemetry:
* **Interactive Mission Directory**: Browse through historical space programs from Project Mercury and Apollo to the James Webb Space Telescope and Artemis.
* **Orbits of the Solar System**: A dynamic gravity simulator representing the 8 planets and current active space probes.
* **ISS Tracker in Real Time**: Live tracking of the International Space Station's speed, latitude, longitude, and orbit trails over a clean geo-vector dark map.
* **Astronomy Picture of the Day (APOD)**: Walk through the historic NASA APOD archive with custom date pickers, random selections, and caching capabilities.
* **Live Broadcasts**: Stream NASA TV and NASA en Español feeds natively in-app.

---

## 🛠️ Technical Architecture

* **Framework**: [Next.js](https://nextjs.org/) (App Router) with static export capability (`output: export`) for serverless deployment with zero database cost.
* **Language**: [TypeScript](https://www.typescript.org/) for robust static typing.
* **Localization**: [next-intl](https://next-intl-docs.vercel.app/) offering complete English and Spanish routing and dictionaries out-of-the-box.
* **Mapping Engine**: [Leaflet](https://leafletjs.org/) integrated dynamically to prevent SSR compile-time errors.
* **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid page transitions, slide-over panels, and interactive elements.
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) for fully responsive, custom-tailored dark aerospace themes.

---

## 💻 Local Development

Follow these steps to run the portal on your local machine:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000/nasaexplorer/es/](http://localhost:3000/nasaexplorer/es/) or [http://localhost:3000/nasaexplorer/en/](http://localhost:3000/nasaexplorer/en/) in your browser.

3. **Verify and Check Types**:
   ```bash
   npx tsc --noEmit
   ```

4. **Build Static Site Export**:
   ```bash
   npm run build
   ```
   The static distribution files will be generated under the `out/` directory, ready to be deployed to GitHub Pages, Vercel, Netlify, or any static hosting platform.

---

## 📄 License & Credits

* **NASA Telemetry & Images**: Courtesy of the official [NASA Open APIs](https://api.nasa.gov/).
* **Leaflet Maps**: Map tiles powered by CartoDB Dark.
