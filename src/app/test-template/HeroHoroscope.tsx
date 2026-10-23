"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Clover } from "lucide-react";
import { PhoneModel, type PhoneAction } from "./PhoneModel";

const W = 630; // the screen canvas, 9:20 like the phone's display
const H = 1400;

type Sign = {
  name: string;
  glyph: string;
  dates: string;
  /** Star positions on a 100-unit square, then lines as pairs of star indexes. */
  stars: [number, number][];
  lines: [number, number][];
  reading: string;
  lucky: [number, string];
  /** Where it sits round the phone, in % of the sky box. */
  at: [number, number];
};

const chain = (n: number) => Array.from({ length: n - 1 }, (_, i): [number, number] => [i, i + 1]);

// Simplified star maps. The readings are fixed sample text, not today's real horoscope.
const SIGNS: Sign[] = [
  { name: "Aries", glyph: "♈", dates: "Mar 21 – Apr 19", stars: [[5, 45], [40, 28], [70, 32], [92, 55]], lines: chain(4), reading: "Your energy is high, so start the thing you keep putting off. A quick win early sets the pace for the week.", lucky: [9, "Red"], at: [6, 8] },
  { name: "Taurus", glyph: "♉", dates: "Apr 20 – May 20", stars: [[10, 10], [40, 45], [55, 58], [72, 42], [92, 12], [55, 88]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]], reading: "Slow and steady wins today. Spend time on comfort and the people who make you feel at home.", lucky: [6, "Green"], at: [17, 36] },
  { name: "Gemini", glyph: "♊", dates: "May 21 – Jun 20", stars: [[20, 8], [24, 50], [30, 92], [72, 8], [70, 50], [76, 92]], lines: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3]], reading: "A conversation opens a door. Say the idea out loud; someone is ready to help you run with it.", lucky: [5, "Yellow"], at: [4, 64] },
  { name: "Cancer", glyph: "♋", dates: "Jun 21 – Jul 22", stars: [[50, 8], [50, 45], [18, 88], [84, 82]], lines: [[0, 1], [1, 2], [1, 3]], reading: "Home is where you recharge today. A small kindness you give comes back to you twice.", lucky: [2, "Silver"], at: [22, 86] },
  { name: "Leo", glyph: "♌", dates: "Jul 23 – Aug 22", stars: [[18, 30], [30, 8], [52, 14], [46, 42], [60, 62], [92, 66], [80, 92]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 4]], reading: "The spotlight finds you. Share your work with confidence, and let someone else shine beside you.", lucky: [7, "Gold"], at: [30, 6] },
  { name: "Virgo", glyph: "♍", dates: "Aug 23 – Sep 22", stars: [[8, 20], [30, 36], [50, 30], [60, 56], [88, 50], [56, 88], [28, 76]], lines: chain(7), reading: "Details matter today. Tidy one corner of your life and the rest will feel lighter by evening.", lucky: [3, "Navy"], at: [70, 6] },
  { name: "Libra", glyph: "♎", dates: "Sep 23 – Oct 22", stars: [[50, 8], [20, 46], [80, 46], [14, 88], [86, 82]], lines: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4]], reading: "Balance comes easily. A fair word settles an old disagreement, and your plans line up neatly.", lucky: [8, "Pink"], at: [78, 86] },
  { name: "Scorpio", glyph: "♏", dates: "Oct 23 – Nov 21", stars: [[8, 14], [24, 30], [40, 40], [50, 62], [60, 82], [80, 88], [94, 72]], lines: chain(7), reading: "Trust your instinct on a choice you have been circling. What you sense beneath the surface is right.", lucky: [4, "Crimson"], at: [94, 64] },
  { name: "Sagittarius", glyph: "♐", dates: "Nov 22 – Dec 21", stars: [[18, 42], [40, 28], [62, 34], [74, 56], [52, 70], [24, 64]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], reading: "Adventure calls, even a small one. Take a new route, try a new place, and say yes to the plan.", lucky: [3, "Purple"], at: [83, 36] },
  { name: "Capricorn", glyph: "♑", dates: "Dec 22 – Jan 19", stars: [[8, 20], [50, 46], [92, 14], [72, 78], [30, 72]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]], reading: "Your patience pays off. A goal you set weeks ago moves forward; keep going at your own pace.", lucky: [8, "Brown"], at: [96, 12] },
  { name: "Aquarius", glyph: "♒", dates: "Jan 20 – Feb 18", stars: [[6, 34], [28, 56], [50, 34], [72, 56], [94, 34]], lines: chain(5), reading: "An unusual idea is worth sharing. Your friends are more on your wavelength than you expect.", lucky: [11, "Turquoise"], at: [62, 92] },
  { name: "Pisces", glyph: "♓", dates: "Feb 19 – Mar 20", stars: [[8, 12], [30, 50], [50, 88], [70, 56], [92, 28]], lines: chain(5), reading: "Let your imagination lead. A daydream today turns into a plan worth writing down.", lucky: [12, "Sea green"], at: [42, 94] },
];

