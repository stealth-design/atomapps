"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { PhoneModel } from "./PhoneModel";
import { PULSE_EVENT, type Pulse } from "./ShaderBackground";
import { Hint } from "./Hint";
import { useReducedMotion } from "./useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const W = 630; // the screen canvas, 9:20 like the phone's display
const H = 1400;
const BEAT = 1100; // ms between the background's rings
const TICKS = 41; // dial marks round the 270° sweep
const SWEEP = 6000; // ms for one turn up and back on phones

/** A mark's colour by its place on the sweep (0–1): green, then yellow, orange, red. */
const tickColor = (t: number) => (t < 0.5 ? "#34d058" : t < 0.7 ? "#e8d44d" : t < 0.85 ? "#f59e0b" : "#ef4444");

// The phone's sound settings: each slider's level when the knob is at 60%;
// the knob scales them all (Media follows it exactly). Icons are 24-unit SVG paths.
const SLIDERS = [
  { label: "Ringtone", at: 0.8, icon: "M4 9v6h4l5 4V5L8 9H4ZM16.5 9a4 4 0 0 1 0 6" },
  { label: "Alarm", at: 0.45, icon: "M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 9v4l2 2M5 3 2 6M22 6l-3-3" },
  { label: "Media", at: 0.6, icon: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" },
  { label: "Notifications", at: 0.8, icon: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" },
  { label: "System", at: 0.72, icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" },
];

/** The phone's sound settings at `level` (0–1): five sliders, drawn onto its screen canvas. */
function drawScreen(ctx: CanvasRenderingContext2D, level: number) {
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0e1530");
  bg.addColorStop(1, "#2a1452");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const icon = (d: string, x: number, y: number, size: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 24, size / 24);
    ctx.lineWidth = 2;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke(new Path2D(d));
    ctx.restore();
  };

  ctx.fillStyle = ctx.strokeStyle = "#fff";
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("9:41", 64, 90); // left of the punch-hole camera
  // Top bar: menu, and the speaker.
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (const y of [168, 180, 192]) ctx.fillRect(64, y, 34, 4);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  icon(SLIDERS[0].icon, 530, 162, 38);

  // The card.
  ctx.fillStyle = "#2b2e36";
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(40, 240, W - 80, 1080, 44);
  ctx.fill();
  ctx.stroke();

  const x0 = 96;
  const x1 = W - 96;
  SLIDERS.forEach(({ label, at, icon: d }, i) => {
    const y = 300 + i * 205;
    const v = Math.min(1, (level * at) / 0.6);
    ctx.strokeStyle = ctx.fillStyle = "#e9ebf2";
    icon(d, 76, y - 4, 34);
    ctx.font = "500 32px system-ui, sans-serif";
    ctx.fillText(label, 128, y + 24);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "500 26px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${Math.round(v * 100)}%`, x1, y + 24);
    ctx.textAlign = "left";

    // Track, the filled part, and a metal thumb at the level.
    const ty = y + 105;
    const tx = x0 + (x1 - x0) * v;
    ctx.lineCap = "round";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.beginPath();
    ctx.moveTo(x0, ty);
    ctx.lineTo(x1, ty);
    ctx.stroke();
    if (v > 0) {
      const fill = ctx.createLinearGradient(x0, 0, x1, 0);
      fill.addColorStop(0, "#5b6cff");
      fill.addColorStop(1, "#9aa6ff");
      ctx.strokeStyle = fill;
      ctx.beginPath();
      ctx.moveTo(x0, ty);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }
    knob(ctx, tx, ty, 32, v);
  });
}

/** The widget's knob in small: a dark bezel round a brushed-metal cap, its pointer turned to `v` (-135° at 0, +135° at 1). */
function knob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, v: number) {
  const rot = ((v * 270 - 135) * Math.PI) / 180;
  const bezel = ctx.createLinearGradient(0, y - r, 0, y + r);
  bezel.addColorStop(0, "#0d0e11");
  bezel.addColorStop(1, "#3a3c44");
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = bezel;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const metal = ctx.createConicGradient(rot - Math.PI / 2, x, y);
  ["#8a8d96", "#f2f3f6", "#6c6f78", "#d9dbe0", "#7a7d86", "#f2f3f6", "#6c6f78", "#d9dbe0", "#8a8d96"].forEach((col, i) => metal.addColorStop(i === 1 ? 0.12 : i / 8, col));
  ctx.fillStyle = metal;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.86, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.shadowColor = "rgba(255,255,255,0.9)";
  ctx.shadowBlur = 4;
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.14;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.76);
  ctx.lineTo(0, -r * 0.4);
  ctx.stroke();
  ctx.restore();
}

/**
 * The volume hero: the phone held facing front, its screen the sound settings (five sliders that follow the knob)
 * and a knob beside it that sets the level. Clicking anywhere in the
 * hero, or turning the knob, sends a ring through the background from behind
 * the phone, as strong as the volume — silent when muted. Pair with
 * `<ShaderBackground clicks={false} />`, which plays the rings.
 */
