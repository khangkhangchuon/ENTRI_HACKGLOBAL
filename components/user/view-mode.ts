"use client";

import { useSyncExternalStore } from "react";

// The returning citizen demo can be shown as a phone or as a website in a
// desktop browser. The choice is remembered in this browser and is not part
// of the demo data, so "Reset demo" leaves it alone.

export type ViewMode = "phone" | "web";

const KEY = "entri-user-view";
const listeners = new Set<() => void>();
let fallback: ViewMode = "phone";

function read(): ViewMode {
  try {
    return localStorage.getItem(KEY) === "web" ? "web" : "phone";
  } catch {
    return fallback;
  }
}

export function setViewMode(mode: ViewMode) {
  fallback = mode;
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // Storage can be blocked. The choice then lasts for this page only.
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export const useViewMode = () =>
  useSyncExternalStore<ViewMode>(subscribe, read, () => "phone");

// True on screens wide enough to offer the choice. A real phone always
// gets the phone layout.
const WIDE = "(min-width: 768px)";
function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
export const useWideScreen = () =>
  useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => false,
  );
