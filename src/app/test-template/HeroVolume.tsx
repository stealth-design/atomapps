"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { PhoneModel } from "./PhoneModel";
import { PULSE_EVENT, type Pulse } from "./ShaderBackground";
import { Hint } from "./Hint";

const W = 630; // the screen canvas, 9:20 like the phone's display
const H = 1400;
const R = 44; // knob arc radius on a 100-unit grid
const C = 2 * Math.PI * R;

/** The phone's volume panel at `level` (0–1), drawn onto its screen canvas. */
function drawScreen(ctx: CanvasRenderingContext2D, level: number, accent: string) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0b1020");
  bg.addColorStop(1, "#1b2552");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const pct = Math.round(level * 100);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("9:41", 64, 90); // left of the punch-hole camera
  ctx.textAlign = "center";
  ctx.font = "700 60px system-ui, sans-serif";
  ctx.fillText("Volume", W / 2, 250);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "500 34px system-ui, sans-serif";
  ctx.fillText(pct === 0 ? "Muted" : pct > 85 ? "Boosted" : "Media", W / 2, 305);
  ctx.fillStyle = "#fff";
  ctx.font = "700 150px system-ui, sans-serif";
  ctx.fillText(`${pct}%`, W / 2, 500);

  // The slider: a tall pill filling from the bottom.
  const x = W / 2 - 100;
  const top = 580;
  const h = 660;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, top, 200, h, 64);
  ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x, top, 200, h);
  ctx.fillStyle = accent;
  ctx.fillRect(x, top + h * (1 - level), 200, h * level);
  ctx.restore();
  ctx.font = "64px system-ui, sans-serif";
  ctx.fillText(pct === 0 ? "🔇" : pct < 50 ? "🔉" : "🔊", W / 2, top + h - 50);
}

/**
 * The volume hero: the phone held facing front, its screen a live volume
 * panel, and a knob beside it that sets the level. Clicking anywhere in the
 * hero, or turning the knob, sends a ring through the background from behind
 * the phone, as strong as the volume — silent when muted. Pair with
 * `<ShaderBackground clicks={false} />`, which plays the rings.
 */
export function HeroVolume({ className, accent }: { className?: string; accent: string }) {
  const [level, setLevel] = useState(0.6);
  const [live] = useState(() => (typeof document === "undefined" ? undefined : Object.assign(document.createElement("canvas"), { width: W, height: H })));
  const phone = useRef<HTMLDivElement>(null);
  const levelRef = useRef(level);
  const lastPulse = useRef(0);
  const dragging = useRef(false);

  const pulse = (strength = levelRef.current) => {
    const r = phone.current!.getBoundingClientRect();
    lastPulse.current = performance.now();
    dispatchEvent(new CustomEvent<Pulse>(PULSE_EVENT, { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, strength: strength * 1.5 } }));
  };

  // Turning the knob redraws the screen and pulses, at most every 250ms.
  const set = (v: number) => {
    const next = Math.min(1, Math.max(0, v));
    levelRef.current = next;
    setLevel(next);
    if (performance.now() - lastPulse.current > 250) pulse(next);
  };

  // Runs after the phone's own effect has seen the new `liveKey`, and before
  // its next frame uploads the canvas.
  useEffect(() => {
    if (!live) return;
    drawScreen(live.getContext("2d")!, level, accent);
  }, [live, level, accent]);

  // Any press in the hero pulses — the knob's own presses included.
  useEffect(() => {
    const hero = phone.current!.closest("section")!;
    const onDown = () => pulse();
    hero.addEventListener("pointerdown", onDown);
    return () => hero.removeEventListener("pointerdown", onDown);
  }, []);

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
      <div ref={phone}>
        <PhoneModel live={live} liveKey={`${level}${accent}`} className={className} />
      </div>

      {/* Inside the screen's right edge on phones; beside the phone from tablet up. */}
      <div className="absolute top-[30%] right-2 z-10 flex flex-col items-center gap-2 tablet:right-auto tablet:left-[calc(50%+min(26vw,16vh))]">
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
          className="relative size-[72px] cursor-grab touch-none active:cursor-grabbing rounded-full outline-offset-4 select-none tablet:size-[100px] desktop-sm:size-[120px]"
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
            <g transform="rotate(135 50 50)" fill="none" strokeWidth="6" strokeLinecap="round">
              <circle cx="50" cy="50" r={R} stroke="rgba(0,0,0,0.1)" strokeDasharray={`${C * 0.75} ${C}`} />
              <circle cx="50" cy="50" r={R} stroke="var(--accent)" strokeDasharray={`${C * 0.75 * level} ${C}`} opacity={level ? 1 : 0} />
            </g>
          </svg>
          {/* The knob's body, turned to the level: -135° muted, +135° full. */}
          <div
            className="absolute inset-[16%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#e4e6ee_60%,#c9ccd8)] shadow-[0_12px_24px_-10px_rgba(0,0,0,0.45),inset_0_-2px_4px_rgba(0,0,0,0.12)]"
            style={{ transform: `rotate(${level * 270 - 135}deg)` }}
          >
            <span className="absolute top-[10%] left-1/2 h-[18%] w-[6%] -translate-x-1/2 rounded-full bg-[var(--accent)]" />
          </div>
        </div>
        <p className="rounded-full bg-white/75 px-3 py-1 text-[13px] font-semibold tabular-nums shadow-sm backdrop-blur-md">{pct}%</p>
        <Hint />
      </div>
    </div>
  );
}