export function HeroVolume({ className }: { className?: string; accent?: string }) {
  const [level, setLevel] = useState(0.6);
  const [live] = useState(() => (typeof document === "undefined" ? undefined : Object.assign(document.createElement("canvas"), { width: W, height: H })));
  const phone = useRef<HTMLDivElement>(null);
  const levelRef = useRef(level);
  const lastPulse = useRef(0);
  const dragging = useRef(false);
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 768px)");
  const touched = useRef(false); // the knob stops sweeping on its own once someone turns it

  const pulse = (strength = levelRef.current) => {
    const r = phone.current!.getBoundingClientRect();
    lastPulse.current = performance.now();
    dispatchEvent(new CustomEvent<Pulse>(PULSE_EVENT, { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, strength: strength * 1.5 } }));
  };

  // Turning the knob redraws the screen and pulses, at most every 250ms.
  const set = (v: number) => {
    touched.current = true;
    const next = Math.min(1, Math.max(0, v));
    levelRef.current = next;
    setLevel(next);
    if (performance.now() - lastPulse.current > 250) pulse(next);
  };

  // Runs after the phone's own effect has seen the new `liveKey`, and before
  // its next frame uploads the canvas.
  useEffect(() => {
    if (!live) return;
    drawScreen(live.getContext("2d")!, level);
  }, [live, level]);

  // The background beats on its own: a ring from the phone every BEAT ms, as strong as the volume.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => levelRef.current > 0 && pulse(), BEAT);
    return () => clearInterval(id);
  }, [reduce]);

  // On phones the knob turns itself, up and back, until someone takes it.
  useEffect(() => {
    if (desktop || reduce) return;
    let id = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (touched.current) return;
      const v = 0.5 - 0.45 * Math.cos((((now - t0) % SWEEP) / SWEEP) * Math.PI * 2);
      levelRef.current = v;
      setLevel(v);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [desktop, reduce]);

  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowUp: 0.05, ArrowRight: 0.05, ArrowDown: -0.05, ArrowLeft: -0.05, PageUp: 0.2, PageDown: -0.2 }[e.key];
    if (step) set(level + step);
    else if (e.key === "Home") set(0);
    else if (e.key === "End") set(1);
    else return;
    e.preventDefault();
  };
  // The knob follows the pointer round its centre: straight up is 50%, the
  // sweep runs 135° either side of it. A jump of more than half the sweep is
  // the pointer crossing the dead zone at the bottom, so it's ignored rather
  // than snapping from 0 to 100.
  const turn = (e: PointerEvent, press = false) => {
    if (!press && !dragging.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const deg = (Math.atan2(e.clientX - r.left - r.width / 2, r.top + r.height / 2 - e.clientY) * 180) / Math.PI;
    const next = (Math.min(135, Math.max(-135, deg)) + 135) / 270;
    if (press || Math.abs(next - levelRef.current) < 0.5) set(next);
  };
  const onDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    turn(e, true);
  };

  const pct = Math.round(level * 100);

  return (
    <div className="relative">
      {/* On phones, nudged left to make room for the widget at the bottom right. */}
      <div ref={phone} className="-translate-x-[14%] tablet:translate-x-0">
        <PhoneModel live={live} liveKey={`${level}`} className={className} />
      </div>

      {/* Bottom right, over the phone's faded foot, on phones; beside the phone from tablet up. */}
      <div className="absolute right-4 bottom-[18%] z-10 flex flex-col items-center gap-2 tablet:top-[30%] tablet:right-auto tablet:bottom-auto tablet:left-[calc(50%+min(26vw,16vh))] compact:left-[calc(50%+min(30vw,22vh))]">
        <div className="flex flex-col items-center gap-1 rounded-3xl bg-[linear-gradient(#2a2b31,#1a1b20)] p-3 shadow-[0_16px_32px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] ">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={`${pct}%`}
          onKeyDown={onKey}
          onPointerDown={onDown}
          onPointerMove={(e) => turn(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          className="relative size-[104px] cursor-grab touch-none active:cursor-grabbing rounded-full outline-offset-4 select-none tablet:size-[100px] desktop-sm:size-[120px]"
        >
          {/* The dial: marks lit up to the level, dim past it. */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
            {Array.from({ length: TICKS }, (_, i) => {
              const t = i / (TICKS - 1);
              const major = i % 5 === 0;
              return (
                <line
                  key={i}
                  x1="50"
                  y1={major ? 2 : 4}
                  x2="50"
                  y2="11"
                  transform={`rotate(${t * 270 - 135} 50 50)`}
                  stroke={level > 0 && t <= level ? tickColor(t) : "rgba(255,255,255,0.14)"}
                  strokeWidth={major ? 2.4 : 1.6}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          {/* The knob: a dark bezel round a brushed-metal cap, turned to the level: -135° muted, +135° full. */}
          <div className="absolute inset-[15%] rounded-full bg-[linear-gradient(#0d0e11,#3a3c44)] p-[5%] shadow-[0_10px_20px_-6px_rgba(0,0,0,0.8)]">
            <div
              className="relative size-full rounded-full bg-[conic-gradient(#8a8d96,#f2f3f6_12%,#6c6f78_25%,#d9dbe0_38%,#7a7d86_50%,#f2f3f6_62%,#6c6f78_75%,#d9dbe0_88%,#8a8d96)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.35)]"
              style={{ transform: `rotate(${level * 270 - 135}deg)` }}
            >
              <span className="absolute top-[6%] left-1/2 h-[26%] w-[5%] -translate-x-1/2 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)]" />
            </div>
          </div>
        </div>
        <p className="text-[22px] leading-none font-bold tabular-nums tablet:text-[24px]" style={{ color: level > 0 ? tickColor(level) : "rgba(255,255,255,0.4)" }}>
          {pct}%
        </p>
        <p className="text-[11px] text-white/50">{pct === 0 ? "Muted" : pct > 85 ? "Boosted Volume" : "Volume"}</p>
        </div>
        <Hint />
      </div>
    </div>
  );
}
