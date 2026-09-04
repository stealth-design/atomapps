"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { CLUSTER_FILL, END_GRID, END_ORDER, PHONE_FACE, type GridConfig } from "./appIcons";

/**
 * Fold 03 — pinned, scrubbed scatter → converge → grid sequence.
 *
 * One element per icon travels the whole way: its CSS box is the START
 * position (see IconScatter) and the timeline drives transforms from there to
 * a cluster on the phone screen, then out to the final grid. Nothing is
 * duplicated, faded out and replaced by a second set.
 *
 *   0.00–0.15  start frame, ambient float easing off
 *   0.15–0.55  icons pulled toward the phone, blur clearing — staggered so the
 *              furthest icons set off first
 *   0.55–0.65  collected on the screen while the phone dissolves out from
 *              under them — fully gone before the grid expands
 *   0.65–0.95  icons expand into the grid, decelerating into their slots
 *
 * Cluster slots mirror the final grid order, so the expansion is a coherent
 * unfold instead of 15 crossing paths.
 *
 * Geometry is measured from the laid-out DOM and rebuilt on every refresh
 * (`invalidateOnRefresh` + `onRefreshInit`), so resizes and the breakpoint
 * swap stay correct.
 */

const PHASE = { pull: 0.15, collected: 0.55, expand: 0.65 } as const;

/**
 * Length of the pinned scroll, in viewport heights. ~1.35 works out to roughly
 * three scroll gestures to play the whole sequence — raise it for a longer,
 * slower transformation, lower it for a snappier one.
 */
const SCROLL_VIEWPORTS = 1.35;

/** Hover grow once the grid has settled. */
const HOVER_SCALE = 1.08;
const HOVER_DURATION = 0.32;

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

      /** The plate for the active breakpoint — the other one is display:none. */
      const visiblePlate = () => phoneParts.find((el) => el.offsetParent !== null) ?? null;

      /** Grid + on-screen cluster geometry for the active breakpoint. */
      const measureGeometry = (config: GridConfig) => {
        const grid = gridBoxes(config, stage, heading);
        const plate = visiblePlate();

        // Aim at the phone's face, not the plate centre — the plate is mostly
        // the white fade sitting above the device.
        const faceCx = plate
          ? plate.offsetLeft + PHONE_FACE.cx * plate.offsetWidth
          : stage.offsetWidth / 2;
        const faceCy = plate
          ? plate.offsetTop + PHONE_FACE.cy * plate.offsetHeight
          : stage.offsetHeight * 0.65;
        const faceWidth = plate ? PHONE_FACE.width * plate.offsetWidth : stage.offsetWidth * 0.34;

        // Shrink the grid onto the face, preserving its relative shape.
        const k = stage.offsetWidth / config.reference;
        const widest = Math.max(...config.rows);
        const gridWidth = (widest * config.size + (widest - 1) * config.gap) * k;
        const clusterScale = (CLUSTER_FILL * faceWidth) / gridWidth;

        const gridCx = stage.offsetWidth / 2;
        const gridCy = grid.reduce((sum, box) => sum + box.cy, 0) / grid.length;

        const cluster = grid.map((box) => ({
          cx: faceCx + (box.cx - gridCx) * clusterScale,
          cy: faceCy + (box.cy - gridCy) * clusterScale,
          size: box.size * clusterScale,
        }));

        return { grid, cluster, faceCx, faceCy };
      };

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
            const { grid } = measureGeometry(config);
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

          // Ambient float — restrained, and scrubbed to nothing as the pull starts.
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

          let geo = measureGeometry(config);
          let starts = icons.map(layoutBox);
          let distances = starts.map((box) => Math.hypot(box.cx - geo.faceCx, box.cy - geo.faceCy));
          let furthest = Math.max(...distances);

          const remeasure = () => {
            geo = measureGeometry(config);
            starts = icons.map(layoutBox);
            distances = starts.map((box) => Math.hypot(box.cx - geo.faceCx, box.cy - geo.faceCy));
            furthest = Math.max(...distances);
          };

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              start: "top top",
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
          timeline.to(amp, { value: 0, duration: PHASE.pull, ease: "power1.out" }, 0);

          // PHASE 2 + 3 — pulled in, blur clearing, collected on the screen.
          timeline.to(
            icons,
            {
              x: (index: number) => geo.cluster[index].cx - starts[index].cx,
              y: (index: number) => geo.cluster[index].cy - starts[index].cy,
              scale: (index: number) => geo.cluster[index].size / starts[index].size,
              opacity: 1,
              filter: "blur(0px)",
              duration: PHASE.collected - PHASE.pull - 0.12,
              ease: "power2.inOut",
              // Furthest icons set off first.
              stagger: (index: number) => (1 - distances[index] / furthest) * 0.12,
            },
            PHASE.pull,
          );

          // PHASE 4 — the phone dissolves the moment the last icon lands, so
          // the collected state reads as "apps remain, device is gone" rather
          // than icons sitting on a still-solid phone. Fully clear before the
          // grid starts expanding.
          timeline.to(
            phoneParts,
            { opacity: 0, scale: 0.96, duration: PHASE.expand - PHASE.collected, ease: "power2.inOut" },
            PHASE.collected,
          );

          // PHASE 5 — expand into the grid, decelerating into place.
          timeline.to(
            icons,
            {
              x: (index: number) => geo.grid[index].cx - starts[index].cx,
              y: (index: number) => geo.grid[index].cy - starts[index].cy,
              scale: (index: number) => geo.grid[index].size / starts[index].size,
              duration: 1 - PHASE.expand - 0.05,
              ease: "power2.out",
              stagger: 0.0035,
            },
            PHASE.expand,
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
