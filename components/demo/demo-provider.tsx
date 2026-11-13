"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEY, useDemo } from "@/lib/demo/store";

const ReadyContext = createContext(false);

// True once the saved demo data has loaded in the browser. Screens wait for
// this before showing data, so nothing flickers from old to new.
export const useDemoReady = () => useContext(ReadyContext);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let firstVisit = false;
    try {
      firstVisit = localStorage.getItem(STORAGE_KEY) === null;
    } catch {
      // Storage can be blocked in private windows. The demo still works,
      // it just starts fresh on each page.
      firstVisit = true;
    }

    Promise.resolve(useDemo.persist.rehydrate()).then(() => {
      // On a first visit, build the demo world around today's date.
      if (firstVisit) useDemo.getState().resetDemo();
      setReady(true);
    });

    // When another tab changes the data, load it here too. This is what
    // links the caseworker side and the user side.
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) useDemo.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <ReadyContext.Provider value={ready}>{children}</ReadyContext.Provider>;
}
