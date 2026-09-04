"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Fold 08 — drives the partner strip sideways as it scrolls into view.
 *
 * On mobile the five logos run as one row wider than the screen, so page
 * scroll is mapped onto the strip's own horizontal scroll: by the time the
 * strip has settled in view it has travelled its full width and every logo
 * has passed through.
 *
 * It runs below 1280px, which is where the row stops fitting: five logos at
 * their full widths plus gaps come to 1065px, needing roughly 1145px of
 * viewport to sit inside the page gutter. Above that the row is centred and
 * has nothing to travel.
 *
 * It moves `scrollLeft` rather than a transform on purpose: that leaves the
 * strip natively pannable, so a reader can swipe back to a logo they missed,
 * and reduced-motion users (who never get the trigger) can still reach all
 * five by hand.
 */
export function PartnerStrip({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const strip = root?.querySelector<HTMLElement>("[data-f08-strip]");
      if (!strip) return;

      const mm = gsap.matchMedia();

      mm.add("(max-width: 1279px) and (prefers-reduced-motion: no-preference)", () => {
        const trigger = ScrollTrigger.create({
          trigger: strip,
          start: "top 92%",
          end: "top 38%",
          // Measured every refresh: the travel depends on the strip's own
          // width, which changes with the viewport.
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const travel = strip.scrollWidth - strip.clientWidth;
            if (travel > 0) strip.scrollLeft = travel * self.progress;
          },
        });

        return () => {
          trigger.kill();
          strip.scrollLeft = 0;
        };
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
