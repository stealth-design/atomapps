"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/*
 * Working written into the calculator hero's graph paper, in faint green ink
 * either side of the calculator, each a loop of the app's other tools at
 * work: a long addition worked column by column, a graph plotting itself,
 * and a unit conversion counting up. No panels — they sit on the paper like
 * the background's own curves. From desktop up; under reduced motion they
 * hold still, finished.
 */

const INK = "text-[#5d7a1f]";
const FAINT = "text-[#5d7a1f]/55";

/** A counter that steps every `ms`, or stays at `still` under reduced motion. */
function useStep(ms: number, still: number) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setN((v) => v + 1), ms);
    return () => clearInterval(id);
  }, [ms, reduce]);
  return reduce ? still : n;
}

// Long additions worked out by hand: the answer's digits appear right to left,
// a step each, with a small carry above the next column when there is one,
// then a beat with it whole before the next sum.
const SUMS: [number, number][] = [
  [4827, 1596],
  [7358, 2964],
  [6049, 3875],
  [2786, 5439],
];
const COLS = 5; // the widest answer, 4 + 4 digits

function AdditionInk() {
  const n = useStep(650, COLS + 2);
  const [a, b] = SUMS[Math.floor(n / (COLS + 4)) % SUMS.length];
  const s = n % (COLS + 4); // 0–COLS write a column each (right to left), then a hold
  const done = Math.min(s, COLS); // columns of the answer written so far
  const digits = (v: number) => String(v).padStart(COLS, " ").split("");
  const sum = digits(a + b);
  // The carry into each column, from the column to its right.
  // Column i's place value is p; it gets a carry when the digits to its right overflow it.
  const carry = Array.from({ length: COLS }, (_, i) => {
    const p = 10 ** (COLS - 1 - i);
    return (a % p) + (b % p) >= p ? 1 : 0;
  });
  const row = (cells: string[], show: (i: number) => boolean, cls = "") =>
    cells.map((d, i) => (
      <span
        key={i}
        className={`w-[0.75em] text-center transition-opacity duration-300 ${show(i) ? "opacity-100" : "opacity-0"} ${cls}`}
      >
        {d}
      </span>
    ));
  return (
    <div
      className={`${INK} text-[30px] leading-[1.15] font-light tabular-nums`}
    >
      <div className={`flex justify-end text-[14px] font-semibold ${FAINT}`}>
        {row(
          carry.map((c) => (c ? "1" : " ")),
          // Shown once the column to its right is written.
          (i) => carry[i] === 1 && COLS - i - 1 <= done && done > 0,
        )}
      </div>
      <div className="flex justify-end">{row(digits(a), () => true)}</div>
      <div className="flex justify-end">
        <span className="mr-auto pr-3 opacity-70">+</span>
        {row(digits(b), () => true)}
      </div>
      <div className="mt-1 border-t-2 border-current pt-1">
        <div className="flex justify-end font-normal">
          {row(sum, (i) => COLS - i <= done)}
        </div>
      </div>
    </div>
  );
}

// Each curve over x in [−3, 3], y in [−2, 2].
const CURVES: [string, (x: number) => number][] = [
  ["y = sin 2x", (x) => Math.sin(2 * x) * 1.4],
  ["y = x² − 2", (x) => x * x * 0.45 - 1.6],
  ["y = eˣ ÷ 8", (x) => Math.exp(x) / 8 - 1.5],
  ["y = x³ ÷ 9", (x) => (x * x * x) / 9],
];
const W = 280;
const H = 170;
const path = (f: (x: number) => number) =>
  Array.from({ length: 61 }, (_, i) => {
    const x = -3 + i / 10;
    const y = Math.max(-2.2, Math.min(2.2, f(x)));
    return `${i ? "L" : "M"}${(((x + 3) / 6) * W).toFixed(1)} ${(H / 2 - (y / 2) * (H / 2 - 8)).toFixed(1)}`;
  }).join("");

