"use client";

import { useState, useEffect } from "react";

// TypeScript declaration for the model-viewer web component (React 19 compatible)
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        "auto-rotate"?: string;
        "camera-controls"?: string;
        "shadow-intensity"?: string;
        exposure?: string;
        ar?: string;
        "environment-image"?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

type Model = {
  file: string;
  label: string;
  description: string;
};

const MODELS: Model[] = [
  { file: "International Space Station (ISS) (A).glb", label: "ISS", description: "International Space Station" },
  { file: "Hubble Space Telescope (A).glb", label: "Hubble A", description: "Hubble Space Telescope" },
  { file: "Hubble Space Telescope (B).glb", label: "Hubble B", description: "Hubble Space Telescope (variant)" },
  { file: "Galileo.glb", label: "Galileo", description: "Galileo probe" },
  { file: "InSight Cruise Lander (arm deployed).glb", label: "InSight", description: "Mars InSight Lander — arm deployed" },
  { file: "Ingenuity Mars Helicopter.glb", label: "Ingenuity", description: "Ingenuity Mars Helicopter" },
  { file: "Habitat Demonstration Unit (part 1).glb", label: "Habitat pt.1", description: "Deep Space Habitat Demonstration Unit (part 1)" },
  { file: "Habitat Demonstration Unit (part 2).glb", label: "Habitat pt.2", description: "Deep Space Habitat Demonstration Unit (part 2)" },
];

export default function ModelViewer() {
  const [selected, setSelected] = useState(0);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Inject the model-viewer module script once
  useEffect(() => {
    if (document.querySelector('script[data-model-viewer]')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    script.dataset.modelViewer = "1";
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  const model = MODELS[selected];
  const src = `/models/${encodeURIComponent(model.file)}`;

  return (
    <div>
      {/* Viewer */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-gray-950">
        {scriptLoaded ? (
          <model-viewer
            src={src}
            alt={model.label}
            auto-rotate=""
            camera-controls=""
            shadow-intensity="1"
            exposure="0.9"
            style={{ width: "100%", height: "480px", background: "transparent" }}
          />
        ) : (
          <div className="w-full h-[480px] flex items-center justify-center">
            <span className="text-white/30 text-sm font-mono animate-pulse">Loading viewer…</span>
          </div>
        )}
      </div>

      {/* Model selector */}
      <div className="mt-4 flex gap-2 flex-wrap">
        {MODELS.map((m, i) => (
          <button
            key={m.file}
            onClick={() => setSelected(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selected === i
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-foreground/40 mt-2">{model.description}</p>
    </div>
  );
}
