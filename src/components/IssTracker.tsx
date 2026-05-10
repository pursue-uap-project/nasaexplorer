"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import "leaflet/dist/leaflet.css";

type IssPosition = {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  timestamp: number;
};

const MAX_TRAIL = 100;
const POLL_MS = 5000;

function fmt(n: number, decimals = 4) {
  return n.toFixed(decimals);
}

export default function IssTracker() {
  const t = useTranslations("iss");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);
  const markerRef = useRef<ReturnType<typeof import("leaflet")["marker"]> | null>(null);
  const trailRef = useRef<ReturnType<typeof import("leaflet")["polyline"]> | null>(null);
  const positionsRef = useRef<[number, number][]>([]);
  const followingRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [position, setPosition] = useState<IssPosition | null>(null);
  const [error, setError] = useState(false);
  const [following, setFollowing] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      const map = L.map(mapContainerRef.current!, {
        center: [20, 0],
        zoom: 2,
        minZoom: 1,
        maxZoom: 6,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 19 }
      ).addTo(map);

      // Custom glowing ISS icon
      const issIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:22px;height:22px;
          border-radius:50%;
          background:radial-gradient(circle at 35% 35%, #67e8f9, #0e7490);
          box-shadow:0 0 0 3px rgba(6,182,212,0.35),0 0 14px 4px rgba(6,182,212,0.5);
          border:2px solid rgba(255,255,255,0.7);
        "></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([0, 0], { icon: issIcon }).addTo(map);
      const trail = L.polyline([], {
        color: "#22d3ee",
        weight: 1.5,
        opacity: 0.55,
      }).addTo(map);

      mapRef.current = map;
      markerRef.current = marker;
      trailRef.current = trail;
      setInitialized(true);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling loop — starts after map is initialized
  useEffect(() => {
    if (!initialized) return;

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        if (!res.ok) throw new Error("fetch failed");
        const data: IssPosition = await res.json();
        if (cancelled) return;

        setPosition(data);
        setError(false);

        const lat = data.latitude;
        const lon = data.longitude;

        // Anti-meridian: reset trail when crossing dateline
        const prev = positionsRef.current.at(-1);
        if (prev && Math.abs(lon - prev[1]) > 180) {
          positionsRef.current = [];
          trailRef.current?.setLatLngs([]);
        }

        positionsRef.current.push([lat, lon]);
        if (positionsRef.current.length > MAX_TRAIL) {
          positionsRef.current.shift();
        }

        markerRef.current?.setLatLng([lat, lon]);
        trailRef.current?.setLatLngs(positionsRef.current);

        if (followingRef.current && mapRef.current) {
          mapRef.current.panTo([lat, lon], { animate: true, duration: 1 });
        }
      } catch {
        if (!cancelled) setError(true);
      }

      if (!cancelled) {
        timerRef.current = setTimeout(poll, POLL_MS);
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [initialized]);

  function toggleFollow() {
    const next = !followingRef.current;
    followingRef.current = next;
    setFollowing(next);
  }

  const statRow = (label: string, value: string) => (
    <div key={label} className="flex items-center justify-between gap-3">
      <span className="text-white/40 text-xs uppercase tracking-wide">{label}</span>
      <span className="text-cyan-300 font-mono text-xs font-semibold">{value}</span>
    </div>
  );

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-inset ring-white/10" style={{ height: "calc(100vh - 200px)", minHeight: 480 }}>

      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Loading overlay */}
      {!position && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 z-[1000]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
            <p className="text-white/60 text-sm font-mono">{t("loading")}</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !position && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 z-[1000]">
          <p className="text-red-400/80 text-sm font-mono">{t("api_error")}</p>
        </div>
      )}

      {/* Live badge */}
      {position && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-gray-950/80 backdrop-blur-sm text-xs font-mono px-2.5 py-1 rounded-full border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white/70">{t("live")}</span>
        </div>
      )}

      {/* Follow toggle */}
      <button
        onClick={toggleFollow}
        className={`absolute top-3 right-3 z-[1000] px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
          following
            ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.25)]"
            : "bg-gray-950/70 border-white/15 text-white/50 hover:text-white/80"
        }`}
      >
        {following ? t("following") : t("follow")}
      </button>

      {/* Stats panel */}
      {position && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-gray-950/85 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 min-w-[200px] space-y-2">
          {statRow(t("stat_lat"), `${fmt(position.latitude)}°`)}
          {statRow(t("stat_lon"), `${fmt(position.longitude)}°`)}
          {statRow(t("stat_alt"), `${fmt(position.altitude, 1)} km`)}
          {statRow(t("stat_speed"), `${fmt(position.velocity, 0)} km/h`)}
          {statRow(t("stat_visibility"), position.visibility)}
          <div className="pt-1 border-t border-white/10">
            <p className="text-white/20 text-[10px]">{t("data_source")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
