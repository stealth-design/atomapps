"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Global smooth-scroll provider. Drives Lenis from GSAP's own ticker so
 * there is a single RAF loop for both scrolling and ScrollTrigger, and
 * keeps ScrollTrigger's measurements in sync with Lenis's virtual scroll
 * position. Falls back to native scrolling when reduced motion is preferred.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    // Published so overlays can freeze the page (see @/lib/lenis).
    setLenis(lenis);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      setLenis(null);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  // Fold content can change per-route; make sure trigger positions stay accurate.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [pathname]);

  return <>{children}</>;
}
