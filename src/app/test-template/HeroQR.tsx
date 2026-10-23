"use client";

import { useId, useRef, useState, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import { Link2, ShoppingCart } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "./useReducedMotion";
import { Hint } from "./Hint";

/*
 * The QR scanner hero: a flat illustration of a scan, looping Point → Lock on
 * → Decode → Open on a GSAP timeline, a QR code one loop and a barcode the
 * next. The step labels under it are buttons: one jumps to its stage and
 * pauses there, the same one again resumes. Hovering tilts the scene a few
 * degrees. Under reduced motion the four stages sit side by side, still.
 */

// The app's real Play Store link (play.google.com/store/apps/details?id=com.qr.code.reader.scanner.qrscan.android)
// as a version 6-M QR code, one string per row, 1 = dark. Made once with segno; regenerate if the link changes.
const QR = [
  "11111110001101011011100110001111101111111", "10000010000100000010101010011100001000001", "10111010101101101001000110100110101011101",
  "10111010101010110010111000010000001011101", "10111010110110011101110110101011101011101", "10000010100011001100011011111010101000001",
  "11111110101010101010101010101010101111111", "00000000101010011001111000110011100000000", "10111110000101110101000011100101101111100",
  "00000101111100010001000101001011101110111", "00010111000110001010111010110000101000000", "00101101100001111000111000001011101101000",
  "10110010011111001101001101100101000101110", "10010101111011100000100010111010011110011", "01010110011011010011001000000000010110100",
  "10100101111000111001110010101000001011001", "01001111101001100101001001100100010100110", "00101000011111100111111101001001101111101",
  "10010110011000010100110001111010110011100", "11010000110000111111011001000000010011001", "10111110001000010000010010110010000000101",
  "01100101111101111011001101001101001111111", "01000110001000010110101001111000110000100", "01000101111001000000110010110011011011001",
  "00101110000010011101001111110100000000100", "10111100010110001001110100000011011011011", "11110111001100001110100001011000111110000",
  "01110000110110011011111100110001100111011", "11000111110100101111101011001101000001101", "11101101000010100110010001110000011111011",
  "10110011110001111100110111111110011101000", "10111000011000111010011100010010111100011", "10110010000001001110101111111110111110101",
  "00000000111001111011101100001110100011011", "11111110011100101010001010010101101010000", "10000010110010001001000100101111100011010",
  "10111010101000001010011110000000111110100", "10111010101000110001110101101011010101000", "10111010100000001100100001110011011110000",
  "10000010000101010111111100111001110011010", "11111110100101100111001111111101010111100",
];
const N = QR.length; // 41: the codes are drawn in an N-unit box
const QR_PATH = QR.flatMap((row, y) => [...row].flatMap((c, x) => (c === "1" ? [`M${x} ${y}h1v1h-1z`] : []))).join("");
// A product barcode in the same N-unit box: bar widths, alternating bar and
// gap, scaled so the whole run spans the box less a unit's margin each side.
const BARS = "1121312111321121131211213111213211121311";
const BAR_PATH = (() => {
  const k = (N - 2) / [...BARS].reduce((sum, w) => sum + +w, 0);
  let x = 1;
  return [...BARS].flatMap((w, i) => {
    const d = i % 2 ? [] : [`M${x} 6h${+w * k}v26h-${+w * k}z`];
    x += +w * k;
    return d;
  }).join("");
})();

const STAGES = ["Point", "Lock on", "Decode", "Open"];
const STARTS = [0, 1, 2.4, 3.9];
const PAUSE_AT = [0.95, 2.35, 3.85, 5.3]; // each stage's finished state
const stageAt = (t: number) => STARTS.findLastIndex((s) => t >= s);

// The card's code: N units drawn 200px square at (65, 95).
const CODE = { x: 65, y: 95, size: 200 };
const M = CODE.size / N;
// The phone's viewfinder, where the camera shows the code.
const VIEW = { x: 425, y: 105, size: 120 };
// Where the decoded squares lift off the card.
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  x: CODE.x + 20 + ((i * 53) % 160),
  y: CODE.y + 20 + ((i * 97) % 160),
  bit: (i * 7) % 3 ? "1" : "0",
}));

