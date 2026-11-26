"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

const GOAL = 100;
const STRIDE = 28; // px along the path per footprint
const PACE = 380; // ms per step
const MAX = 40; // prints on screen at once
const LIFE = 4000; // ms a print takes to fade
const POP = 700; // ms the "+1" over a new print shows
const R = 42; // ring radius on a 100-unit grid
const C = 2 * Math.PI * R;

// The sky's sand path (HeroSkies' STEPS `P`), in its units: x and y from the
// hero's centre over its height, y up.
const PATH = (x: number) =>
  -0.12 + 0.09 * Math.sin(x * 3.1 + 0.6) + 0.04 * Math.sin(x * 7.3);

// The cards beside the widget.
const RANGES = ["Day", "Week", "Month"];
const WEEK = [62, 118, 45, 96, 130, 74]; // Monday to Saturday; today's bar is the live count
const ICONS = {
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  flame:
    "M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 .8 1.5 1.5 2 2.5 2 0-2.5-.5-4.5.5-7Z",
  pin: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
};
// Each card rises in once, then bobs; reduced motion skips both.
const CARD =
  "rounded-2xl bg-white/95 p-2 shadow-[0_24px_48px_-20px_rgba(20,30,80,0.45)] ring-1 ring-black/5 motion-safe:animate-[st-in_0.6s_ease-out_both,st-bob_6s_ease-in-out_0.6s_infinite]";

type Print = { x: number; y: number; a: number; left: boolean; t: number };

// One left shoe print, pointing up, traced from the reference art: the sole (toe leaning out,
// arch dipping in on the right), a slanted gap, then the heel set off to the right.
const drawShoe = (ctx: CanvasRenderingContext2D) => {
  ctx.moveTo(-2.49, 6.04);
  ctx.lineTo(3.94, 4.1);
  ctx.bezierCurveTo(3.89, 3.82, 3.68, 3, 3.67, 2.42);
  ctx.bezierCurveTo(3.65, 1.84, 3.73, 1.33, 3.85, 0.61);
  ctx.bezierCurveTo(3.97, -0.11, 4.22, -0.94, 4.39, -1.88);
  ctx.bezierCurveTo(4.56, -2.82, 4.8, -3.92, 4.84, -5.05);
  ctx.bezierCurveTo(4.89, -6.18, 4.87, -7.5, 4.66, -8.67);
  ctx.bezierCurveTo(4.46, -9.84, 4.13, -11.04, 3.62, -12.06);
  ctx.bezierCurveTo(3.11, -13.08, 2.38, -14.12, 1.58, -14.78);
  ctx.bezierCurveTo(0.79, -15.43, -0.26, -15.92, -1.13, -16);
  ctx.bezierCurveTo(-2, -16.08, -2.88, -15.77, -3.62, -15.23);
  ctx.bezierCurveTo(-4.36, -14.69, -5.06, -13.76, -5.57, -12.74);
  ctx.bezierCurveTo(-6.07, -11.72, -6.45, -10.33, -6.65, -9.12);
  ctx.bezierCurveTo(-6.86, -7.91, -6.86, -6.71, -6.79, -5.5);
  ctx.bezierCurveTo(-6.71, -4.29, -6.54, -3.16, -6.2, -1.88);
  ctx.bezierCurveTo(-5.86, -0.6, -5.37, 0.88, -4.75, 2.2);
  ctx.bezierCurveTo(-4.13, 3.52, -2.87, 5.4, -2.49, 6.04);
  ctx.closePath();
  ctx.moveTo(-1.58, 7.63);
  ctx.lineTo(4.75, 5.91);
  ctx.bezierCurveTo(4.96, 6.27, 5.66, 7.26, 6.02, 8.08);
  ctx.bezierCurveTo(6.38, 8.89, 6.77, 9.93, 6.93, 10.79);
  ctx.bezierCurveTo(7.08, 11.66, 7.1, 12.55, 6.93, 13.28);
  ctx.bezierCurveTo(6.75, 14.02, 6.4, 14.76, 5.88, 15.23);
  ctx.bezierCurveTo(5.37, 15.7, 4.6, 16, 3.85, 16.09);
  ctx.bezierCurveTo(3.09, 16.18, 2.07, 16.05, 1.36, 15.77);
  ctx.bezierCurveTo(0.64, 15.49, 0, 15.09, -0.45, 14.42);
  ctx.bezierCurveTo(-0.91, 13.74, -1.15, 12.57, -1.36, 11.7);
  ctx.bezierCurveTo(-1.56, 10.83, -1.64, 9.89, -1.67, 9.21);
  ctx.bezierCurveTo(-1.71, 8.53, -1.6, 7.89, -1.58, 7.63);
  ctx.closePath();
};

function drawPrint(
  ctx: CanvasRenderingContext2D,
  p: Print,
  alpha: number,
  color: string,
) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.a + Math.PI / 2); // the sole points up; `a` is the heading, 0 = right
  if (!p.left) ctx.scale(-1, 1); // the drawn shoe is a left one; mirror it for the right
  ctx.globalAlpha = alpha * 0.55;
  ctx.fillStyle = color;
  ctx.beginPath();
  drawShoe(ctx);
  ctx.fill();
  ctx.restore();
}

