"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero plate as a video, laid over the stills rather than instead of them.
 *
 * The two `<Image>` plates stay exactly where they are and this sits on top of
 * them, transparent until the video is genuinely playing. That ordering is the
 * whole design, and it buys three things at once:
 *
 *   - It is a trial that cannot break the fold. A missing file, a codec the
 *     browser will not take, a blocked autoplay, a slow connection — every one
 *     of them leaves the video at opacity 0 and the hero looking exactly as it
 *     does today. There is no empty black box state.
 *   - The stills are already the right two crops (portrait under 640, landscape
 *     over it) and already `priority`, so they are a better poster than the
 *     `poster` attribute could be, which takes one image for every breakpoint.
 *   - Reverting is deleting one line in Fold01 — the images are never touched.
 *
 * It plays once and holds its last frame: no `loop`, and nothing restarts it
 * after `ended`, including coming back into view.
 */

interface HeroVideoProps {
  /** Landscape cut. Used at every width unless `mobileSrc` is set. */
  src: string;
  /**
   * Optional portrait cut for under 640px, where the stage is 1206/2280 and a
   * landscape file loses about 42% of its width to `object-cover`.
   *
   * The `media` attribute picks this at load time only — the browser will not
   * swap sources on a resize — which is the right trade for a background plate
   * and worth knowing if you are testing by dragging the window.
   */
  mobileSrc?: string;
  className?: string;
}

/** Matches the stills' own 640px portrait/landscape switch. */
const MOBILE_MEDIA = "(max-width: 639px)";

export function HeroVideo({ src, mobileSrc, className }: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Autoplaying footage is exactly the motion that preference is about, and
    // there is no markup-only way to opt out of the `autoplay` attribute — so
    // playback is driven here and under `reduce` the stills simply stand.
    const play = () => {
      if (reduce.matches || el.ended) return;
      // Rejected by a backgrounded tab, a missing file, or a browser that will
      // not autoplay even muted. None is worth surfacing: the stills are
      // already showing and `onPlaying` is what reveals this.
      void el.play().catch(() => {});
    };

    let onScreen = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) play();
        else el.pause();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);

    const onPreferenceChange = () => {
      if (reduce.matches) {
        el.pause();
        setIsPlaying(false);
      } else if (onScreen) {
        play();
      }
    };
    reduce.addEventListener("change", onPreferenceChange);

    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  return (
    <video
      ref={ref}
      muted
      playsInline
      // No `loop` and no `autoplay`, both deliberate: it runs once, driven by
      // the effect above, and stops on its final frame.
      preload="auto"
      aria-hidden="true"
      // `onPlaying` rather than `onCanPlay`: frames are on screen by then, so
      // the cross-fade cannot reveal an undecoded black frame over the stills.
      // `onEnded` deliberately does nothing — the element holds its last frame.
      onPlaying={() => setIsPlaying(true)}
      onError={() => setIsPlaying(false)}
      className={`${className ?? ""} transition-opacity duration-700 ease-[cubic-bezier(0.625,0.05,0,1)] motion-reduce:transition-none ${
        isPlaying ? "opacity-100" : "opacity-0"
      }`}
    >
      {mobileSrc && <source src={mobileSrc} media={MOBILE_MEDIA} />}
      <source src={src} />
    </video>
  );
}
