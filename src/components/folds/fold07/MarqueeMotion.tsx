"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/**
 * Fold 07 — the quote tracks drift in opposite directions.
 *
 * Desktop runs two vertical columns, mobile two horizontal rows. Both work the
 * same way: each track renders its cards twice, so translating by exactly -50%
 * lands the second copy where the first began and the loop is seamless.
 *
 * Direction comes from `data-f07-track` — "up" | "down" | "left" | "right" —
 * which keeps the markup a server component; this only reaches in via that
 * hook. Each track is a single `xPercent`/`yPercent` tween: one transform, no
 * layout work.
 *
 * The two breakpoints are separate matchMedia blocks rather than one pass over
 * every track, because both sets of markup are in the DOM at all times (one
 * hidden by `tablet:hidden`, the other by `hidden tablet:flex`). Animating the
 * hidden set would burn frames on something nobody can see.
 */

/**
 * Drift speed, in pixels per second — one for each axis.
 *
 * This used to be a fixed cycle time (55s for a column, 38s for a row), which
 * only reads as one speed while every track is the same length: the tween
 * covers half the track per cycle, so a track twice as long drifts twice as
 * fast. With the real reviews in, the two columns carry 18 and 17 cards and
 * are not the same height as each other, let alone the six-card tracks the
 * timings were tuned on. Fixing the speed and deriving the duration from
 * each track's measured length keeps every track at the pace the six-card
 * version had: ~12px/s vertically, ~20px/s across.
 */
const SPEED = { y: 12, x: 20 } as const;

export function MarqueeMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      /** One seamless loop per track, on whichever axis it declares. */
      const drift = (selector: string, axis: "x" | "y") => {
        const tracks = gsap.utils.toArray<HTMLElement>(selector, root);
        tracks.forEach((track) => {
          // "up" and "left" travel negative; "down" and "right" start shifted
          // and travel back, which is what puts the pair in opposition.
          const forward =
            track.dataset.f07Track === "up" || track.dataset.f07Track === "left";
          const prop = axis === "x" ? "xPercent" : "yPercent";
          // The track holds its cards twice and the tween covers one copy, so
          // the distance travelled per cycle is half the measured length.
          const length = axis === "x" ? track.offsetWidth : track.offsetHeight;
          const duration = Math.max(1, length / 2 / SPEED[axis]);
          gsap.fromTo(
            track,
            { [prop]: forward ? 0 : -50 },
            { [prop]: forward ? -50 : 0, duration, ease: "none", repeat: -1 },
          );
        });
      };

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        drift("[data-f07-track='left'], [data-f07-track='right']", "x");
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        drift("[data-f07-track='up'], [data-f07-track='down']", "y");
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="contents">
      {children}
    </div>
  );
}
