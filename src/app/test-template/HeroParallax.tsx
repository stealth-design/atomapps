"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/**
 * Scroll parallax for the hero. Each descendant with `data-depth` travels
 * `depth × hero height` down the page while the hero scrolls out: positive
 * lags behind the scroll (background), negative runs ahead of it (copy).
 * Scoped here rather than using GlobalParallax, which only scans the page
 * once on first load and so misses this page after a client navigation.
 */
export function HeroParallax({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((el) => {
          gsap.to(el, {
            y: () => Number(el.dataset.depth) * ref.current!.offsetHeight,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: ref.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
