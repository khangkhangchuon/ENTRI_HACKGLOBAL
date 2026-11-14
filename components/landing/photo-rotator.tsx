"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import clsx from "clsx";

// To change the photos, put the files in public/photos and edit this list.
// `focus` says which part of the photo to keep in view when it is cropped.
const PHOTOS = [
  {
    src: "/photos/seeking-kindness.webp",
    alt: "A bearded man kneeling on a subway platform. He holds a cardboard sign that reads: Seeking human kindness.",
    focus: "object-[78%_center]",
  },
];

const SECONDS = 5;
// With a single photo there is nothing to rotate, so the controls are hidden.
const MANY = PHOTOS.length > 1;

export function PhotoRotator({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || !MANY) return;
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
        {MANY && (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-dusk-900 hover:bg-white"
            aria-label={playing ? "Pause the photos" : "Play the photos"}
          >
            {playing ? (
              <Pause className="h-4 w-4" aria-hidden />
            ) : (
              <Play className="h-4 w-4" aria-hidden />
            )}
          </button>
        )}
        {MANY && (
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
                    i === index ? "w-6 bg-dusk-900" : "w-2.5 bg-mist-300",
                  )}
                />
              </button>
            ))}
          </div>
        )}
        <figcaption className="ml-auto text-right text-sm text-dusk-600">
          {MANY
            ? "Photos are illustrative. The people shown are not connected to Entri."
            : "The photo is illustrative. The person shown is not connected to Entri."}
        </figcaption>
      </div>
    </figure>
  );
}
