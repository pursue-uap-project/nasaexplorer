import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#040D21",
        primary: "#0B3D91",
        accent: "#FC3D21",
        foreground: "#1E293B",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        nav: "0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