function GraphInk() {
  const [label, f] = CURVES[useStep(3200, 0) % CURVES.length];
  return (
    <div className={INK}>
      <p className="text-[18px] font-semibold">{label}</p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-[280px] overflow-visible"
        aria-hidden
      >
        <style>{`@keyframes cg-draw{from{stroke-dashoffset:1}}`}</style>
        {/* Axes with arrowheads and ticks, inked onto the paper. */}
        <path
          d={`M0 ${H / 2}H${W}M${W - 6} ${H / 2 - 4}l6 4-6 4M${W / 2} ${H}V0M${W / 2 - 4} 6l4-6 4 6${[1, 2, 4, 5].map((i) => `M${(i * W) / 6} ${H / 2 - 3}v6`).join("")}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".45"
          strokeWidth="1.5"
        />
        {/* Keyed on the curve, so each one plots afresh. */}
        <path
          key={label}
          d={path(f)}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          className="motion-safe:animate-[cg-draw_1.6s_ease-in-out_both]"
        />
      </svg>
    </div>
  );
}

const CONVERSIONS = [
  { from: "5 km", to: 3.107, unit: "mi", dp: 3 },
  { from: "72 °F", to: 22.2, unit: "°C", dp: 1 },
  { from: "1 kg", to: 2.205, unit: "lb", dp: 3 },
  { from: "100 USD", to: 92.4, unit: "EUR", dp: 2 },
];

function ConvertInk() {
  const reduce = useReducedMotion();
  const c = CONVERSIONS[useStep(2600, 0) % CONVERSIONS.length];
  // The count-up's progress, 0–1; the number is drawn from the current
  // conversion, so it never shows one conversion's answer under another's label.
  const [k, setK] = useState(1);
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const run = () => {
      const k = Math.min(1, Math.max(0, (performance.now() - t0) / 700)); // one clock with t0
      setK(k);
      if (k < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [c, reduce]);
  return (
    <div className={INK}>
      <p className={`text-[20px] tabular-nums ${FAINT}`}>{c.from} =</p>
      <p className="text-[48px] leading-none font-light tracking-tight tabular-nums">
        {(reduce ? c.to : c.to * (1 - (1 - k) ** 3)).toFixed(c.dp)}{" "}
        <span className="text-[22px] opacity-60">{c.unit}</span>
      </p>
    </div>
  );
}

// The field's snippets: sums, powers, roots, constants, conversions, each true.
const rnd = (n: number) => Math.floor(Math.random() * n);
const SNIPPETS: (() => string)[] = [
  () => {
    const a = 12 + rnd(88),
      b = 3 + rnd(40);
    return `${a} × ${b} = ${a * b}`;
  },
  () => {
    const a = 100 + rnd(900),
      b = 10 + rnd(90);
    return `${a} + ${b} = ${a + b}`;
  },
  () => {
    const a = 2 + rnd(30);
    return `√${a * a} = ${a}`;
  },
  () => {
    const n = 2 + rnd(9);
    return `2${String(n).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d])} = ${2 ** n}`;
  },
  () => {
    const p = 5 * (1 + rnd(9)),
      v = 20 * (1 + rnd(40));
    return `${p}% of ${v} = ${(p * v) / 100}`;
  },
  () => {
    const a = 2 + rnd(12);
    return `${a}² = ${a * a}`;
  },
  () => {
    const a = 1 + rnd(9),
      b = 1 + rnd(9);
    return `${a}/${b * 2} + ${b}/${b * 2} = ${a + b}/${b * 2}`;
  },
  () => {
    const k = 1 + rnd(20);
    return `${k} km = ${(k * 0.6214).toFixed(2)} mi`;
  },
  () => {
    const n = 5 + rnd(20);
    return `Σ 1…${n} = ${(n * (n + 1)) / 2}`;
  },
  () =>
    [
      "π ≈ 3.14159",
      "e ≈ 2.71828",
      "φ ≈ 1.618",
      "√2 ≈ 1.4142",
      "sin 30° = 0.5",
      "log₁₀ 1000 = 3",
      "cos 0 = 1",
      "ln e = 1",
      "∫ x² dx = x³⁄3",
      "d/dx x³ = 3x²",
      "det[2 1; 3 4] = 5",
      "i² = −1",
      "0.1 + 0.2 ≈ 0.3",
      "a² + b² = c²",
      "1 kg = 2.205 lb",
      "100 °C = 212 °F",
    ][rnd(16)],
  () => {
    const a = 1000 + rnd(9000),
      b = 2 + rnd(8);
    return `${a.toLocaleString("en-US")} ÷ ${b} = ${(a / b).toFixed(2)}`;
  },
];
const CELL_W = 190;
const CELL_H = 64;

type Slot = {
  x: number;
  y: number;
  size: number;
  tilt: number;
  ink: number;
  text: string;
  start: number;
  hold: number;
};

/**
 * Working scattered over the whole hero on a canvas: a jittered grid of
 * snippets, each typing itself out, holding a few seconds, fading and giving
 * way to a new one. Faint over the middle column, where the headline and the
 * calculator are, and stronger toward the edges. A still, finished field
 * under reduced motion.
 */
function NumberField() {
  const anchor = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const hero = anchor.current!.closest("section")!;
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    // Over the paper (the sky layer has no z-index), under the foot fade (z-15) and the copy.
    cv.className = "pointer-events-none absolute inset-0 z-[5] size-full";
    hero.append(cv);
    const ctx = cv.getContext("2d")!;
    let slots: Slot[] = [];
    let w = 0;
    let h = 0;

    const fresh = (s: Pick<Slot, "x" | "y">, now: number): Slot => {
      // Faint in the middle column, full strength from ~560px either side of centre.
      const off = Math.min(1, Math.abs(s.x - w / 2) / 560);
      return {
        ...s,
        size: 12 + rnd(10),
        tilt: ((Math.random() - 0.5) * 10 * Math.PI) / 180,
        ink: (0.1 + Math.random() * 0.14) * (0.3 + 0.7 * off),
        text: SNIPPETS[rnd(SNIPPETS.length)](),
        // Spread over the loop, some already mid-way, so the field is full from the first frame.
        start: now + (reduce ? -1e6 : Math.random() * 5000 - 3500),
        hold: 2500 + Math.random() * 3500,
      };
    };
    const layout = () => {
      // The hero shifts by a pixel or so as the calculator types; only a real
      // resize re-lays the field (doing it every time kept every slot unstarted).
      if (
        Math.abs(hero.clientWidth - w) < 40 &&
        Math.abs(hero.clientHeight - h) < 40
      )
        return;
      const d = devicePixelRatio;
      w = hero.clientWidth;
      h = hero.clientHeight;
      cv.width = w * d;
      cv.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      const now = performance.now();
      slots = [];
      for (let y = CELL_H / 2; y < h; y += CELL_H)
        for (let x = 0; x < w; x += CELL_W) {
          const row = Math.round(y / CELL_H);
          slots.push(
            fresh(
              {
                x: x + (row % 2) * (CELL_W / 2) + (Math.random() - 0.5) * 50,
                y: y + (Math.random() - 0.5) * 20,
              },
              now,
            ),
          );
        }
      draw(now);
    };

    const TYPE = 45; // ms a character
    const FADE = 700;
    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#5d7a1f";
      ctx.textBaseline = "middle";
      for (let i = 0; i < slots.length; i++) {
        let s = slots[i];
        const typed = s.text.length * TYPE;
        let age = now - s.start;
        if (!reduce && age > typed + s.hold + FADE) {
          s = slots[i] = fresh(s, now);
          s.start = now + 300 + Math.random() * 1500;
          age = now - s.start;
        }
        if (age < 0) continue;
        const chars = reduce
          ? s.text.length
          : Math.min(s.text.length, Math.floor(age / TYPE) + 1);
        const out = reduce
          ? 1
          : 1 - Math.max(0, Math.min(1, (age - typed - s.hold) / FADE));
        ctx.globalAlpha = s.ink * out;
        ctx.font = `500 ${s.size}px ui-sans-serif, system-ui, sans-serif`;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.tilt);
        ctx.fillText(s.text.slice(0, chars), 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(hero);
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);
    const loop = () => {
      if (visible && !document.hidden) draw(performance.now()); // the clock the slots were timed on
      raf = requestAnimationFrame(loop);
    };
    if (!reduce) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      cv.remove();
    };
  }, [reduce]);

  return <span ref={anchor} hidden />;
}

/** The working, laid out round the calculator (their positioned parent), and the field over the whole hero. */
export function HeroCalcCards() {
  return (
    <>
      <NumberField />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden opacity-75 mix-blend-multiply desktop-sm:block"
      >
        <div className="absolute top-8 right-[calc(100%+48px)] w-max -rotate-[4deg]">
          <AdditionInk />
        </div>
        <div className="absolute top-[58%] right-[calc(100%+80px)] w-max rotate-[3deg]">
          <ConvertInk />
        </div>
        <div className="absolute top-12 left-[calc(100%+48px)] w-max rotate-[2deg]">
          <GraphInk />
        </div>
      </div>
    </>
  );
}