/**
 * The step tracker hero, playing by itself: someone walks the sky's sand path
 * (HeroSkies' STEPS) across the hero and back round, leaving a print every
 * PACE ms, each with a "+1" rising off it and fading after LIFE ms. A cluster
 * of the app's screens sits under the store button: the day's card with its
 * step ring in the middle, the range switch and the stats straddling its top
 * and bottom edges, and the week's chart and the step goal tilted either side.
 * Under reduced motion the walk is a still: a stretch of prints along the
 * path and the count they make.
 *
 * The cards, ring included, scroll away with the hero.
 */
export function HeroSteps({ accent }: { accent: string }) {
  const [steps, setSteps] = useState(0);
  const [range, setRange] = useState(0);
  const cluster = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // The range switch flips through its options on its own.
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(
      () => setRange((r) => (r + 1) % RANGES.length),
      2600,
    );
    return () => clearInterval(id);
  }, [reduce]);

  // The trail: a canvas in the sky's own parallax layer, so the prints scroll
  // with the path they're on; under the fade (z-15) and the copy.
  useEffect(() => {
    const hero = cluster.current!.closest("section")!;
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.className = "pointer-events-none absolute inset-0 z-[14] size-full";
    (hero.querySelector("[data-depth='0.35']") ?? hero).append(cv);
    const ctx = cv.getContext("2d")!;

    const prints: Print[] = [];
    let left = false;
    let raf = 0;
    let walker = -STRIDE;

    const frame = (now: number) => {
      raf = 0;
      while (!reduce && prints.length && now - prints[0].t > LIFE)
        prints.shift();
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.font = "700 14px system-ui, sans-serif";
      ctx.textAlign = "center";
      for (const p of prints) {
        const age = Math.max(0, now - p.t);
        drawPrint(ctx, p, reduce ? 1 : 1 - age / LIFE, accent);
        // Each print is one step on the counter: a "+1" rises off it.
        if (!reduce && age < POP) {
          ctx.globalAlpha = 1 - age / POP;
          ctx.fillStyle = accent;
          ctx.fillText("+1", p.x, p.y - 20 - age * 0.03);
          ctx.globalAlpha = 1;
        }
      }
      if (!reduce && prints.length) raf = requestAnimationFrame(frame);
    };
    const kick = () => (raf ||= requestAnimationFrame(frame));

    const resize = () => {
      const d = Math.min(devicePixelRatio, 1.5);
      cv.width = hero.clientWidth * d;
      cv.height = hero.clientHeight * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      kick();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(hero);

    // The path's height at x px across the hero, in px down it.
    const onPath = (x: number) => {
      const h = hero.clientHeight;
      return h / 2 - PATH((x - hero.clientWidth / 2) / h) * h;
    };
    // The next print, a little to the side of the path, alternating feet.
    const step = () => {
      walker = walker > hero.clientWidth + STRIDE ? -STRIDE : walker + STRIDE;
      const y = onPath(walker);
      const a = Math.atan2(onPath(walker + 4) - y, 4);
      left = !left;
      const o = left ? -7 : 7;
      prints.push({
        x: walker - Math.sin(a) * o,
        y: y + Math.cos(a) * o,
        a,
        left,
        t: performance.now(),
      });
      if (prints.length > MAX) prints.shift();
      setSteps((s) => s + 1);
      kick();
    };

    let walk = 0;
    if (reduce) {
      walker = hero.clientWidth * 0.08;
      for (let i = 0; i < 14; i++) step();
    } else {
      // Paused while the hero is off screen or the tab is hidden.
      walk = window.setInterval(() => {
        if (!document.hidden && hero.getBoundingClientRect().bottom > 0) step();
      }, PACE);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(walk);
      ro.disconnect();
      cv.remove();
    };
  }, [accent, reduce]);

  const reached = steps >= GOAL;
  const secs = Math.round(steps * 0.6);
  const stats = [
    [ICONS.clock, `${Math.floor(secs / 60)}m ${secs % 60}s`, "Time"],
    [ICONS.flame, (steps * 0.04).toFixed(1), "Cal"],
    [ICONS.pin, `${Math.round(steps * 0.762)}`, "Meters"],
  ];
  const week = [...WEEK, steps];

  return (
    <div ref={cluster} className="relative mx-auto mt-14 mb-36 w-[300px] tablet:mb-44 short:mt-12 compact:mt-12">
      <style>{`@keyframes st-in{from{opacity:0;transform:translateY(16px) scale(.96)}}@keyframes st-bob{50%{translate:0 -6px}}`}</style>

      {/* The day's card: the ring, then the day. */}
      <div className="relative z-20 flex flex-col items-center rounded-[32px] bg-white/95 px-6 pt-10 pb-14 shadow-[0_30px_60px_-30px_rgba(20,30,80,0.5)] ring-1 ring-black/5 motion-safe:animate-[st-in_0.6s_ease-out_both]">
        <div
          role="img"
          aria-label={`${steps} of ${GOAL} steps`}
          className="relative size-[128px] rounded-full"
        >
          <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="#e3e6f3"
              strokeWidth="9"
            />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={reached ? "#3ddc84" : accent}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - Math.min(1, steps / GOAL))}
              opacity={steps ? 1 : 0}
              className="transition-[stroke-dashoffset] duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[34px] leading-none font-bold tabular-nums">
              {steps}
            </span>
            <span className="mt-1 text-[11px] text-[#8a8a92]">
              of {GOAL} steps
            </span>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-2 text-[20px] leading-none font-bold">
          Today
          <span
            className={`size-2 rounded-full ${reached ? "bg-[#3ddc84]" : "animate-pulse"}`}
            style={reached ? undefined : { background: accent }}
          />
        </p>
        <p className="mt-1.5 text-[13px] text-[#8a8a92]">
          {reached
            ? "Goal reached 🎉"
            : steps
              ? "Out for a walk"
              : "Let's go for a walk"}
        </p>
      </div>

      <div aria-hidden>
        {/* Straddling the card's top edge. */}
        {/* The centring sits on a wrapper: the cards' bob animates `translate`. */}
        <div className="absolute -top-6 left-1/2 z-20 -translate-x-1/2">
          <div className={CARD} style={{ animationDelay: "0.15s" }}>
            <div className="relative flex rounded-full bg-[#eef0f6] p-1 text-[13px] font-semibold">
              <span
                className="absolute inset-y-1 left-1 w-[72px] rounded-full bg-[#1d1d1f] transition-transform duration-500"
                style={{ transform: `translateX(${range * 72}px)` }}
              />
              {RANGES.map((r, i) => (
                <span
                  key={r}
                  className={`relative w-[72px] py-1.5 text-center transition-colors duration-500 ${i === range ? "text-white" : "text-[#8a8a92]"}`}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Straddling the card's bottom edge. */}
        <div className="absolute -bottom-10 left-1/2 z-20 -translate-x-1/2">
          <div
            className={`${CARD} flex divide-x divide-black/5 py-3`}
            style={{ animationDelay: "0.25s" }}
          >
            {stats.map(([icon, value, label]) => (
              <div
                key={label}
                className="flex w-[84px] flex-col items-center gap-0.5"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke={accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={icon} />
                </svg>
                <span className="text-[15px] font-bold tabular-nums">
                  {value}
                </span>
                <span className="text-[11px] text-[#8a8a92]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tilted either side, tablet up. */}
        <div className="absolute z-20 top-10 right-[calc(100%+28px)] hidden -rotate-[5deg] tablet:block">
          <div
            className={`${CARD} w-[250px] p-4`}
            style={{ animationDelay: "0.35s" }}
          >
            <p className="flex justify-between text-[12px] text-[#8a8a92]">
              This week{" "}
              <span className="font-semibold text-[#1d1d1f]">
                {(WEEK.reduce((a, b) => a + b, 0) + steps).toLocaleString(
                  "en-US",
                )}{" "}
                steps
              </span>
            </p>
            <div className="relative mt-3 flex h-[90px] items-end gap-2 border-b border-black/5">
              {/* The goal line, at 100 of the chart's 140. */}
              <span className="absolute inset-x-0 bottom-[71%] border-t border-dashed border-black/20" />
              {week.map((v, i) => (
                <span key={i} className="relative flex-1">
                  <span
                    className="block rounded-t-[4px] transition-[height] duration-300"
                    style={{
                      // Today's bar stops short of the top, so its count badge (24px above it) stays under the header.
                      height: `${(Math.min(v, i === 6 ? 80 : 140) / 140) * 90}px`,
                      background: i === 6 ? accent : "#c9d3f5",
                    }}
                  />
                  {i === 6 && (
                    <span
                      className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums"
                      style={{ background: accent }}
                    >
                      {steps}
                    </span>
                  )}
                </span>
              ))}
            </div>
            <p className="mt-1.5 flex gap-2 text-[10px] text-[#8a8a92]">
              {"MTWTFSS".split("").map((d, i) => (
                <span
                  key={i}
                  className={`flex-1 text-center ${i === 6 ? "font-bold text-[#1d1d1f]" : ""}`}
                >
                  {d}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="absolute z-20 top-2 left-[calc(100%+28px)] hidden rotate-[5deg] tablet:block">
          <div
            className={`${CARD} w-[220px] px-5 py-4 text-center`}
            style={{ animationDelay: "0.45s" }}
          >
            <p className="text-[13px] font-semibold">Step Goal</p>
            <p className="mt-2 text-[17px] text-[#b4b4bc] tabular-nums">50</p>
            <p className="my-1 border-y border-black/5 py-1.5 tabular-nums">
              <span className="text-[30px] font-bold" style={{ color: accent }}>
                {GOAL}
              </span>
              <span className="ml-1 text-[12px] text-[#8a8a92]">steps</span>
            </p>
            <p className="text-[17px] text-[#b4b4bc] tabular-nums">150</p>
            <p
              className="mt-3 rounded-full py-2 text-[13px] font-semibold text-white"
              style={{ background: reached ? "#3ddc84" : accent }}
            >
              {reached ? "Goal reached 🎉" : `${GOAL - steps} to go`}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