const corners = (x: number, y: number, s: number, l: number) =>
  `M${x} ${y + l}V${y}H${x + l}M${x + s - l} ${y}H${x + s}V${y + l}M${x + s} ${y + s - l}V${y + s}H${x + s - l}M${x + l} ${y + s}H${x}V${y + s - l}`;

type Mode = "qr" | "bar";

function Scene({ mode, freeze, onDone, onStage, tlRef }: { mode: Mode; freeze?: number; onDone?: () => void; onStage?: (i: number) => void; tlRef?: { current: gsap.core.Timeline | null } }) {
  const scope = useRef<SVGSVGElement>(null);
  const id = useId().replace(/[^\w-]/g, "");
  const qr = mode === "qr";

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const t = gsap.timeline({ paused: freeze !== undefined, onComplete: onDone });
      const shown = { stage: -1 };
      t.eventCallback("onUpdate", () => {
        const s = stageAt(t.time());
        if (s !== shown.stage) onStage?.((shown.stage = s));
      });

      // Point: the phone slides in toward the card, the camera picks it up.
      t.fromTo(q(".phone"), { x: 90, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0)
        .fromTo(q(".camera"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.5);

      // Lock on: the scan line sweeps the viewfinder; brackets pop onto the
      // finder squares (or a laser crosses the bars), then close round the code.
      t.fromTo(q(".scan"), { y: 0, opacity: 0 }, { y: VIEW.size, opacity: 1, duration: 1.2, ease: "sine.inOut" }, 1)
        .to(q(".scan"), { opacity: 0, duration: 0.2 }, 2.2);
      if (qr) {
        q(".finder").forEach((f, i) =>
          t.fromTo(f, { scale: 1.8, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(3)" }, 1.1 + i * 0.25),
        );
        t.to(q(".finder"), { opacity: 0, duration: 0.2 }, 2);
      } else {
        t.fromTo(q(".laser"), { scaleX: 0, opacity: 1, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, 1.1);
      }
      t.fromTo(q(".lock"), { scale: 1.25, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.35, ease: "power3.out" }, 2);

      // Decode: the code lights up row by row, its squares stream into the
      // phone turning to 1s and 0s, and the phone buzzes once.
      t.fromTo(q(".light"), { attr: { height: 0 } }, { attr: { height: CODE.size }, duration: 0.8, ease: "steps(20)" }, 2.4);
      q(".bit").forEach((p, i) => {
        const at = 2.6 + i * 0.04;
        const { x, y } = PARTICLES[i];
        t.fromTo(p, { x: 0, y: 0, opacity: 0 }, { x: VIEW.x + VIEW.size / 2 - x, y: VIEW.y + VIEW.size / 2 - y, opacity: 1, duration: 0.9, ease: "power2.in" }, at)
          .to(p.querySelector("rect"), { opacity: 0, duration: 0.3 }, at + 0.35)
          .fromTo(p.querySelector("text"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, at + 0.35)
          .to(p, { opacity: 0, duration: 0.15 }, at + 0.85);
      });
      t.fromTo(q(".buzz"), { opacity: 0 }, { opacity: 1, duration: 0.08, yoyo: true, repeat: 3 }, 3.5);

      // Open: the result rises out of the screen and joins the history behind it.
      t.to(q(".light, .lock, .laser"), { opacity: 0, duration: 0.3 }, 3.9)
        .fromTo(q(".result"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.6)" }, 3.9)
        .fromTo(q(".history"), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 }, 4.3);

      // Then everything clears for the next loop.
      t.to(q(".phone, .result, .history, .camera"), { opacity: 0, duration: 0.5 }, 5.5);

      if (freeze !== undefined) t.seek(PAUSE_AT[freeze]);
      if (tlRef) tlRef.current = t;
    },
    { scope, dependencies: [mode], revertOnUpdate: true },
  );

  const code = qr ? QR_PATH : BAR_PATH;
  const at = (x: number, y: number, size: number) => `translate(${x} ${y}) scale(${size / N})`;

  return (
    <svg ref={scope} viewBox="0 0 640 380" className="block h-auto w-full overflow-visible" role="img" aria-label={qr ? "A phone scanning a QR code" : "A phone scanning a barcode"}>
      <defs>
        <path id={`code-${id}`} d={code} />
        <clipPath id={`clip-${id}`}>
          <use href={`#code-${id}`} transform={at(CODE.x, CODE.y, CODE.size)} />
        </clipPath>
      </defs>

      {/* The card: a menu with a QR code, or a carton with a barcode. */}
      <rect x="34" y="44" width="270" height="300" rx="22" fill="#000" opacity="0.06" />
      <rect x="30" y="40" width="270" height="300" rx="22" fill="#fff" stroke="rgba(0,0,0,0.06)" />
      <text x="165" y="76" textAnchor="middle" className="fill-[#1d1d1f] text-[15px] font-semibold">
        {qr ? "Scan for the menu" : "Oat milk · 1L"}
      </text>
      <use href={`#code-${id}`} transform={at(CODE.x, CODE.y, CODE.size)} className="fill-[#1d1d1f]" />
      {!qr && (
        <text x="165" y="300" textAnchor="middle" className="fill-[#1d1d1f] text-[13px] tracking-[0.2em] tabular-nums">
          5 012345 678900
        </text>
      )}
      <rect className="light fill-[var(--accent)]" x={CODE.x} y={CODE.y} width={CODE.size} height="0" clipPath={`url(#clip-${id})`} />

      {qr &&
        [
          [0, 0],
          [N - 7, 0],
          [0, N - 7],
        ].map(([cx, cy]) => (
          <path key={`${cx}-${cy}`} className="finder stroke-[var(--accent)]" d={corners(CODE.x + cx * M - 4, CODE.y + cy * M - 4, 7 * M + 8, 9)} fill="none" strokeWidth="3.5" strokeLinecap="round" opacity="0" />
        ))}
      {!qr && <rect className="laser" x={CODE.x - 10} y={CODE.y + 18 * M} width={CODE.size + 20} height="3" rx="1.5" fill="#ff3b30" opacity="0" />}
      <path className="lock stroke-[var(--accent)]" d={corners(CODE.x - 8, CODE.y - 8, CODE.size + 16, 22)} fill="none" strokeWidth="4" strokeLinecap="round" opacity="0" />

      {/* The decoded squares, on their way to the phone. */}
      {PARTICLES.map(({ x, y, bit }, i) => (
        <g key={i} className="bit" opacity="0">
          <rect x={x - 4} y={y - 4} width="8" height="8" rx="1.5" className="fill-[var(--accent)]" />
          <text x={x} y={y + 5} textAnchor="middle" opacity="0" className="fill-[var(--accent)] font-mono text-[14px] font-bold">
            {bit}
          </text>
        </g>
      ))}

      {/* The phone, with the camera's view of the card in its viewfinder. */}
      <g className="phone" opacity="0">
        <rect x="380" y="15" width="210" height="350" rx="34" fill="#0e1214" stroke="#1d1d1f" strokeWidth="9" />
        <circle cx="485" cy="34" r="4" fill="#2a2f33" />
        <g className="camera" opacity="0">
          <rect x={VIEW.x - 6} y={VIEW.y - 6} width={VIEW.size + 12} height={VIEW.size + 12} rx="10" fill="#fff" />
          <use href={`#code-${id}`} transform={at(VIEW.x, VIEW.y, VIEW.size)} className="fill-[#1d1d1f]" />
        </g>
        <path d={corners(VIEW.x - 14, VIEW.y - 14, VIEW.size + 28, 18)} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <rect className="scan fill-[var(--accent)]" x={VIEW.x - 10} y={VIEW.y} width={VIEW.size + 20} height="3" rx="1.5" opacity="0" />
        <text x="485" y="80" textAnchor="middle" className="fill-white/60 text-[12px]">
          {qr ? "Point at a QR code" : "Point at a barcode"}
        </text>

        <rect className="history" x="404" y="236" width="162" height="14" rx="7" fill="#fff" opacity="0" fillOpacity="0.14" />
        <rect className="history" x="412" y="218" width="146" height="12" rx="6" fill="#fff" opacity="0" fillOpacity="0.08" />
        <g className="result" opacity="0">
          <rect x="396" y="256" width="178" height="92" rx="16" fill="#fff" />
          {qr ? <Link2 x="408" y="266" width="18" height="18" className="text-[var(--accent)]" /> : <ShoppingCart x="408" y="266" width="18" height="18" className="text-[var(--accent)]" />}
          <text x="432" y="280" className="fill-[#1d1d1f] text-[13px] font-semibold">
            {qr ? "atom.app/menu" : "Oat milk · 1L"}
          </text>
          <rect x="408" y="308" width="154" height="28" rx="14" className="fill-[var(--accent)]" />
          <text x="485" y="327" textAnchor="middle" className="fill-white text-[13px] font-semibold">
            Open
          </text>
        </g>
      </g>
      <path className="buzz stroke-[#1d1d1f]" d="M368 150q-6 10 0 20M360 145q-9 15 0 30M602 150q6 10 0 20M610 145q9 15 0 30" fill="none" strokeWidth="2.5" strokeLinecap="round" opacity="0" />
    </svg>
  );
}

export function HeroQR() {
  const still = useReducedMotion();
  const [mode, setMode] = useState<Mode>("qr");
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState<number | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const tilt = useRef<HTMLDivElement>(null);

  const pick = (i: number) => {
    if (paused === i) {
      tl.current?.play();
      setPaused(null);
    } else {
      tl.current?.pause(PAUSE_AT[i]);
      setPaused(i);
      setStage(i);
    }
  };
  const lean = (e: PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.current!.style.transform = `perspective(1200px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
  };

  if (still) {
    return (
      <ol className="mx-auto mt-8 mb-[150px] grid w-[min(1000px,calc(100vw-32px))] grid-cols-2 gap-4 tablet:grid-cols-4">
        {STAGES.map((label, i) => (
          <li key={label} className="text-center">
            <Scene mode="qr" freeze={i} />
            <p className="mt-2 text-[14px] font-semibold">{label}</p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="mx-auto mt-8 mb-[150px] w-[min(600px,calc(100vw-32px))] short:mt-4 roomy:w-[720px]">
      <div onPointerMove={lean} onPointerLeave={() => (tilt.current!.style.transform = "")}>
        <div ref={tilt} className="transition-transform duration-300 ease-out">
          <Scene mode={mode} onDone={() => setMode((m) => (m === "qr" ? "bar" : "qr"))} onStage={setStage} tlRef={tl} />
        </div>
      </div>
      <div className="relative mt-5 flex justify-center gap-2" role="group" aria-label="Scan stages">
        {STAGES.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={paused === i}
            onClick={() => pick(i)}
            className={`rounded-full px-4 py-2 text-[14px] font-semibold ring-1 backdrop-blur-md transition-colors duration-300 ${
              stage === i ? "bg-[var(--accent)] text-white ring-[var(--accent)]" : "bg-white/75 text-[#1d1d1f] ring-black/5 can-hover:hover:bg-white"
            }`}
          >
            {label}
            {paused === i && <span className="ml-1.5 text-[11px] opacity-80">▶ resume</span>}
          </button>
        ))}
        <Hint />
      </div>
    </div>
  );
}
