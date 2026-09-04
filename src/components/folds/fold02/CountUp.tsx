"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface CountUpProps {
  /** The number to land on. */
  to: number;
  /** Text kept in front of the number, e.g. "Top ". */
  prefix?: string;
  /** Text kept after the number, e.g. "K+" or "M". */
  suffix?: string;
  /** Seconds spent counting. */
  duration?: number;
  className?: string;
}

/**
 * Counts a number up from zero the first time it scrolls into view.
 *
 * The finished value is what renders on the server, so the real figure is in
 * the markup for crawlers, for anyone without JS, and for reduced-motion
 * users — the zero is written in a layout effect, before the first paint, so
 * there is no flash of the final number beforehand.
 *
 * Only the numeric part animates: these figures carry words and symbols
 * ("Top 10", "160K+", "35M"), so the prefix and suffix are held either side of
 * the digits rather than being animated through.
 *
 * `once` means it plays a single time and then kills its trigger. If the fold
 * is already on screen at load, ScrollTrigger fires on its first refresh and
 * the count runs immediately.
 */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 2,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      // Reduced motion never enters this branch, so the server-rendered value
      // simply stays put.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { value: 0 };
        const write = () => {
          el.textContent = `${prefix}${Math.round(counter.value)}${suffix}`;
        };
        write();

        const tween = gsap.to(counter, {
          value: to,
          duration,
          ease: "power2.out",
          paused: true,
          onUpdate: write,
          // Land on the exact string rather than whatever rounding produced.
          onComplete: () => {
            el.textContent = `${prefix}${to}${suffix}`;
          },
        });

        const trigger = ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () => tween.play(),
        });

        return () => {
          trigger.kill();
          tween.kill();
        };
      });

      return () => mm.revert();
    },
    { dependencies: [to, prefix, suffix, duration] },
  );

  return (
    // `tabular-nums` keeps every digit the same width, so the figure grows
    // evenly instead of twitching as 1s and 7s swap in and out.
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {`${prefix}${to}${suffix}`}
    </span>
  );
}