const TODAY = "A calm start opens the way for a bold finish. Say yes to the small invitation that comes your way.";

/** Wraps text to lines no wider than `max`, drawn from `y` down. */
function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  let line = "";
  for (const word of text.split(" ")) {
    if (line && ctx.measureText(`${line} ${word}`).width > max) {
      ctx.fillText(line, x, y);
      y += lh;
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  ctx.fillText(line, x, y);
}

/** The phone's screen: the picked sign's reading for today, or the day's general one. */
function drawScreen(ctx: CanvasRenderingContext2D, sign: Sign | null) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#160a2c");
  bg.addColorStop(1, "#45104f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.fillText("9:41", 64, 90);
  ctx.textAlign = "center";
  ctx.font = "160px system-ui, sans-serif";
  ctx.fillText(sign?.glyph ?? "✦", W / 2, 400);
  ctx.font = "700 60px system-ui, sans-serif";
  ctx.fillText(sign?.name ?? "Your day", W / 2, 510);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 32px system-ui, sans-serif";
  ctx.fillText(sign?.dates ?? "Pick your sign", W / 2, 565);
  ctx.fillStyle = "#e9c46a";
  ctx.font = "700 30px system-ui, sans-serif";
  ctx.fillText("TODAY", W / 2, 680);
  ctx.fillStyle = "#fff";
  ctx.font = "400 38px system-ui, sans-serif";
  wrap(ctx, sign?.reading ?? TODAY, W / 2, 750, W - 140, 56);
}

/**
 * The daily horoscope hero, over the night sky (NightSky). The twelve zodiac
 * constellations sit round the phone as faint stars, drifting against the
 * cursor. Near one, its stars brighten, its lines draw star to star and its
 * name and dates fade in. Clicking it (or Enter) flares it, sends star dust
 * to the phone, and the phone turns front showing that sign's reading, with
 * its lucky number and colour beside it. Clicking it again lets go. The hero
 * stays dark: `data-dark` on the section turns the copy white.
 */
export function HeroHoroscope({ className }: { className?: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [action, setAction] = useState<PhoneAction>();
  const [live] = useState(() => (typeof document === "undefined" ? undefined : Object.assign(document.createElement("canvas"), { width: W, height: H })));
  const ref = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const sign = picked === null ? null : SIGNS[picked];

  useEffect(() => {
    if (live) drawScreen(live.getContext("2d")!, sign);
  }, [live, sign]);

  // Always a night sky: the copy turns white, and the constellations drift with the cursor.
  useEffect(() => {
    const hero = ref.current!.closest("section")!;
    hero.dataset.dark = "true";
    const drift = (e: PointerEvent) => {
      ref.current!.style.setProperty("--mx", String((e.clientX / innerWidth - 0.5) * 2));
      ref.current!.style.setProperty("--my", String((e.clientY / innerHeight - 0.5) * 2));
    };
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) hero.addEventListener("pointermove", drift);
    return () => {
      delete hero.dataset.dark;
      hero.removeEventListener("pointermove", drift);
    };
  }, []);

  const pick = (i: number, from: HTMLElement, at: number) => {
    if (picked === i) {
      setPicked(null);
      setAction(undefined);
      return;
    }
    setPicked(i);
    setAction({ at, does: "front", hold: true });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A burst of star dust from the constellation to the phone.
    const box = ref.current!.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = phone.current!.getBoundingClientRect();
    const x0 = a.left + a.width / 2 - box.left;
    const y0 = a.top + a.height / 2 - box.top;
    const dx = b.left + b.width / 2 - box.left - x0;
    const dy = b.top + b.height * 0.35 - box.top - y0;
    for (let k = 0; k < 14; k++) {
      const dot = document.createElement("span");
      dot.className = "pointer-events-none absolute size-1.5 rounded-full bg-[#ffe9a8] shadow-[0_0_8px_2px_rgba(255,233,168,0.8)]";
      dot.style.left = `${x0}px`;
      dot.style.top = `${y0}px`;
      ref.current!.append(dot);
      const spread = (k - 7) * 6;
      dot
        .animate(
          [
            { transform: "translate(0,0) scale(1)", opacity: 1 },
            { transform: `translate(${dx * 0.5 + spread}px, ${dy * 0.5 - 30 + spread}px) scale(1.3)`, opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(.4)`, opacity: 0 },
          ],
          { duration: 700 + k * 25, easing: "cubic-bezier(0.5,0,0.3,1)" },
        )
        .finished.then(() => dot.remove());
    }
  };

  const depth = (px: number): CSSProperties => ({ transform: `translate(calc(var(--mx, 0) * ${-px}px), calc(var(--my, 0) * ${-px}px))` });

  return (
    <div ref={ref} className="relative">
      <style>{`@keyframes tt-flare{0%{transform:scale(1);filter:brightness(1)}35%{transform:scale(1.3);filter:brightness(2.2)}to{transform:scale(1);filter:brightness(1.2)}}`}</style>

      {/* The constellations, round the phone. */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[min(62vh,560px)] w-[min(1200px,100vw)] -translate-x-1/2" style={depth(10)}>
        {SIGNS.map((s, i) => {
          const on = picked === i;
          return (
            <button
              key={s.name}
              type="button"
              aria-label={`${s.name}, ${s.dates}`}
              aria-pressed={on}
              onClick={(e) => pick(i, e.currentTarget, performance.now())}
              className="group pointer-events-auto absolute -translate-1/2 rounded-full p-3 focus-visible:outline-2 focus-visible:outline-white/70"
              style={{ left: `${s.at[0]}%`, top: `${s.at[1]}%` }}
            >
              <svg
                viewBox="-6 -6 112 112"
                className="block size-[clamp(48px,7vw,92px)] overflow-visible"
                style={on ? { animation: "tt-flare .9s ease-out" } : undefined}
                aria-hidden
              >
                {/* The figure, always faintly there, so the signs read as constellations at rest. */}
                {s.lines.map(([a, b]) => (
                  <line key={`faint-${a}-${b}`} x1={s.stars[a][0]} y1={s.stars[a][1]} x2={s.stars[b][0]} y2={s.stars[b][1]} className="stroke-[#cdb8ff]" strokeWidth="1" opacity="0.22" />
                ))}
                {s.lines.map(([a, b]) => (
                  <line
                    key={`${a}-${b}`}
                    x1={s.stars[a][0]}
                    y1={s.stars[a][1]}
                    x2={s.stars[b][0]}
                    y2={s.stars[b][1]}
                    pathLength={1}
                    strokeDasharray="1"
                    className={`stroke-[#cdb8ff] transition-[stroke-dashoffset,opacity] duration-700 ease-out group-hover:[stroke-dashoffset:0] group-focus-visible:[stroke-dashoffset:0] ${on ? "[stroke-dashoffset:0] opacity-90" : "[stroke-dashoffset:1] opacity-70"}`}
                    strokeWidth="1.4"
                  />
                ))}
                {s.stars.map(([x, y], k) => (
                  <circle key={k} cx={x} cy={y} r={k % 3 ? 3 : 4} className={`fill-white transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 ${on ? "opacity-100" : "opacity-65"}`} />
                ))}
              </svg>
              <span
                className={`absolute top-full left-1/2 w-max -translate-x-1/2 text-[12px] font-medium text-white/85 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 ${on ? "opacity-100" : "opacity-0"}`}
              >
                {s.glyph} {s.name} · {s.dates}
              </span>
            </button>
          );
        })}
      </div>

      {sign && (
        <p role="status" className="absolute top-1/2 left-1/2 z-20 flex w-max -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#1d1d1f] shadow-lg">
          <span className="size-2 rounded-full bg-[#e9c46a]" />
          {sign.name} · Your day ahead
        </p>
      )}

      <div ref={phone}>
        <PhoneModel live={live} liveKey={picked} action={action} className={className} />
      </div>

      {sign && (
        <p className="absolute top-[40%] left-[calc(50%+min(20vw,13vh))] z-10 flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-[13px] font-semibold text-[#1d1d1f] shadow-lg backdrop-blur-md">
          <Clover aria-hidden className="size-4 text-[#3a9d5d]" strokeWidth={2.2} />
          {sign.lucky[0]} · {sign.lucky[1]}
        </p>
      )}
    </div>
  );
}
