"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

/*
 * The alarm hero's background: the night before an alarm turning into the
 * morning it wakes you for, looping every PERIOD ms over a meadow photo.
 *
 *   night    the moonlit meadow; the clock counts 06:54 → 06:59, and the
 *            copy turns white
 *   07:00    the alarm goes off: `onAlarm` rings the phone, and the clock
 *            shakes, its digits flash and sound arcs go out from it
 *   sunrise  the golden-hour meadow fades in over the night one
 *   morning  day, minutes ticking on; then a quick dusk back to night
 *
 * The clock is the app's digital widget: a dark tile with cyan seven-segment
 * digits over their dim unlit "8"s, the weekday and AM above, today's date
 * and a rain icon below. Left of the phone on wide screens, bottom left on narrow ones.
 *
 * Drawn on a canvas into the hero itself, over its sky and under the phone
 * and copy, edge to edge (the hero has no foot fade, a rounded edge instead); the hero's
 * `data-dark` is set while it's dark, so the copy and strip turn white. Under
 * reduced motion it holds on the morning, still, and nothing rings.
 */

const PERIOD = 18000;
const RING_AT = 6000; // ms into the loop the clock reaches 07:00
const RING_FOR = 2400;
const STILL_AT = 13000; // the moment shown under reduced motion
const DAY_SRC = "/images/apps/alarm-clock/hero-day.jpg";
const NIGHT_SRC = "/images/apps/alarm-clock/hero-night.jpg";
const CYAN = "#22f0ff";
const GHOST = "rgba(34,240,255,0.07)";

const smooth = (e0: number, e1: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return k * k * (3 - 2 * k);
};

// Seven-segment digits: which of a–g each lights (a the top, on clockwise, g the middle).
const SEGS = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];

/** One digit, top-left at (x, y), `dw` × `dh`, segments `th` thick: lit ones cyan with a glow, the rest faint. " " is all unlit. */
function digit(ctx: CanvasRenderingContext2D, ch: string, x: number, y: number, dw: number, dh: number, th: number) {
  const lit = ch === " " ? "" : SEGS[+ch];
  const gap = th * 0.18;
  const hSeg = (sx: number, sy: number) => {
    const l = dw - gap * 2;
    ctx.moveTo(sx + gap, sy);
    ctx.lineTo(sx + gap + th / 2, sy - th / 2);
    ctx.lineTo(sx + gap + l - th / 2, sy - th / 2);
    ctx.lineTo(sx + gap + l, sy);
    ctx.lineTo(sx + gap + l - th / 2, sy + th / 2);
    ctx.lineTo(sx + gap + th / 2, sy + th / 2);
    ctx.closePath();
  };
  const vSeg = (sx: number, sy: number) => {
    const l = dh / 2 - gap * 2;
    ctx.moveTo(sx, sy + gap);
    ctx.lineTo(sx + th / 2, sy + gap + th / 2);
    ctx.lineTo(sx + th / 2, sy + gap + l - th / 2);
    ctx.lineTo(sx, sy + gap + l);
    ctx.lineTo(sx - th / 2, sy + gap + l - th / 2);
    ctx.lineTo(sx - th / 2, sy + gap + th / 2);
    ctx.closePath();
  };
  const seg: Record<string, () => void> = {
    a: () => hSeg(x, y),
    b: () => vSeg(x + dw, y),
    c: () => vSeg(x + dw, y + dh / 2),
    d: () => hSeg(x, y + dh),
    e: () => vSeg(x, y + dh / 2),
    f: () => vSeg(x, y),
    g: () => hSeg(x, y + dh / 2),
  };
  for (const on of [false, true]) {
    ctx.save();
    ctx.beginPath();
    for (const k of "abcdefg") if (lit.includes(k) === on) seg[k]();
    if (on) {
      ctx.shadowColor = CYAN;
      ctx.shadowBlur = th * 1.4;
    }
    ctx.fillStyle = on ? CYAN : GHOST;
    ctx.fill();
    ctx.restore();
  }
}

