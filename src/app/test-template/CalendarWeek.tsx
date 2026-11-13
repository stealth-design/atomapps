"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

/*
 * The calendar hero's background: the app's week view, drawn the way a
 * calendar app draws it — this week's real dates (three days round today on
 * phones) across the top with today
 * ringed and its column tinted, an hour gutter down the left, hour and
 * half-hour rules, events as tinted blocks with a coloured stripe, a title and
 * a time, and a red line at the time it is now. Every few seconds another
 * event is dragged by a cursor from one slot and dropped into its own: it lifts
 * with a shadow, leaves a dashed outline behind, and settles with a soft glow; once the
 * week is full it starts over. A white wash over the top keeps the headline
 * readable. Drawn on a canvas into the hero itself, over its sky and under
 * its fade and copy. Under reduced motion it's the full week, still.
 */

type Ev = { day: number; start: number; len: number; title: string; color: string };

const BLUE = "#3b6cf6";
const GREEN = "#2fa36b";
const ORANGE = "#f08a24";
const PURPLE = "#8b5cf6";
const PINK = "#e8508a";

// Monday = 0. Times in hours.
const BOOKED: Ev[] = [
  { day: 0, start: 9, len: 0.5, title: "Team standup", color: BLUE },
  { day: 0, start: 13, len: 1, title: "Lunch with Priya", color: ORANGE },
  { day: 1, start: 9, len: 0.5, title: "Team standup", color: BLUE },
  { day: 1, start: 10.5, len: 1.5, title: "Design review", color: PURPLE },
  { day: 1, start: 18, len: 1, title: "Gym", color: GREEN },
  { day: 2, start: 9, len: 0.5, title: "Team standup", color: BLUE },
  { day: 2, start: 14, len: 2, title: "Focus time", color: PURPLE },
  { day: 3, start: 9, len: 0.5, title: "Team standup", color: BLUE },
  { day: 3, start: 11, len: 1, title: "Dentist", color: PINK },
  { day: 3, start: 16, len: 1, title: "1:1 with Alex", color: BLUE },
  { day: 4, start: 9, len: 0.5, title: "Team standup", color: BLUE },
  { day: 4, start: 12, len: 1, title: "Team lunch", color: ORANGE },
  { day: 4, start: 19, len: 2, title: "Movie night", color: PINK },
  { day: 5, start: 10, len: 1.5, title: "Farmers market", color: GREEN },
  { day: 6, start: 11, len: 2, title: "Brunch with family", color: ORANGE },
];
// Dragged one by one, every BOOK_EVERY ms, from the slot in `from` ([day, start]) to their own.
const PENDING: (Ev & { from: [number, number] })[] = [
  { day: 2, start: 11, len: 1, title: "Client call", color: BLUE, from: [4, 10] },
  { day: 0, start: 16, len: 1.5, title: "Sprint planning", color: PURPLE, from: [2, 17] },
  { day: 5, start: 15, len: 2, title: "Football", color: GREEN, from: [6, 14] },
  { day: 3, start: 13, len: 1, title: "Lunch with Sam", color: ORANGE, from: [1, 13] },
  { day: 1, start: 15, len: 1, title: "Haircut", color: PINK, from: [3, 18] },
  { day: 6, start: 17, len: 1.5, title: "Call Mom", color: PINK, from: [5, 18.5] },
  { day: 4, start: 15, len: 1, title: "Team retro", color: PURPLE, from: [0, 11] },
];
// Each beat: the cursor reaches the event, lifts it, drags it, drops it and it settles.
const BOOK_EVERY = 2600;
const REACH = 600;
const LIFT = 200;
const DRAG = 1100;
const SETTLE = 300;
const DROP = REACH + LIFT + DRAG;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => ((v = clamp(v)) < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
type R = { x: number; y: number; w: number; h: number };
const FROM = 7; // first hour shown
const TO = 21;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hourLabel = (h: number) => `${((h + 11) % 12) + 1} ${h < 12 ? "AM" : "PM"}`;
const time = (h: number) => `${((Math.floor(h) + 11) % 12) + 1}:${h % 1 ? "30" : "00"}`;

export function CalendarWeek() {
  const anchor = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const hero = anchor.current!.closest("section")!;
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.className = "under-copy pointer-events-none absolute inset-0 z-[5] size-full";
    hero.append(cv);
    const ctx = cv.getContext("2d")!;
    let w = 0;
    let h = 0;

    // This week's Monday, and today's place in it.
    const now = new Date();
    const dow = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dow);
    const nowH = Math.min(TO - 0.25, Math.max(FROM + 0.25, now.getHours() + now.getMinutes() / 60));

    const t0 = performance.now();
    const draw = () => {
      const t = performance.now() - t0;
      // Which pending event is being dragged now (`cur`), and how far into its beat (`u`).
      const cycle = (PENDING.length + 2) * BOOK_EVERY; // two beats full before it starts over
      const into = reduce ? cycle - 1 : t % cycle;
      const cur = Math.floor(into / BOOK_EVERY);
      const u = into - cur * BOOK_EVERY;
      // Placed ones fade out before the week resets, and back in where they started.
      const back = reduce ? 1 : clamp((cycle - into) / 600);
      const fresh = reduce ? 1 : clamp(into / 400);

      ctx.clearRect(0, 0, w, h);
      const gutter = Math.max(44, Math.min(64, w * 0.045));
      const head = 58;
      // Phones get three days round today, as calendar apps do; wider screens the week.
      const n = w < 700 ? 3 : 7;
      const first = n === 7 ? 0 : Math.min(7 - n, Math.max(0, dow - 1));
      const colW = (w - gutter) / n;
      const hourH = Math.max(36, (h - head) / (TO - FROM));
      const yOf = (hr: number) => head + (hr - FROM) * hourH;
      const xOf = (d: number) => gutter + (d - first) * colW;
      const font = (wt: number, px: number) => (ctx.font = `${wt} ${px}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`);

      // Paper, and today's column.
      ctx.fillStyle = "#fbfbfd";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f1f4ff";
      ctx.fillRect(xOf(dow), 0, colW, h);

      // Rules: hours solid, half hours dotted; day dividers.
      ctx.lineWidth = 1;
      for (let hr = FROM; hr <= TO; hr++) {
        ctx.strokeStyle = "#e4e6ee";
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(gutter - 6, Math.round(yOf(hr)) + 0.5);
        ctx.lineTo(w, Math.round(yOf(hr)) + 0.5);
        ctx.stroke();
        ctx.strokeStyle = "#eef0f5";
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(gutter, Math.round(yOf(hr + 0.5)) + 0.5);
        ctx.lineTo(w, Math.round(yOf(hr + 0.5)) + 0.5);
        ctx.stroke();
        font(500, 11);
        ctx.fillStyle = "#9a9ca8";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        if (hr < TO) ctx.fillText(hourLabel(hr), gutter - 10, yOf(hr));
      }
      ctx.setLineDash([]);
      ctx.strokeStyle = "#e4e6ee";
      for (let d = first; d <= first + n; d++) {
        ctx.beginPath();
        ctx.moveTo(Math.round(xOf(d)) + 0.5, 0);
        ctx.lineTo(Math.round(xOf(d)) + 0.5, h);
        ctx.stroke();
      }

      // Day headers: name over date, today's date in a filled circle.
      ctx.textAlign = "center";
      for (let d = first; d < first + n; d++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + d);
        const cx = xOf(d) + colW / 2;
        font(600, 11);
        ctx.fillStyle = d === dow ? BLUE : "#8b8d98";
        ctx.fillText(DAYS[d].toUpperCase(), cx, 18);
        if (d === dow) {
          ctx.fillStyle = BLUE;
          ctx.beginPath();
          ctx.arc(cx, 40, 14, 0, Math.PI * 2);
          ctx.fill();
        }
        font(d === dow ? 700 : 500, 17);
        ctx.fillStyle = d === dow ? "#fff" : "#2b2d36";
        ctx.fillText(String(date.getDate()), cx, 41);
      }

      // Events.
      const slot = (day: number, start: number, len: number): R => ({ x: xOf(day) + 3, y: yOf(start) + 1.5, w: colW - 6, h: len * hourH - 3 });
      const shown = (day: number) => day >= first && day < first + n;
      const grip = (r: R) => [r.x + r.w * 0.62, r.y + Math.min(r.h * 0.5, 16)] as const;
      const chip = (e: Ev, r: R, { alpha = 1, lift = 0, glow = 0, tilt = 0 } = {}) => {
        if (alpha <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        ctx.scale(1 + 0.05 * lift, 1 + 0.05 * lift);
        ctx.translate(-cx, -cy);
        ctx.save();
        if (lift > 0) {
          ctx.shadowColor = "rgba(25,30,60,0.3)";
          ctx.shadowBlur = 26 * lift;
          ctx.shadowOffsetY = 12 * lift;
        } else if (glow > 0) {
          ctx.shadowColor = e.color;
          ctx.shadowBlur = 20 * glow;
        }
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, 6);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.restore();
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, 6);
        ctx.clip();
        ctx.fillStyle = e.color;
        ctx.globalAlpha = alpha * (0.14 + 0.08 * lift);
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.globalAlpha = alpha;
        ctx.fillRect(r.x, r.y, 3.5, r.h);
        if (r.h > 18 && r.w > 70) {
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          font(600, 12);
          ctx.fillStyle = "#1f2130";
          ctx.fillText(e.title, r.x + 9, r.y + 5);
          if (r.h > 34) {
            font(500, 11);
            ctx.fillStyle = "#6b6e7c";
            ctx.fillText(`${time(e.start)} – ${time(e.start + e.len)}`, r.x + 9, r.y + 21);
          }
        }
        ctx.restore();
      };
      // A dashed outline: where a dragged event came from, and where it will land.
      const ghost = (e: Ev, r: R, alpha: number) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = e.color;
        ctx.fillStyle = `${e.color}14`;
        ctx.beginPath();
        ctx.roundRect(r.x + 0.75, r.y + 0.75, r.w - 1.5, r.h - 1.5, 6);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };

      for (const e of BOOKED) if (shown(e.day)) chip(e, slot(e.day, e.start, e.len));
      let dragged: (() => void) | undefined; // drawn last, over the rest
      let hand: readonly [number, number] | undefined;
      let press = 0;
      PENDING.forEach((e, i) => {
        const src = slot(e.from[0], e.from[1], e.len);
        const dst = slot(e.day, e.start, e.len);
        if (i < cur) return shown(e.day) && chip(e, dst, { alpha: back });
        if (i > cur) return shown(e.from[0]) && chip(e, src, { alpha: fresh });
        const k = ease((u - REACH - LIFT) / DRAG);
        const arc = Math.sin(Math.PI * k);
        const lift = clamp((u - REACH) / LIFT) * (1 - clamp((u - DROP) / SETTLE));
        const r = { ...dst, x: lerp(src.x, dst.x, k), y: lerp(src.y, dst.y, k) - arc * 24 };
        if (k > 0 && k < 1) {
          ghost(e, src, 0.5);
          ghost(e, dst, k);
        }
        dragged = () => chip(e, r, { alpha: fresh, lift, glow: k >= 1 ? 1 - clamp((u - DROP) / (SETTLE * 2)) : 0, tilt: -0.05 * arc });
        // The cursor comes over from the last drop, holds the event, then lets go and drifts off it.
        const prev = i ? grip(slot(PENDING[i - 1].day, PENDING[i - 1].start, PENDING[i - 1].len)) : [w * 0.94, h * 1.05];
        const [hx, hy] = grip(r);
        const go = ease(u / REACH);
        const off = ease((u - DROP - SETTLE) / 500);
        hand = u < REACH ? [lerp(prev[0] + (i ? 26 : 0), hx, go), lerp(prev[1] + (i ? 30 : 0), hy, go)] : [hx + off * 26, hy + off * 30];
        press = clamp((u - REACH + 100) / 120) * (1 - clamp((u - DROP - 60) / 120));
      });
      // The week is full: the cursor leaves.
      if (cur >= PENDING.length && !reduce) {
        const last = PENDING[PENDING.length - 1];
        const [lx, ly] = grip(slot(last.day, last.start, last.len));
        const k = ease((into - PENDING.length * BOOK_EVERY) / 900);
        hand = [lerp(lx + 26, w * 0.94, k), lerp(ly + 30, h * 1.05, k)];
      }

      // Now: a red line across the week, a dot at today's column.
      const ny = yOf(nowH);
      ctx.strokeStyle = "#e5484d";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(gutter, ny);
      ctx.lineTo(w, ny);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xOf(dow), ny);
      ctx.lineTo(xOf(dow) + colW, ny);
      ctx.stroke();
      ctx.fillStyle = "#e5484d";
      ctx.beginPath();
      ctx.arc(xOf(dow), ny, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // The event in hand, and the cursor holding it: an arrow, pressed while it drags.
      dragged?.();
      if (hand) {
        ctx.save();
        ctx.translate(hand[0], hand[1]);
        if (press > 0) {
          ctx.fillStyle = `rgba(59,108,246,${0.2 * press})`;
          ctx.beginPath();
          ctx.arc(0, 0, 9 + 5 * press, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.scale(1 - 0.08 * press, 1 - 0.08 * press);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 17);
        ctx.lineTo(4.5, 13);
        ctx.lineTo(7.5, 20);
        ctx.lineTo(10.5, 18.8);
        ctx.lineTo(7.6, 12);
        ctx.lineTo(13, 12);
        ctx.closePath();
        ctx.lineJoin = "round";
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#fff";
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 1;
        ctx.stroke();
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#1f2130";
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // A wash over the top and centre, so the headline and cards read.
      const g = ctx.createRadialGradient(w / 2, h * 0.18, 0, w / 2, h * 0.18, Math.max(w, h) * 0.55);
      g.addColorStop(0, "rgba(255,255,255,0.88)");
      g.addColorStop(0.55, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0.12)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };

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
      cv.remove();
    };
  }, [reduce]);

  return <span ref={anchor} hidden />;
}
