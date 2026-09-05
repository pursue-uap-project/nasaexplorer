"use client";

/**
 * Registro del Service Worker.
 *
 * Estaba registrando `/sw.js`, sin el basePath. El sitio se sirve bajo
 * `/nasaexplorer/`, así que esa ruta daba **404 en cada carga** y el SW no se
 * registraba nunca: la consola de producción escupía
 * `Failed to register a ServiceWorker … 404`. El sitio se anunciaba como
 * instalable sin serlo — ni caché, ni uso sin red, ni añadir a pantalla de
 * inicio.
 *
 * También registraba dos veces (una en `load` y otra en la rama de desarrollo),
 * lo que duplicaba el error. Ahora es un único registro, con la ruta correcta y
 * su `scope`.
 */

import { useEffect } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function PWARegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // El scope no puede subir por encima del directorio del script, así que un
    // SW en `/nasaexplorer/sw.js` solo controla `/nasaexplorer/`. Es justo lo
    // que queremos: en GitHub Pages el dominio se comparte con otros proyectos.
    navigator.serviceWorker
      .register(`${BASE}/sw.js`, { scope: `${BASE}/` })
      .catch((error) => {
        console.warn("Service Worker registration failed:", error);
      });
  }, []);

  return null;
}
