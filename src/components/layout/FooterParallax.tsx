"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/**
 * Footer reveal — the footer trails the scroll instead of arriving with it.
 *
 * The footer is held in a clipping window and starts shifted up inside it, so
 * the last fold slides away over a footer that is still catching up. By the
 * time the page bottoms out the offset is zero and the footer sits exactly
 * where its layout puts it — nothing is left displaced.
 *
 * `clamp()` on both ends is what makes that guarantee hold. The natural end
 * (footer top at viewport top) is unreachable whenever the footer is shorter
 * than the viewport, which is most desktops at 800px; clamping pins the end to
 * the document's own maximum scroll so the tween always completes on screen.
 *
 * The shade is a panel in the footer's own colour, so it reads as depth on the
 * white type and wordmark and introduces no new colour of its own. It doubles
 * as cover: it spans the window, so the strip the offset leaves bare at the
 * bottom is never a seam.
 *
 * Wrapping `children` rather than reaching into Footer keeps Footer a server
 * component — only this controller ships to the client.
 */

/** Travel, as a share of the footer's own height. Negative trails the scroll. */
const TRAVEL_DESKTOP = -25;
/** The mobile footer is ~150px shorter, so the same share reads as more drift. */
const TRAVEL_MOBILE = -16;

/** Opening shade, cleared as the footer settles. */
const SHADE = 0.5;

/** Matches the footer's own background — see the shade note above. */
const FOOTER_BG = "bg-[#171717]";

export function FooterParallax({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const inner = root.querySelector<HTMLElement>("[data-footer-inner]");
      const shade = root.querySelector<HTMLElement>("[data-footer-shade]");
      if (!inner) return;

      const mm = gsap.matchMedia();

      // Under reduced motion nothing runs: the footer renders untransformed and
      // the shade stays at its CSS opacity of 0.
      mm.add(
        {
          isMobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
          isDesktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };

          const timeline = gsap.timeline({
            // Scrubbed motion takes its timing from the scroll itself, so the
            // tweens stay linear; the easing lives in `scrub`, which trails the
            // pointer by 0.4s and smooths a phone's coarse scroll deltas.
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              start: "clamp(top bottom)",
              end: "clamp(top top)",
              scrub: 0.4,
              // Address-bar show/hide resizes the viewport mid-scroll; this
              // re-measures the offset instead of animating to a stale one.
              invalidateOnRefresh: true,
            },
          });

          timeline.from(inner, {
            yPercent: isMobile ? TRAVEL_MOBILE : TRAVEL_DESKTOP,
            // Holds the compositor layer for the whole scrub rather than
            // letting GSAP promote and demote it around each tween.
            force3D: true,
          });

          if (shade) timeline.from(shade, { opacity: SHADE }, "<");
        },
      );

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      data-footer-parallax
      className={`relative overflow-hidden ${FOOTER_BG}`}
    >
      <div data-footer-inner>{children}</div>
      <div
        data-footer-shade
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-0 ${FOOTER_BG}`}
      />
    </div>
  );
}
