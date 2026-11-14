"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Square, Volume2 } from "lucide-react";

const noop = () => () => {};

// Reads the current screen out loud with the browser's built-in voice.
// It reads whatever is inside the element marked data-read.
export function ReadAloud() {
  const supported = useSyncExternalStore(
    noop,
    () => "speechSynthesis" in window,
    () => false,
  );
  const [speaking, setSpeaking] = useState(false);

  // Stop the voice when the visitor leaves the screen.
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!supported) return null;

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const text =
      document.querySelector<HTMLElement>("[data-read]")?.innerText ?? "";
    if (!text.trim()) return;
    const voice = new SpeechSynthesisUtterance(text);
    voice.rate = 0.95;
    voice.onend = () => setSpeaking(false);
    voice.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(voice);
    setSpeaking(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 bg-white px-3.5 py-2 text-[15px] font-semibold text-ink hover:bg-sand-100"
    >
      {speaking ? (
        <Square className="h-4 w-4 fill-current" aria-hidden />
      ) : (
        <Volume2 className="h-5 w-5" aria-hidden />
      )}
      {speaking ? "Stop" : "Read aloud"}
    </button>
  );
}
