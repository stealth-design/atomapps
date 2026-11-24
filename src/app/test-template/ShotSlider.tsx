"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "./useReducedMotion";

type Shot = { src: string; width: number; height: number };

const EVERY = 2500; // ms between steps

// How many show at once, matching the --per breakpoints below.
const PER = ["(min-width: 1024px)", "(min-width: 768px)"];
const subscribe = (cb: () => void) => {
  const mqs = PER.map((q) => matchMedia(q));
  mqs.forEach((m) => m.addEventListener("change", cb));
  return () => mqs.forEach((m) => m.removeEventListener("change", cb));
};
const perNow = () => (matchMedia(PER[0]).matches ? 4 : matchMedia(PER[1]).matches ? 3 : 2);
const GAP = 20; // px between screenshots

/**
 * The app's screenshots, each once, four at a time (three on tablets, two on phones),
 * stepping on one at a time on their own and looping: the first four are
 * repeated at the end, and once the track reaches them it jumps back to the
 * start without a transition, so the loop is seamless. Pointer over it or a
 * control focused holds it; under reduced motion it only moves on the arrows.
 */
export function ShotSlider({ shots, label }: { shots: Shot[]; label: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [held, setHeld] = useState(false);
  const n = shots.length;
  const per = useSyncExternalStore(subscribe, perNow, () => 4);
  // Only an app with more screenshots than fit slides; the loop's copies of the first few never show beside their originals.
  const slides = n > per;
  const track = slides ? [...shots, ...shots.slice(0, per)] : shots;
  // One step at a time: a press (or tick) during a step is ignored, so quick presses can't run the track past its end.
  const busy = useRef(0);
  const step = useCallback(
    (d: number) => {
      const now = performance.now();
      if (now - busy.current < 720) return;
      busy.current = now;
      setAnimate(true);
      setI((v) => (v + d < 0 ? n - 1 : v + d));
    },
    [n],
  );

  useEffect(() => {
    if (reduce || held || !slides) return;
    const id = setInterval(() => !document.hidden && step(1), EVERY);
    return () => clearInterval(id);
  }, [reduce, held, slides, step]);

  // Past the last real one: snap back to the same picture at the start, unanimated.
  const settle = () => {
    if (i >= n) {
      setAnimate(false);
      setI(i - n);
    }
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="mx-auto max-w-[1100px] px-4 [--per:2] tablet:[--per:3] desktop-sm:[--per:4]"
    >
      <div className="overflow-hidden">
        <ul
          onTransitionEnd={settle}
          className={`flex ${animate ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" : ""}`}
          style={{ gap: GAP, transform: `translateX(calc(${-i} * (100% + ${GAP}px) / var(--per)))` }}
        >
          {track.map((s, k) => (
            <li
              key={k}
              aria-hidden={k < i || k >= i + per || undefined}
              className="shrink-0 overflow-hidden rounded-[14px]"
              style={{ width: `calc((100% - (var(--per) - 1) * ${GAP}px) / var(--per))` }}
            >
              <Image src={s.src} alt="" width={s.width} height={s.height} sizes="(max-width: 767px) 50vw, 260px" className="aspect-[9/16] w-full object-cover" />
            </li>
          ))}
        </ul>
      </div>
      <div className={`mt-6 flex justify-center gap-3 ${slides ? "" : "hidden"}`}>
        {[-1, 1].map((d) => (
          <button
            key={d}
            type="button"
            aria-label={d < 0 ? "Previous screenshot" : "Next screenshot"}
            onClick={() => step(d)}
            className="grid size-10 place-items-center rounded-full bg-[#eef0f8] text-[var(--foreground)] transition-colors can-hover:hover:bg-[#e2e5f1]"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={d < 0 ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