export function AlarmWall({ onAlarm }: { onAlarm: () => void }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const alarm = useRef(onAlarm);
  useEffect(() => {
    alarm.current = onAlarm;
  }, [onAlarm]);

  useEffect(() => {
    const hero = anchor.current!.closest("section")!;
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    // Under the phone and copy (z-20).
    cv.className = "pointer-events-none absolute inset-0 z-[16] size-full";
    hero.append(cv);
    const ctx = cv.getContext("2d")!;
    let w = 0;
    let h = 0;
    const t0 = performance.now();
    let lastLoop = -1;
    const day = Object.assign(new Image(), { src: DAY_SRC });
    const night = Object.assign(new Image(), { src: NIGHT_SRC });

    const draw = () => {
      const elapsed = performance.now() - t0;
      const t = reduce ? STILL_AT : elapsed % PERIOD;
      const loop = Math.floor(elapsed / PERIOD);
      // 07:00 each loop: ring the phone once.
      if (!reduce && t >= RING_AT && loop !== lastLoop) {
        lastLoop = loop;
        alarm.current();
      }
      // Light: night until the alarm, sunrise over the next 4s, day, then a quick dusk back.
      const L = smooth(RING_AT + 800, RING_AT + 4800, t) * (1 - smooth(PERIOD - 2200, PERIOD, t));
      // White copy until the day photo has mostly taken over.
      const dark = L < 0.6;
      if (dark) hero.dataset.dark = "true";
      else delete hero.dataset.dark;
      const ringing = !reduce && t >= RING_AT && t < RING_AT + RING_FOR;
      const secs = elapsed / 1000;

      // The meadow: night, with day fading in over it as the sun comes up,
      // cover-fitted and drifting very slowly so it's never quite still.
      ctx.fillStyle = "#0b1430";
      ctx.fillRect(0, 0, w, h);
      const zoom = 1.04 + 0.03 * Math.sin((elapsed / PERIOD) * Math.PI * 2);
      for (const [img, a] of [[night, 1], [day, L]] as const) {
        if (!img.complete || !img.naturalWidth || a <= 0) continue;
        const k = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
        const iw = img.naturalWidth * k;
        const ih = img.naturalHeight * k;
        ctx.globalAlpha = a;
        ctx.drawImage(img, (w - iw) / 2, (h - ih) * 0.6, iw, ih);
      }
      ctx.globalAlpha = 1;

      // The clock widget: left of the phone on wide screens; small, bottom left (above the strip) on narrow ones.
      const wide = w > 900;
      // 06:54 → 06:59 before the alarm, then a minute a second.
      const mins = t < RING_AT ? 6 * 60 + 54 + Math.floor((t / RING_AT) * 6) : 7 * 60 + Math.floor((t - RING_AT) / 1000);
      const hh = Math.floor(mins / 60);
      const cw = wide ? Math.min(w * 0.19, 300) : Math.min(w * 0.2, 84); // narrow: fits the gap left of the phone
      const ch = cw * 0.92;
      const x0 = (wide ? w * 0.16 - cw / 2 : 10) + (ringing ? Math.sin(secs * 60) * cw * 0.012 : 0);
      const y0 = wide ? h * 0.52 - ch / 2 : h - ch - 170;

      // The tile, glowing while it rings.
      ctx.save();
      ctx.shadowColor = ringing ? "rgba(34,240,255,0.6)" : "rgba(0,0,0,0.5)";
      ctx.shadowBlur = ringing ? 50 : 40;
      ctx.shadowOffsetY = ringing ? 0 : 16;
      const tile = ctx.createLinearGradient(0, y0, 0, y0 + ch);
      tile.addColorStop(0, "#0d1a22");
      tile.addColorStop(1, "#05090d");
      ctx.fillStyle = tile;
      ctx.beginPath();
      ctx.roundRect(x0, y0, cw, ch, cw * 0.13);
      ctx.fill();
      ctx.restore();
      // The band the time sits in.
      ctx.fillStyle = "rgba(34,240,255,0.05)";
      ctx.beginPath();
      ctx.roundRect(x0 + cw * 0.04, y0 + ch * 0.24, cw * 0.92, ch * 0.5, cw * 0.05);
      ctx.fill();

      // Labels: weekday and AM above; the date below, or WAKE UP! while it rings.
      const now = new Date();
      ctx.save();
      ctx.font = `600 ${cw * 0.075}px ui-monospace, "SF Mono", Consolas, monospace`;
      ctx.fillStyle = CYAN;
      ctx.shadowColor = CYAN;
      ctx.shadowBlur = 6;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText(now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(), x0 + cw * 0.09, y0 + ch * 0.13);
      const date = `${now.getDate()} ${now.toLocaleDateString("en-US", { month: "short" }).toUpperCase()} ${String(now.getFullYear()).slice(2)}`;
      ctx.fillText(ringing ? "WAKE UP!" : date, x0 + cw * 0.09, y0 + ch * 0.87);
      ctx.textAlign = "right";
      ctx.fillText("AM", x0 + cw * 0.91, y0 + ch * 0.13);
      ctx.restore();

      // A rain cloud, bottom right.
      const ix = x0 + cw * 0.84;
      const iy = y0 + ch * 0.85;
      const u = cw * 0.03;
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = Math.max(1.5, u * 0.45);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(ix - u * 0.9, iy - u * 0.2, u, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(ix + u * 0.1, iy - u * 0.9, u * 1.3, Math.PI * 1.1, Math.PI * 1.95);
      ctx.arc(ix + u * 1.1, iy - u * 0.1, u * 0.9, Math.PI * 1.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.stroke();
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(ix + k * u * 0.9, iy + u * 1.2);
        ctx.lineTo(ix + k * u * 0.9 - u * 0.3, iy + u * 2);
        ctx.stroke();
      }

      // The time, seven-segment and slightly slanted; the hour's tens stay unlit, as on the widget.
      const blink = ringing && Math.floor(secs * 4) % 2 === 1;
      const dh = ch * 0.34;
      const dw = dh * 0.48;
      const th = dh * 0.12;
      const step = dw * 1.32;
      const colon = dw * 0.55;
      const tx = x0 + (cw - (step * 3 + dw + colon)) / 2;
      const ty = y0 + ch * 0.31;
      ctx.save();
      ctx.translate(0, ty + dh);
      ctx.transform(1, 0, -0.08, 1, 0, 0);
      ctx.translate(0, -ty - dh);
      const text = `${hh < 10 ? " " : Math.floor(hh / 10)}${hh % 10}${String(mins % 60).padStart(2, "0")}`;
      const xs = [tx, tx + step, tx + step * 2 + colon, tx + step * 3 + colon];
      [...text].forEach((c, k) => digit(ctx, blink ? " " : c, xs[k], ty, dw, dh, th));
      ctx.fillStyle = blink ? GHOST : CYAN;
      const cx = tx + step + dw + (step - dw + colon) / 2 - th / 2;
      for (const yy of [ty + dh * 0.3, ty + dh * 0.7]) ctx.fillRect(cx, yy - th / 2, th, th);
      ctx.restore();

      if (ringing) {
        // Sound arcs either side of the tile.
        ctx.strokeStyle = CYAN;
        ctx.lineWidth = 3;
        for (let k = 0; k < 3; k++) {
          const p = (secs * 1.8 + k / 3) % 1;
          ctx.globalAlpha = 1 - p;
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(x0 + cw / 2, y0 + ch / 2, cw * (0.62 + p * 0.3), side < 0 ? Math.PI - 0.4 : -0.4, side < 0 ? Math.PI + 0.4 : 0.4);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }
    };
    // Draw again as each photo arrives (it matters under reduced motion, which draws once).
    day.onload = night.onload = () => draw();

    const resize = () => {
      const d = devicePixelRatio;
      w = hero.clientWidth;
      h = hero.clientHeight;
      cv.width = w * d;
      cv.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(hero);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);
    const loop = () => {
      if (visible && !document.hidden) draw();
      raf = requestAnimationFrame(loop);
    };
    if (!reduce) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      delete hero.dataset.dark;
      cv.remove();
    };
  }, [reduce]);

  return <span ref={anchor} hidden />;
}
