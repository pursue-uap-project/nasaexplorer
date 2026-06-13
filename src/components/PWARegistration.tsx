"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      // Register service worker on load
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    } else if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // In development/localhost, we can still register or log it
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        console.log("Dev Service Worker active:", reg.scope);
      }).catch((e) => {
        console.warn("Dev Service Worker registration failed:", e);
      });
    }
  }, []);

  return null;
}
