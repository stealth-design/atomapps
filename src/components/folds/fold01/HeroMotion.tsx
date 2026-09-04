"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/**
 * Animation controller for Fold 01. The hero markup itself stays a server
 * component — this wrapper only reaches into it via `data-hero` hooks, so the
 * client bundle carries the timeline and nothing else.
 *
 * Motion preference is handled with `gsap.matchMedia()` rather than a React
 * hook on purpose: a hook's value is `false` on the first committed render
 * (it has to match the server snapshot), which is early enough to start a
 * timeline before the real preference lands. matchMedia is evaluated here on
 * the client, and reverts itself if the preference changes.
 *
 * `display: contents` keeps the wrapper out of the layout entirely.
 */
export function HeroMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const pick = (name: string) => root.querySelector<HTMLElement>(`[data-hero="${name}"]`);
      const bg = pick("bg");
      const phone = pick("phone");
      const lines = root.querySelectorAll<HTMLElement>("[data-hero-line]");

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([bg, phone, ...lines].filter(Boolean), {
          opacity: 1,
          y: 0,
          yPercent: 0,
          scale: 1,
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrance — transform/opacity only.
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(bg, { scale: 1.06, duration: 1.8, ease: "power2.out" }, 0)
          .from(lines, { opacity: 0, yPercent: 40, duration: 0.9, stagger: 0.08 }, 0.15)
          .from(phone, { opacity: 0, y: 80, scale: 0.97, duration: 1.2 }, 0.3);

        // The scroll parallax is not here: it lives on the two
        // `data-parallax` layers in Fold01, driven by GlobalParallax.
        //
        // It stays out of this timeline on purpose. An earlier attempt here
        // drifted the plate down 6% and the phone up 8% as the hero scrolled,
        // which pulled them apart — the phone is only a screen overlay sitting
        // on the device photographed into that plate, so 14% of relative
        // travel slid the lit screen clean off the device. Any parallax in
        // this fold has to move the plate and the overlay by the same amount,
        // which is why Fold01 gives the two layers identical numbers, and why
        // the entrance above still owns the phone's `y` alone: a scroll tween
        // on the same property would fight it on load.
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
