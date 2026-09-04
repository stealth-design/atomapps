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

/** Seconds for one full cycle. Long on purpose: this should barely register. */
const CYCLE = 55;

/** Rows are shorter than the columns are tall, so they need less time to read as the same speed. */
const ROW_CYCLE = 38;

export function MarqueeMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      /** One seamless loop per track, on whichever axis it declares. */
      const drift = (selector: string, axis: "x" | "y", cycle: number) => {
        const tracks = gsap.utils.toArray<HTMLElement>(selector, root);
        tracks.forEach((track) => {
          // "up" and "left" travel negative; "down" and "right" start shifted
          // and travel back, which is what puts the pair in opposition.
          const forward =
            track.dataset.f07Track === "up" || track.dataset.f07Track === "left";
          const prop = axis === "x" ? "xPercent" : "yPercent";
          gsap.fromTo(
            track,
            { [prop]: forward ? 0 : -50 },
            { [prop]: forward ? -50 : 0, duration: cycle, ease: "none", repeat: -1 },
          );
        });
      };

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        drift("[data-f07-track='left'], [data-f07-track='right']", "x", ROW_CYCLE);
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        drift("[data-f07-track='up'], [data-f07-track='down']", "y", CYCLE);
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
