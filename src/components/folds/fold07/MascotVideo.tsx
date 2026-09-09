"use client";

import { useEffect, useRef } from "react";

interface MascotVideoProps {
  /** Video file, served from `public/`. */
  src: string;
  /** Still shown before the video plays, and instead of it under reduced motion. */
  poster: string;
  className?: string;
}

/**
 * The Fold 07 mascot, as a looping video.
 *
 * Playback is driven here rather than by the `autoplay` attribute, which gives
 * two things the attribute cannot:
 *
 *   - It respects `prefers-reduced-motion`. An autoplaying loop is exactly the
 *     motion that preference is about, and there is no markup-only way to opt
 *     out of it. Under `reduce` the poster stands in and nothing plays.
 *   - It only runs while on screen. This sits low in a tall page, so an
 *     autoplaying loop would decode frames for the whole scroll above it.
 *
 * The poster is the mascot's own still, so if the video is missing or a format
 * the browser will not take, the fold looks exactly as it did before it was a
 * video rather than showing an empty box.
 */
export function MascotVideo({ src, poster, className }: MascotVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = (onScreen: boolean) => {
      if (reduce.matches || !onScreen) {
        el.pause();
        return;
      }
      // Rejected when the tab is backgrounded or the file is missing; neither
      // is worth surfacing, and the poster is already standing in.
      void el.play().catch(() => {});
    };

    let onScreen = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync(onScreen);
      },
      // A margin so it is already running by the time it scrolls into frame.
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);

    const onPreferenceChange = () => sync(onScreen);
    reduce.addEventListener("change", onPreferenceChange);

    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      // `metadata`, not `auto`: the effect starts playback when it comes into
      // view, so there is no reason to pull the whole file on first paint.
      preload="metadata"
      aria-hidden="true"
      className={className}
    >
      <source src={src} />
    </video>
  );
}
