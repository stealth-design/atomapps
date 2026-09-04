"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { END_GRID, END_ORDER, type GridConfig } from "./appIcons";

/**
 * Fold 03 — pinned, scrubbed scatter → grid sequence.
 *
 * One element per icon travels the whole way: its CSS box is the START
 * position (see IconScatter) and the timeline drives transforms from there
 * straight to the icon's slot in the final grid. Nothing is duplicated, faded
 * out and replaced by a second set.
 *
 *   0.00–0.10  start frame, ambient float easing off
 *   0.05–0.35  the phone dissolves out
 *   0.05–0.92  icons travel to the grid, shrinking and clearing their blur
 *
 * The path is deliberately direct. It used to collect every icon onto the
 * phone screen first, which meant each one shrank hard into the middle and
 * then grew again on the way out — two changes of direction that read as a
 * glitch rather than a transition. Now each icon moves once, and because the
 * grid slots are in END_ORDER the whole set resolves as a single settle.
 *
 * Geometry is measured from the laid-out DOM and rebuilt on every refresh
 * (`invalidateOnRefresh` + `onRefreshInit`), so resizes and the breakpoint
 * swap stay correct.
 */

const PHASE = { settle: 0.1, phoneOut: 0.35, arrive: 0.92 } as const;

/**
 * Length of the pinned scroll, in viewport heights. ~1.35 works out to roughly
 * three scroll gestures to play the whole sequence — raise it for a longer,
 * slower transformation, lower it for a snappier one.
 */
const SCROLL_VIEWPORTS = 1.35;

/** Hover grow once the grid has settled. */
const HOVER_SCALE = 1.08;
const HOVER_DURATION = 0.32;

/**
 * Smallest gap kept between an icon's start box and the stage edge.
 *
 * Figma lets several icons bleed off the top of the frame (icon-03 sits at
 * y=-145 of its own 167px), which the stage's `overflow-clip` then sliced flat
 * — a row of half-icons along the top edge that read as broken images rather
 * than as bleed. Side bleed is kept, because a cut at the viewport edge reads
 * as intentional; a cut mid-fold does not.
 */
const EDGE_GAP = 10;

/**
 * How far past its own box a blurred icon actually paints, as a multiple of
 * the CSS blur radius.
 *
 * Clamping the layout box alone was not enough: a blur puts visible pixels
 * outside the box, so icon-13 (8px blur, clamped to 10px from the edge) still
 * had 14px of halo sliced off, and icon-10 (20px) lost 30px. A Gaussian is
 * effectively out of ink by 3 sigma, which is what stops the cut being
 * visible rather than merely faint.
 */
const BLUR_REACH = 3;

interface Box {
  cx: number;
  cy: number;
  size: number;
}

/** Layout box of an element relative to the stage, ignoring any transform. */
function layoutBox(el: HTMLElement): Box {
  return {
    cx: el.offsetLeft + el.offsetWidth / 2,
    cy: el.offsetTop + el.offsetHeight / 2,
    size: el.offsetWidth,
  };
}

/** Final grid boxes in END_ORDER, centred on the stage and clear of the heading. */
function gridBoxes(config: GridConfig, stage: HTMLElement, heading: HTMLElement | null): Box[] {
  const stageWidth = stage.offsetWidth;
  const stageHeight = stage.offsetHeight;
  const k = stageWidth / config.reference;
  const size = config.size * k;
  const gap = config.gap * k;
  const rowGap = config.rowGap * k;

  const rowWidth = (count: number) => count * size + (count - 1) * gap;
  const blockHeight = config.rows.length * size + (config.rows.length - 1) * rowGap;

  // Prefer the artboard's optical centre, but never ride up into the heading.
  const headingBottom = heading ? heading.offsetTop + heading.offsetHeight : 0;
  const top = Math.max((stageHeight - blockHeight) / 2, headingBottom + 34 * k);

  const boxes: Box[] = [];
  config.rows.forEach((count, rowIndex) => {
    const rowLeft = (stageWidth - rowWidth(count)) / 2;
    const rowTop = top + rowIndex * (size + rowGap);
    for (let column = 0; column < count; column += 1) {
      boxes.push({
        cx: rowLeft + column * (size + gap) + size / 2,
        cy: rowTop + size / 2,
        size,
      });
    }
  });
  return boxes;
}

