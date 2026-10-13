"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";

/**
 * The app's one-liner, spelled out by the scroll: the line holds the middle of
 * the screen while each word brightens from a ghost of itself to full, in
 * reading order, as fast as the reader scrolls.
 *
 * The hold is plain CSS, the same way Fold 05 stacks: a tall section with a
 * sticky, screen-high box inside it. ScrollTrigger only scrubs the words, and
 * it measures the tall section rather than the stuck box, which it would
 * misread.
 *
 * With reduced motion the section is as tall as its line, nothing sticks,
 * and the words are simply there.
 */
export function ScrollLine({ text }: { text: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-word]",
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: "none",
            stagger: 1,
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 35%",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="relative h-[200svh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh items-center motion-reduce:static motion-reduce:h-auto motion-reduce:py-[96px]">
        <Container>
          {/* The words are split for the motion only; the heading reads as
              the one sentence it is. */}
          <h2
            aria-label={text}
            className="mx-auto max-w-[20ch] text-center text-[36px] leading-[42px] font-normal tracking-[-0.01em] text-[var(--foreground)] tablet:text-[56px] tablet:leading-[62px] desktop-md:text-[72px] desktop-md:leading-[78px]"
          >
            {words.map((word, index) => (
              <span key={index} aria-hidden="true">
                <span data-word>{word}</span>
                {index < words.length - 1 && " "}
              </span>
            ))}
          </h2>
        </Container>
      </div>
    </section>
  );
}
