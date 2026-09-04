"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export type RevealVariant = "fade" | "fade-up" | "fade-down" | "scale" | "stagger";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  /** Seconds. */
  delay?: number;
  /** Seconds. */
  duration?: number;
  /** ScrollTrigger `start` position. */
  start?: string;
  className?: string;
}

const FROM_VARS: Record<RevealVariant, gsap.TweenVars> = {
  fade: { opacity: 0 },
  "fade-up": { opacity: 0, y: 40 },
  "fade-down": { opacity: 0, y: -40 },
  scale: { opacity: 0, scale: 0.92 },
  stagger: { opacity: 0, y: 30 },
};

/**
 * Scroll-triggered reveal wrapper. Supports a handful of entrance variants;
 * `stagger` animates the direct children individually instead of the wrapper.
 *
 * Motion preference goes through `gsap.matchMedia()` — see HeroMotion for why
 * a React hook is the wrong tool for gating an animation this early.
 */
export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.8,
  start = "top 80%",
  className,
}: RevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const targets = variant === "stagger" ? container.children : container;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(targets, FROM_VARS[variant], {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          delay,
          ease: "power3.out",
          stagger: variant === "stagger" ? 0.12 : 0,
          scrollTrigger: { trigger: container, start },
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [variant, delay, duration, start] },
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
