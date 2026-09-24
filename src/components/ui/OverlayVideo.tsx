"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A video laid over a still rather than instead of it.
 *
 * The `<Image>` underneath stays exactly where it is and this sits on top of
 * it, transparent until the video is genuinely playing. That ordering is the
 * whole design, and it buys three things at once:
 *
 *   - It is a trial that cannot break the fold. A missing file, a codec the
 *     browser will not take, a blocked autoplay, a slow connection — every one
 *     of them leaves the video at opacity 0 and the fold looking exactly as it
 *     does without it. There is no empty black box state.
 *   - The still is already the right crop and often already `priority`, so it
 *     is a better poster than the `poster` attribute could be, which takes one
 *     image for every breakpoint.
 *   - Reverting is deleting one element — the image is never touched.
 *
 * By default it plays once and holds its last frame: nothing restarts it after
 * `ended`, including coming back into view. Pass `loop` for a mascot or an
 * ambient plate that should keep running.
 *
 * It lived in `folds/fold01/` as `HeroVideo` while the hero was the only thing
 * that wanted it. Fold 07's rabbit wants exactly the same behaviour, so it is
 * here rather than copied.
 */

interface OverlayVideoProps {
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
  /** Keep running rather than stopping on the last frame. */
  loop?: boolean;
  /**
   * `"auto"` for a plate that should be ready the moment it scrolls in.
   *
   * `"none"` holds the request back until the observer below asks to play,
   * which is what a heavy decorative file wants: nothing is fetched for a
   * reader who never reaches that fold, or who is on a breakpoint where the
   * element is `display: none`.
   */
  preload?: "auto" | "metadata" | "none";
  className?: string;
}

/** Matches the stills' own 640px portrait/landscape switch. */
const MOBILE_MEDIA = "(max-width: 639px)";

export function OverlayVideo({
  src,
  mobileSrc,
  loop = false,
  preload = "auto",
  className,
}: OverlayVideoProps) {
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
      loop={loop}
      // No `autoplay`: playback is driven by the effect above so that the
      // reduced-motion preference can opt out of it, which the attribute
      // gives no way to do.
      preload={preload}
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
