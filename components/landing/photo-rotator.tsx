"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import clsx from "clsx";

// To change the photos, put the files in public/photos and edit this list.
// `focus` says which part of the photo to keep in view when it is cropped.
const PHOTOS = [
  {
    src: "/photos/street-bedroll.jpg",
    alt: "A person seen from behind, walking down a city street and carrying a rolled-up sleeping bag.",
    focus: "object-top",
  },
  {
    src: "/photos/seeking-kindness.webp",
    alt: "A bearded man kneeling on a subway platform. He holds a cardboard sign that reads: Seeking human kindness.",
    focus: "object-[78%_center]",
  },
  {
    src: "/photos/portrait-street.jpg",
    alt: "An older man with a grey beard and a bandana, sitting outside a shop and smiling slightly.",
    focus: "object-center",
  },
];

const SECONDS = 5;

export function PhotoRotator({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    // Visitors who ask for reduced motion choose photos themselves.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % PHOTOS.length),
      SECONDS * 1000,
    );
    return () => clearInterval(timer);
  }, [playing]);

  return (
    <figure className={className}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-mist-300 shadow-lg">
        {PHOTOS.map((photo, i) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt={i === index ? photo.alt : ""}
            aria-hidden={i !== index}
            fill
            sizes="(min-width: 1024px) 420px, 90vw"
            className={clsx(
              "object-cover grayscale transition-opacity duration-[1500ms] ease-in-out",
              photo.focus,
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-slate-ink hover:bg-white"
          aria-label={playing ? "Pause the photos" : "Play the photos"}
        >
          {playing ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
        </button>
        <div className="flex gap-2">
          {PHOTOS.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => {
                setIndex(i);
                setPlaying(false);
              }}
              aria-label={`Show photo ${i + 1} of ${PHOTOS.length}`}
              aria-current={i === index}
              className="flex h-9 w-6 items-center justify-center"
            >
              <span
                className={clsx(
                  "h-2.5 rounded-full transition-all",
                  i === index ? "w-6 bg-slate-ink" : "w-2.5 bg-mist-300",
                )}
              />
            </button>
          ))}
        </div>
        <figcaption className="ml-auto text-right text-sm text-slate-soft">
          Photos are illustrative. The people shown are not connected to Entri.
        </figcaption>
      </div>
    </figure>
  );
}
