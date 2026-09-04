"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/**
 * Fold 07 — the two quote columns drift in opposite directions.
 *
 * Each track renders its cards twice, so translating by exactly -50% lands the
 * second copy where the first began and the loop is seamless. Direction comes
 * from `data-f07-track` ("up" | "down"); markup stays a server component and
 * this only reaches in via that hook.
 *
 * The animation is a single `yPercent` tween per column — one transform, no
 * layout work — and it only runs where the two-column grid exists (768px up).
 */

/** Seconds for one full cycle. Long on purpose: this should barely register. */
const CYCLE = 55;

export function MarqueeMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const tracks = gsap.utils.toArray<HTMLElement>("[data-f07-track]", root);
      if (tracks.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        tracks.forEach((track) => {
          const up = track.dataset.f07Track !== "down";
          gsap.fromTo(
            track,
            { yPercent: up ? 0 : -50 },
            {
              yPercent: up ? -50 : 0,
              duration: CYCLE,
              ease: "none",
              repeat: -1,
            },
          );
        });
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
