"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToY } from "@/lib/lenis";

export type Step = { title: string; text: string; image: string };

const two = (n: number) => String(n).padStart(2, "0");

/**
 * The "How it works" band: `intro` (the band's heading) over a scroll-driven
 * slider — the step's counter, text and prev/next buttons beside a
 * single-image window. The whole band is sized to one screen and pins at the
 * top while the page's scroll slides the images through that window one at a
 * time, snapping to each step. The image's size (--s) is whatever height the
 * screen has left after the header, intro and panel, capped at 560px, so the
 * band always fits. Buttons and a click on the image scroll the page to a step's point
 * rather than moving the strip, so the scroll position stays in charge.
 */
export function StepSlider({ steps, intro, className = "" }: { steps: Step[]; intro?: ReactNode; className?: string }) {
  const n = steps.length;
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | undefined>(undefined);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const el = track.current!;
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tween = gsap.to(el, {
        // One slide is exactly the window's width, so this lands on the last.
        x: () => -(n - 1) * el.parentElement!.offsetWidth,
        ease: "none",
        // The step follows the strip, not the scroll: with scrub smoothing the
        // strip trails the scrollbar, so reading the scroll would flip the
        // counter and text before the image had arrived.
        onUpdate() {
          setActive(Math.round(this.progress() * (n - 1)));
        },
        scrollTrigger: {
          trigger: root.current,
          pin: true,
          start: "top top",
          end: () => `+=${(n - 1) * innerHeight * 0.6}`,
          scrub: still ? true : 0.6,
          snap: still ? undefined : { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.5 }, ease: "power2.inOut" },
          invalidateOnRefresh: true,
        },
      });
      trigger.current = tween.scrollTrigger;
    },
    { scope: root },
  );

  const goTo = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    const k = Math.max(0, Math.min(n - 1, i));
    scrollToY(st.start + ((st.end - st.start) * k) / (n - 1));
  };

  return (
    <section
      ref={root}
      aria-label="How it works"
      className={`flex min-h-svh flex-col justify-center gap-6 px-[var(--content-padding)] pt-[calc(var(--header-height)+20px)] pb-8 [--s:max(220px,min(88vw,calc(100svh-480px)))] tablet:gap-10 desktop-sm:[--s:max(320px,min(560px,calc(100svh-360px)))] ${className}`}
    >
      {intro}
      <div className="mx-auto flex w-full max-w-[960px] flex-col items-center gap-6 desktop-sm:flex-row desktop-sm:justify-center desktop-sm:gap-20">
        {/* ---------- panel: counter, active text, nav ---------- */}
        <div className="grid w-full max-w-[420px] grid-cols-[1fr_auto] items-center gap-x-4 gap-y-4 desktop-sm:flex desktop-sm:h-[var(--s)] desktop-sm:w-[380px] desktop-sm:flex-col desktop-sm:items-start desktop-sm:justify-between">
          <div className="flex items-center gap-3 text-[48px] leading-none font-semibold tracking-[-0.04em] tablet:text-[64px] desktop-sm:order-1 desktop-sm:text-[80px] short:text-[64px]">
            <span className="h-[1em] overflow-hidden" aria-live="polite">
              <span
                className="flex flex-col transition-transform duration-[450ms] ease-[cubic-bezier(0.215,0.61,0.355,1)] motion-reduce:transition-none"
                // One number per 1em row; a % here would be of the whole column.
                style={{ transform: `translateY(${-active}em)` }}
              >
                {steps.map((_, i) => (
                  <span key={i} className="block h-[1em] w-[2ch]" aria-hidden={i !== active}>
                    {two(i + 1)}
                  </span>
                ))}
              </span>
            </span>
            <span aria-hidden className="h-[0.7em] w-[2px] rotate-[15deg] bg-black/20" />
            <span className="w-[2ch] text-black/25">{two(n)}</span>
          </div>

          <div className="flex gap-3 has-[button:hover]:[&>button:not(:hover)]:opacity-40 desktop-sm:order-3 desktop-sm:gap-4">
            <NavButton label="Previous step" disabled={active === 0} onClick={() => goTo(active - 1)} />
            <NavButton label="Next step" next disabled={active === n - 1} onClick={() => goTo(active + 1)} />
          </div>

          {/* All steps share one grid cell. Direction-aware reveal: a step
              behind the active one sits above its mask, one ahead sits below,
              so moving forward the old title's words leave upward as the new
              one's rise in after it — and backward the reverse, in step with
              the image sliding the other way. Words stagger in, leave at once. */}
          <div className="col-span-2 grid desktop-sm:order-2">
            {steps.map(({ title, text }, i) => {
              const at = i === active ? 0 : i < active ? -1 : 1;
              const ease = "ease-[cubic-bezier(0.625,0.05,0,1)] motion-reduce:transition-none";
              return (
                <div key={title} aria-hidden={at !== 0} className={`col-start-1 row-start-1 ${at ? "pointer-events-none" : ""}`}>
                  <h3 className="text-[20px] leading-[1.15] font-semibold tracking-[-0.01em] tablet:text-[26px] desktop-sm:text-[28px]">
                    {title.split(" ").map((word, w) => (
                      <span key={w} className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                        <span
                          className={`inline-block transition-transform duration-700 ${ease}`}
                          style={{ transform: `translateY(${at * 110}%)`, transitionDelay: at ? "0ms" : `${120 + w * 35}ms` }}
                        >
                          {word}&nbsp;
                        </span>
                      </span>
                    ))}
                  </h3>
                  <p
                    className={`mt-2 text-[14px] leading-[1.5] text-black/55 transition-[opacity,transform,filter] duration-700 tablet:mt-3 tablet:text-[16px] ${ease}`}
                    style={{
                      opacity: at ? 0 : 1,
                      filter: at ? "blur(6px)" : "none",
                      transform: `translateY(${at * 14}px)`,
                      transitionDelay: at ? "0ms" : "320ms",
                    }}
                  >
                    {text}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

        {/* ---------- one-image window ---------- */}
        <div className="relative size-[var(--s)] shrink-0 overflow-hidden rounded-[24px] tablet:rounded-[28px]">
          <div ref={track} className="flex h-full will-change-transform">
            {steps.map(({ title, image }, i) => (
              <button
                key={title}
                type="button"
                tabIndex={-1}
                aria-hidden={i !== active}
                onClick={() => goTo(i + 1)}
                className="relative h-full w-full shrink-0"
              >
                <Image
                  src={image}
                  alt=""
                  width={608}
                  height={608}
                  sizes="(max-width: 1023px) 90vw, 420px"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
          <span className="pointer-events-none absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white py-1.5 pr-3 pl-2.5 text-[12px] font-medium shadow-sm">
            <span className="size-1.5 rounded-full bg-[var(--accent)]" />
            Step {two(active + 1)}
          </span>
        </div>
      </div>
    </section>
  );
}

/** Square outline button whose corner brackets open out on hover. */
function NavButton({ label, next, disabled, onClick }: { label: string; next?: boolean; disabled?: boolean; onClick: () => void }) {
  const corner = "absolute size-3 border-[var(--foreground)]";
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="group relative grid size-11 place-items-center rounded-[10px] tablet:size-14 border border-black/15 text-[var(--foreground)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] disabled:opacity-30 can-hover:enabled:hover:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
    >
      <svg viewBox="0 0 17 12" className={`h-3 w-4 ${next ? "rotate-180" : ""}`} fill="currentColor" aria-hidden>
        <path d="M6.3 12l1.2-1.1-4-4.1h13V5.2h-13l4-4.1L6.3 0 .5 6l5.8 6Z" />
      </svg>
      <span aria-hidden className="pointer-events-none absolute -inset-px transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:group-enabled:group-hover:scale-[1.4]">
        <span className={`${corner} top-0 left-0 rounded-tl-[10px] border-t border-l`} />
        <span className={`${corner} top-0 right-0 rounded-tr-[10px] border-t border-r`} />
        <span className={`${corner} bottom-0 left-0 rounded-bl-[10px] border-b border-l`} />
        <span className={`${corner} right-0 bottom-0 rounded-br-[10px] border-r border-b`} />
      </span>
    </button>
  );
}