export function Fold03Motion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const stage = root?.querySelector<HTMLElement>("[data-f03='stage']");
      if (!root || !stage) return;

      const heading = root.querySelector<HTMLElement>("[data-f03='heading']");
      const floats = gsap.utils.toArray<HTMLElement>("[data-f03-float]", root);
      const phoneParts = gsap.utils.toArray<HTMLElement>("[data-f03='phone']", root);
      const icons = END_ORDER.map((icon) =>
        root.querySelector<HTMLElement>(`[data-f03-icon='${icon}']`),
      ).filter((el): el is HTMLElement => el !== null);

      if (icons.length === 0) return;

      /**
       * Pull any start box that overhangs the top or bottom edge back inside.
       *
       * This has to happen here rather than in IconScatter's stylesheet: an
       * icon's width is a percentage of the stage's width while its `top` is a
       * percentage of the stage's height, so the two only stay in step while
       * the stage keeps the artboard's aspect. Clamping against the measured
       * box instead holds at any stage height. The unclamped `top` is kept per
       * element as a fraction of stage height so a resize re-clamps from the
       * design value rather than from the last clamp.
       */
      const originalTop = new WeakMap<HTMLElement, number>();
      const startBlur = new WeakMap<HTMLElement, number>();
      const fitScatter = () => {
        const stageHeight = stage.offsetHeight;
        if (stageHeight === 0) return;
        icons.forEach((el) => {
          let fraction = originalTop.get(el);
          if (fraction === undefined) {
            fraction = el.offsetTop / stageHeight;
            originalTop.set(el, fraction);
          }

          // Read the blur once, from the stylesheet value. Later reads would
          // catch the timeline mid-clear and under-report the halo.
          let blur = startBlur.get(el);
          if (blur === undefined) {
            blur = parseFloat(/blur\(([\d.]+)px\)/.exec(getComputedStyle(el).filter)?.[1] ?? "0");
            startBlur.set(el, blur);
          }

          const margin = EDGE_GAP + blur * BLUR_REACH;
          const height = el.offsetHeight;
          const lowest = Math.max(margin, stageHeight - height - margin);
          const target = gsap.utils.clamp(margin, lowest, fraction * stageHeight);
          el.style.top = `${Math.round(target)}px`;
        });
      };
      fitScatter();

      /**
       * Hover grow, active only once the icons have settled into the grid.
       * It scales the float element rather than the icon box, because the box
       * carries the timeline's own transform — GSAP composes the ambient `y`
       * and this `scale` on the same element without either fighting.
       */
      const settled = { value: false, reduced: false };
      const hoverPairs = icons
        .map((el) => ({ el, art: el.querySelector<HTMLElement>("[data-f03-float]") }))
        .filter((pair): pair is { el: HTMLElement; art: HTMLElement } => pair.art !== null);

      const hoverTo = (art: HTMLElement, scale: number) =>
        gsap.to(art, {
          scale,
          duration: settled.reduced ? 0 : HOVER_DURATION,
          ease: "power2.out",
          overwrite: "auto",
        });

      const onEnter = (event: Event) => {
        if (!settled.value) return;
        const pair = hoverPairs.find((item) => item.el === event.currentTarget);
        if (pair) hoverTo(pair.art, HOVER_SCALE);
      };
      const onLeave = (event: Event) => {
        const pair = hoverPairs.find((item) => item.el === event.currentTarget);
        if (pair) hoverTo(pair.art, 1);
      };

      hoverPairs.forEach(({ el }) => {
        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointerleave", onLeave);
      });

      const removeHover = () =>
        hoverPairs.forEach(({ el }) => {
          el.removeEventListener("pointerenter", onEnter);
          el.removeEventListener("pointerleave", onLeave);
        });

      const mm = gsap.matchMedia();

      mm.add(
        {
          mobile: "(max-width: 767px)",
          desktop: "(min-width: 768px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { mobile, reduce } = context.conditions as Record<string, boolean>;
          const config = mobile ? END_GRID.mobile : END_GRID.desktop;

          // Reduced motion: no pin, no scrub — just present the finished grid.
          if (reduce) {
            const grid = gridBoxes(config, stage, heading);
            icons.forEach((el, index) => {
              const from = layoutBox(el);
              gsap.set(el, {
                x: grid[index].cx - from.cx,
                y: grid[index].cy - from.cy,
                scale: grid[index].size / from.size,
                opacity: 1,
                filter: "blur(0px)",
              });
            });
            gsap.set(phoneParts, { opacity: 0 });
            settled.value = true;
            settled.reduced = true;
            return;
          }

          // Ambient float — restrained, and scrubbed to nothing as the travel starts.
          const amp = { value: 1 };
          floats.forEach((el, index) => {
            gsap.to(el, {
              y: gsap.utils.random(-6, -3),
              duration: gsap.utils.random(2.6, 4.2),
              delay: index * 0.07,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              modifiers: { y: (value: string) => `${parseFloat(value) * amp.value}px` },
            });
          });

          let grid = gridBoxes(config, stage, heading);
          let starts = icons.map(layoutBox);

          const remeasure = () => {
            fitScatter();
            grid = gridBoxes(config, stage, heading);
            starts = icons.map(layoutBox);
          };

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              // Lock the stage to the middle of the viewport, not its top.
              // The stage is shorter than a tall window, so pinning at the top
              // dumped all the slack below it as one empty band; centring
              // splits it above and below, which reads as margin instead of a
              // hole. Falls back to `top top` when the stage is taller than the
              // window, where centring would hang its top and bottom off
              // screen.
              start: () => (stage.offsetHeight < window.innerHeight ? "center center" : "top top"),
              end: () => `+=${Math.round(window.innerHeight * SCROLL_VIEWPORTS)}`,
              pin: stage,
              // No `anticipatePin`: it pins ahead of the trigger point, which
              // yanked the stage from top:33 to top:0 in one frame (a 25px
              // lurch) just as the lock engaged. Lenis already smooths the
              // approach, so the pin can engage exactly on the trigger.
              scrub: 0.4,
              invalidateOnRefresh: true,
              onRefreshInit: remeasure,
              onToggle: (self) =>
                gsap.set(icons, { willChange: self.isActive ? "transform" : "auto" }),
              onUpdate: (self) => {
                // Only touch the DOM when the state actually flips.
                const done = self.progress > 0.985;
                if (done !== settled.value) {
                  settled.value = done;
                  if (done) stage.dataset.f03Complete = "true";
                  else delete stage.dataset.f03Complete;
                  if (!done) hoverPairs.forEach(({ art }) => gsap.set(art, { scale: 1 }));
                }
              },
            },
          });

          // PHASE 1 — ambient float settles.
          timeline.to(amp, { value: 0, duration: PHASE.settle, ease: "power1.out" }, 0);

          // PHASE 2 — the phone dissolves early, so the icons are travelling
          // across an empty stage rather than over a still-solid device.
          timeline.to(
            phoneParts,
            {
              opacity: 0,
              duration: PHASE.phoneOut - PHASE.settle / 2,
              ease: "power2.inOut",
            },
            PHASE.settle / 2,
          );

          // PHASE 3 — one move per icon: start box straight to its grid slot,
          // shrinking and clearing its blur on the way. `power2.inOut` keeps
          // the travel monotonic, so nothing doubles back.
          timeline.to(
            icons,
            {
              x: (index: number) => grid[index].cx - starts[index].cx,
              y: (index: number) => grid[index].cy - starts[index].cy,
              scale: (index: number) => grid[index].size / starts[index].size,
              opacity: 1,
              filter: "blur(0px)",
              duration: PHASE.arrive - PHASE.settle / 2,
              ease: "power2.inOut",
              stagger: 0.004,
            },
            PHASE.settle / 2,
          );
        },
      );

      return () => {
        removeHover();
        mm.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative w-full">
      {children}
    </div>
  );
}
