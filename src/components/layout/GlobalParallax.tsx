"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/**
 * Attribute-driven parallax, mounted once for the whole page.
 *
 * Anything carrying `data-parallax="trigger"` gets a scrubbed tween between
 * two positions; every knob is an attribute, so folds stay server components
 * and no fold needs a controller of its own.
 *
 *   data-parallax="trigger"        the element ScrollTrigger measures (required)
 *   data-parallax="target"         a descendant to move instead of the trigger
 *   data-parallax-direction        "horizontal" | "vertical"   (default vertical)
 *   data-parallax-start            % offset at the scroll start (default 20)
 *   data-parallax-end              % offset at the scroll end   (default -20)
 *   data-parallax-scroll-start     ScrollTrigger start          (default "top bottom")
 *   data-parallax-scroll-end       ScrollTrigger end            (default "bottom top")
 *   data-parallax-scrub            seconds to catch up, or true (default true)
 *   data-parallax-disable          "mobile" | "mobileLandscape" | "tablet"
 *
 * Offsets are percentages of the target's own size, so a masked element only
 * needs enough overhang to cover its travel — see the portraits in Fold 08.
 *
 * Both scroll positions are wrapped in `clamp()`, which keeps a trigger near
 * either end of the document from asking for scroll that does not exist and
 * leaving the target stranded part-way through its travel.
 */

/**
 * `mobileLandscape` and `tablet` are the project's own `tablet` (768) and
 * `desktop-sm` (1024) breakpoints from tokens.css, one pixel below each, so
 * disabling here matches where a fold's layout actually changes.
 */
const BREAKPOINTS = {
  isMobile: "(max-width: 479px)",
  isMobileLandscape: "(max-width: 767px)",
  isTablet: "(max-width: 1023px)",
  isDesktop: "(min-width: 1024px)",
  isReduced: "(prefers-reduced-motion: reduce)",
};

const DEFAULT_START = 20;
const DEFAULT_END = -20;

/** Attribute value to a scrub setting: a number of seconds, or `true`. */
function parseScrub(raw: string | null): number | boolean {
  if (raw === null || raw === "true") return true;
  const seconds = parseFloat(raw);
  return Number.isNaN(seconds) ? true : seconds;
}

/** Attribute value to a percentage, falling back when absent or unparseable. */
function parseOffset(raw: string | null, fallback: number): number {
  if (raw === null) return fallback;
  const value = parseFloat(raw);
  return Number.isNaN(value) ? fallback : value;
}

export function GlobalParallax() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(BREAKPOINTS, (context) => {
      const { isMobile, isMobileLandscape, isTablet, isReduced } =
        context.conditions as Record<keyof typeof BREAKPOINTS, boolean>;

      // Reduced motion is a condition rather than an early gate outside
      // matchMedia, so flipping the OS setting tears the tweens down and puts
      // every target back at its untransformed position.
      if (isReduced) return;

      const triggers = gsap.utils.toArray<HTMLElement>('[data-parallax="trigger"]');

      triggers.forEach((trigger) => {
        const disable = trigger.dataset.parallaxDisable;
        if (
          (disable === "mobile" && isMobile) ||
          (disable === "mobileLandscape" && isMobileLandscape) ||
          (disable === "tablet" && isTablet)
        ) {
          return;
        }

        const target =
          trigger.querySelector<HTMLElement>('[data-parallax="target"]') ?? trigger;
        const prop =
          trigger.dataset.parallaxDirection === "horizontal" ? "xPercent" : "yPercent";

        const from = parseOffset(trigger.getAttribute("data-parallax-start"), DEFAULT_START);
        const to = parseOffset(trigger.getAttribute("data-parallax-end"), DEFAULT_END);

        gsap.fromTo(
          target,
          { [prop]: from },
          {
            [prop]: to,
            ease: "none",
            scrollTrigger: {
              trigger,
              start: `clamp(${trigger.dataset.parallaxScrollStart ?? "top bottom"})`,
              end: `clamp(${trigger.dataset.parallaxScrollEnd ?? "bottom top"})`,
              scrub: parseScrub(trigger.getAttribute("data-parallax-scrub")),
              invalidateOnRefresh: true,
            },
          },
        );
      });
    });

    return () => mm.revert();
  });

  return null;
}
