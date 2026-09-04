"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/**
 * Fold 05 — stacked-card scroll.
 *
 * The stacking itself is plain CSS: every panel is `position: sticky; top: 0`
 * inside the same tall section, so each one pins at the top and the next
 * scrolls over it (later siblings paint above earlier ones). No pinning, no
 * JS layout — it survives resize and works without JS at all.
 *
 * This controller only adds the depth cue: as a panel gets covered it eases
 * back and dims. Both are cheap composited properties — a transform on the
 * card and the opacity of a black overlay, rather than a `filter` on a
 * full-viewport image.
 *
 * Timing is derived from the section rather than from each panel, because the
 * panels are sticky: ScrollTrigger would measure a stuck element at its pinned
 * position, not its position in the flow. Between `top top` and `bottom bottom`
 * the section scrolls (panels - 1) viewports, so each hand-off is exactly one
 * unit of the timeline.
 */

const COVERED_SCALE = 0.93;
const COVERED_SHADE = 0.45;

export function StackMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-f05-card]", root);
      if (cards.length < 2) return;

      const mm = gsap.matchMedia();

      // Under reduced motion the stack still works — it just doesn't recede.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        });

        cards.forEach((card, index) => {
          if (index === cards.length - 1) return;
          const shade = card.querySelector<HTMLElement>("[data-f05-shade]");

          timeline.to(card, { scale: COVERED_SCALE, duration: 1 }, index);
          if (shade) timeline.to(shade, { opacity: COVERED_SHADE, duration: 1 }, index);
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative">
      {children}
    </div>
  );
}
