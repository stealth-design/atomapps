"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const GOAL = 10000;
const KM_PER_STEP = 0.000762;
const KCAL_PER_STEP = 0.04;
const STEPS_PER_MIN = 100;
const R = 42; // ring radius on a 100-unit grid
const C = 2 * Math.PI * R;

/**
 * The step tracker hero's widget. It is fixed to the viewport, starting
 * centred low in the hero; as the hero scrolls out it slides and shrinks into
 * the bottom-left corner (`--p`, 0 → 1 over the first half of the hero) and
 * stays there. The figures are the scroll: the page's foot is the day's goal.
 *
 * The start position is all CSS (from `--w` and `--h`, the widget's size), so
 * the server render already sits where the first scroll picks it up.
 */
export function HeroSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(0); // share of the page scrolled, 0–1

  useEffect(() => {
    const el = ref.current!;
    const hero = el.closest("section")!;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      el.style.setProperty("--p", String(Math.min(1, scrollY / (hero.offsetHeight * 0.5))));
      setDone(max > 0 ? Math.min(1, scrollY / max) : 0);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  const steps = Math.round(done * GOAL);
  const reached = steps >= GOAL;
  const metrics = [
    ["Distance", `${(steps * KM_PER_STEP).toFixed(2)} km`],
    ["Calories", `${Math.round(steps * KCAL_PER_STEP)} kcal`],
    ["Active", `${Math.round(steps / STEPS_PER_MIN)} min`],
  ];

  return (
    <div
      ref={ref}
      // Docked: 16px from the bottom-left corner at half size. Undocked
      // (p = 0): centred across, and down the gap between the store button
      // (~440px down) and the hero's strip (~120px off its foot), but never
      // above 450px from the top (58% of a short screen), so it can't ride up
      // into the headline. Its height is capped at a third of a short screen.
      style={
        {
          "--w": "min(600px, calc(100vw - 32px))",
          "--h": "min(270px, calc((100vw - 32px) * 0.46), 34svh)",
          transform:
            "translate(calc((50vw - 16px - var(--w) / 2) * (1 - var(--p, 0))), calc((max(min(450px, 58svh), 50svh + 160px - var(--h) / 2) + var(--h) + 16px - 100svh) * (1 - var(--p, 0)))) scale(calc(1 - 0.5 * var(--p, 0)))",
        } as CSSProperties
      }
      className="fixed bottom-4 left-4 z-30 h-[var(--h)] w-[var(--w)] origin-bottom-left"
    >
      <div className="flex h-full items-center gap-6 rounded-[40px] bg-white/85 p-5 tablet:gap-8 tablet:p-7 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] ring-1 ring-black/5 backdrop-blur-xl">
        <div className="relative aspect-square h-full shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={R} fill="none" stroke="#e3e6f3" strokeWidth="9" />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - done)}
              opacity={steps ? 1 : 0}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[24px] leading-none font-bold tabular-nums tablet:text-[44px]">{steps.toLocaleString("en-US")}</span>
            <span className="mt-1 text-[12px] text-[#8a8a92] tablet:text-[15px]">of {GOAL.toLocaleString("en-US")}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[17px] leading-none font-bold tablet:text-[28px]">
            Today
            <span className={`size-2 rounded-full ${reached ? "bg-[#3ddc84]" : "animate-pulse bg-[var(--accent)]"}`} />
          </p>
          <p className="mt-1.5 truncate text-[12px] text-[#8a8a92] tablet:text-[16px]">{reached ? "Goal reached 🎉" : steps ? "Keep scrolling" : "Scroll to walk"}</p>
          <dl className="mt-3 divide-y divide-black/5 text-[13px] tablet:mt-5 tablet:text-[18px]">
            {metrics.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-2 py-1.5">
                <dt className="text-[#8a8a92]">{label}</dt>
                <dd className="font-bold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
