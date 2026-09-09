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

/**
 * Parallax inside a panel, as shares of the panel's own height.
 *
 * The card travels against the scene, which is the whole effect. There used to
 * be a third amount here for the blurred copy the card carried — it had to
 * travel by the sum of the other two to stay registered against the photo it
 * stood in for. The card is solid white now, so the copy and its coupling are
 * both gone.
 *
 * SCENE has to stay inside the 3% the scene's zoom holds off each edge, or the
 * drift pulls a blank strip into frame. CARD is bounded by the tighter of the
 * two layouts: on mobile the card sits 4.5% off the foot, so it cannot travel
 * further than that.
 */
const SCENE_DRIFT = 0.02;
const CARD_DRIFT = 0.025;

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
      //
      // `wide` is read below to drop the card's own drift past 1920. The
      // conditions object rather than a plain query string so the context
      // re-runs if the window crosses that width.
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          wide: "(min-width: 1921px)",
        },
        (context) => {
          if (!context.conditions?.motion) return;
          const wide = Boolean(context.conditions?.wide);
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
            const shade = card.querySelector<HTMLElement>("[data-f05-shade]");

            if (index < cards.length - 1) {
              timeline.to(card, { scale: COVERED_SCALE, duration: 1 }, index);
              if (shade)
                timeline.to(
                  shade,
                  { opacity: COVERED_SHADE, duration: 1 },
                  index,
                );
            }

            // Each panel drifts across exactly one hand-off, so every panel moves
            // at the same rate. Which hand-off is the one it can be seen during:
            // the arrival that brings it up, except for the first panel, which
            // was never brought up and so uses the hand-off that covers it.
            const at = index === 0 ? 0 : index - 1;

            // Amounts are resolved as functions of the panel's measured height
            // rather than yPercent, because the three elements are different
            // heights and only share a frame of reference through the panel.
            // `invalidateOnRefresh` re-runs them, so `svh` settling or a rotate
            // re-derives them instead of scrubbing towards a stale pixel value.
            const drift = (el: HTMLElement | null, share: number) => {
              if (!el) return;
              const to = () => card.offsetHeight * share;
              timeline.fromTo(
                el,
                { y: () => -to() },
                { y: to, duration: 1 },
                at,
              );
            };

            // The card holds still past 1920. Its drift is +-2.5% of the panel
            // height either side of centre, which is depth while the card fills
            // a viewport-height panel — but that card is the reference's 1.623
            // there and rests centred in its plate, so the same swing reads as
            // the card sitting crooked: 21px low as the fold arrives, 21px high
            // as it leaves. The scene keeps travelling either way, so the depth
            // between photo and card is only ever reduced, never lost.
            drift(card.querySelector<HTMLElement>("[data-f05-scene]"), SCENE_DRIFT);
            drift(
              card.querySelector<HTMLElement>("[data-f05-glass]"),
              wide ? 0 : -CARD_DRIFT,
            );
          });
        },
      );

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
