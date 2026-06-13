"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import "leaflet/dist/leaflet.css";

export interface UapStory {
  id: string;
  meta: string;
  year: string;
  agency: string;
  region: string;
  tags: string[];
  title_es: string;
  title_en: string;
  body_es: string;
  body_en: string;
  image: string;
  images?: string[];
  video?: string;
  url: string;
}

interface UapMapProps {
  stories: UapStory[];
  onSelectStory: (id: string) => void;
}

// Region centers helper
const regionCenters: Record<string, [number, number]> = {
  usa: [37.0902, -95.7129],
  space: [28.3922, -80.6077], // Cape Canaveral / Space representation
  "middle-east": [29.2985, 47.9783],
  iraq: [33.3152, 44.3661],
  syria: [34.8021, 38.9968],
  europe: [48.8566, 2.3522],
  pacific: [-10.0, -150.0],
  japan: [36.2048, 138.2529],
  germany: [51.1657, 10.4515],
  africa: [1.5097, 18.0678],
  "central-asia": [45.4507, 68.8319],
  classified: [37.2431, -115.7930], // Area 51
};

function getStoryCoordinates(story: UapStory): [number, number] | null {
  const title = story.title_en.toLowerCase();
  
  if (title.includes("roswell")) return [33.3943, -104.5230];
  if (title.includes("pentagon")) return [38.8719, -77.0563];
  if (title.includes("white sands")) return [32.3811, -106.4764];
  if (title.includes("vandenberg")) return [34.7378, -120.5708];
  if (title.includes("chile")) return [-35.6751, -71.5430];
  if (title.includes("papua")) return [-9.4438, 147.1803];
  if (title.includes("gulf of mexico")) return [25.0, -90.0];

  const center = regionCenters[story.region] || [0, 0];
  if (center[0] === 0 && center[1] === 0) return null;

  // Jitter based on id string hash to prevent overlapping markers
  let hash = 0;
  for (let i = 0; i < story.id.length; i++) {
    hash = story.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const jitterLat = ((hash % 100) / 100) * 8 - 4; // +/- 4 degrees
  const jitterLng = (((hash >> 8) % 100) / 100) * 8 - 4; // +/- 4 degrees

  return [center[0] + jitterLat, center[1] + jitterLng];
}

export default function UapMap({ stories, onSelectStory }: UapMapProps) {
  const locale = useLocale();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      // Create map
      const map = L.map(mapContainerRef.current!, {
        center: [25, 0],
        zoom: 2,
        minZoom: 1,
        maxZoom: 9,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark Theme Tiles
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Create a layer group for markers
      const markersGroup = L.layerGroup().addTo(map);

      mapRef.current = map;
      markersGroupRef.current = markersGroup;
      setInitialized(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers when stories list changes
  useEffect(() => {
    if (!initialized || !mapRef.current || !markersGroupRef.current) return;

    import("leaflet").then((L) => {
      // Clear previous markers
      markersGroupRef.current.clearLayers();

      // Define green radar icon
      const uapIcon = L.divIcon({
        className: "",
        html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-4 h-4 rounded-full bg-emerald-500/35 animate-ping"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400 border border-white shadow-[0_0_10px_#10b981]"></div>
        </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      stories.forEach((story) => {
        const coords = getStoryCoordinates(story);
        if (!coords) return;

        const title = locale === "es" ? story.title_es : story.title_en;
        const agencyLabel = story.agency.toUpperCase();
        
        const popupContent = document.createElement("div");
        popupContent.className = "p-2 font-sans bg-gray-950 text-white rounded border border-emerald-500/20";
        
        const popupTitle = document.createElement("h3");
        popupTitle.className = "text-sm font-bold text-emerald-400 border-b border-emerald-500/20 pb-1 mb-1 font-mono uppercase";
        popupTitle.innerText = `${agencyLabel} // CASE: ${story.year}`;
        popupContent.appendChild(popupTitle);

        const popupBody = document.createElement("p");
        popupBody.className = "text-xs text-gray-300 font-medium mb-2 leading-relaxed";
        popupBody.innerText = title;
        popupContent.appendChild(popupBody);

        const popupBtn = document.createElement("button");
        popupBtn.className = "w-full text-center py-1 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-mono text-[10px] font-bold tracking-wider rounded transition-colors uppercase";
        popupBtn.innerText = locale === "es" ? "VER DETALLES" : "VIEW DETAILS";
        popupBtn.onclick = () => {
          onSelectStory(story.id);
        };
        popupContent.appendChild(popupBtn);

        L.marker(coords, { icon: uapIcon })
          .bindPopup(popupContent, {
            maxWidth: 240,
            className: "uap-popup-custom",
          })
          .addTo(markersGroupRef.current);
      });
    });
  }, [initialized, stories, locale, onSelectStory]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.05)]">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
      
      {/* Custom Styles for Leaflet Popup to fit the retro terminal theme */}
      <style jsx global>{`
        .uap-popup-custom .leaflet-popup-content-wrapper {
          background: #020617 !important; /* bg-gray-950 */
          color: #f8fafc !important; /* text-slate-50 */
          border: 1px solid rgba(16, 185, 129, 0.3) !important; /* border-emerald-500/30 */
          border-radius: 8px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.15) !important;
        }
        .uap-popup-custom .leaflet-popup-tip {
          background: #020617 !important;
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
        }
        .uap-popup-custom .leaflet-popup-content {
          margin: 6px !important;
        }
      `}</style>
    </div>
  );
}
