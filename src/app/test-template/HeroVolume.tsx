"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { PhoneModel } from "./PhoneModel";
import { PULSE_EVENT, type Pulse } from "./ShaderBackground";
import { Hint } from "./Hint";
import { useReducedMotion } from "./useReducedMotion";

const W = 630; // the screen canvas, 9:20 like the phone's display
const H = 1400;
const BEAT = 1100; // ms between the background's rings
const TICKS = 72; // dial marks round the 270° sweep
const DIAL = 360; // the widget dial's canvas, 3× its largest CSS size for sharpness
const SWEEP = 6000; // ms for one turn up and back
const BOOST_MS = 3000; // ms on the Boost page before it switches to Controls
const PAGE_MS = 5000; // ms on the Controls page before it switches back
const FLIP_MS = 600; // ms for the switch

/** A mark's colour by its place on the sweep (0–1): green, then yellow, orange, red. */
const tickColor = (t: number) => (t < 0.5 ? "#34d058" : t < 0.7 ? "#e8d44d" : t < 0.85 ? "#f59e0b" : "#ef4444");

// 24-unit SVG icon paths.
const ICONS = {
  music: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  alarm: "M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 9v4l2 2M5 3 2 6M22 6l-3-3",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
  wrench: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  speaker: "M11 5 6 9H2v6h4l5 4V5ZM15.54 8.46a5 5 0 0 1 0 7.07",
};

// The Controls page: each slider's level when the knob is at 100% (straight up); the knob scales them all,
// except Media, which is the phone's own volume, as on the Boost page.
const CONTROLS = [
  { label: "Ringtone", icon: ICONS.phone, at: 0.72 },
  { label: "Alarm", icon: ICONS.alarm, at: 0.6 },
  { label: "Media", icon: ICONS.music, at: 1 },
  { label: "Notifications", icon: ICONS.bell, at: 0.42 },
  { label: "System", icon: ICONS.wrench, at: 0.72 },
];

/**
 * The booster app at `level` (0–1) on its screen canvas. `page` runs 0 (Boost: dial, readout, media slider)
 * to 1 (Controls: five sliders); between, Controls slides in from the right over Boost and the tab highlight slides across.
 */
function drawScreen(ctx: CanvasRenderingContext2D, level: number, page = 0) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#17181c");
  bg.addColorStop(1, "#0b0b0d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left") => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(s, x, y);
  };
  const rect = (x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient, stroke?: string | CanvasGradient) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };
  const icon = (d: string, x: number, y: number, size: number, color = "rgba(255,255,255,0.85)") => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 24, size / 24);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke(new Path2D(d));
    ctx.restore();
  };
  // A slider from x0 to x1 at height y, filled to v (0–1): a recessed black track, a glowing blue bar inside it, a metal thumb.
  const slider = (x0: number, x1: number, y: number, v: number) => {
    const tx = x0 + (x1 - x0) * v;
    const track = ctx.createLinearGradient(0, y - 12, 0, y + 12);
    track.addColorStop(0, "#000");
    track.addColorStop(1, "#15161a");
    const lip = ctx.createLinearGradient(0, y - 12, 0, y + 12);
    lip.addColorStop(0, "rgba(0,0,0,0.6)");
    lip.addColorStop(1, "rgba(255,255,255,0.14)");
    rect(x0 - 16, y - 12, x1 - x0 + 32, 24, 12, track, lip);
    if (v > 0) {
      const fill = ctx.createLinearGradient(x0, 0, x1, 0);
      fill.addColorStop(0, "#1f5fff");
      fill.addColorStop(1, "#3d8bff");
      ctx.save();
      ctx.lineCap = "round";
      ctx.shadowColor = "#2f7bff";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = fill;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(tx, y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(170,205,255,0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, y - 1);
      ctx.lineTo(tx, y - 1);
      ctx.stroke();
      ctx.restore();
    }
    thumb(ctx, tx, y, 24);
  };
  const ease = page * page * (3 - 2 * page);
  const media = Math.min(1, level * 2); // the phone's own volume fills by 100%; past that is boost

  text("9:41", 64, 90, "600 34px system-ui, sans-serif", "#fff"); // left of the punch-hole camera
  rect(40, 140, 84, 84, 22, "#24262c", "rgba(255,255,255,0.08)");
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  [168, 180, 192].forEach((y, i) => ctx.fillRect(62, y, i === 1 ? 30 : 40, 4));

  // Boost page.
  if (ease < 1) {
    ctx.save();
    ctx.translate(-ease * W, 0); // slides out to the left as Controls comes in
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(170, 182, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(162, 182);
    ctx.lineTo(168, 188);
    ctx.lineTo(178, 176);
    ctx.stroke();
    text("VERIFIED BY", 198, 192, "700 26px system-ui, sans-serif", "#fff");
    text("HEAD", 372, 192, "800 34px system-ui, sans-serif", "#fff");
    text("acoustics", 462, 192, "500 22px system-ui, sans-serif", "rgba(255,255,255,0.8)");

    const cx = W / 2;
    drawDial(ctx, cx, 560, 250, level);
    text("NO BOOST", 120, 800, "700 24px system-ui, sans-serif", "rgba(255,255,255,0.85)", "center");
    text("MAX BOOST", 510, 800, "700 24px system-ui, sans-serif", "rgba(255,255,255,0.85)", "center");

    // Volume readout: 0 at the bottom of the sweep, 100 straight up, 200 at max boost.
    rect(155, 860, 320, 180, 48, "#050506", "rgba(255,255,255,0.12)");
    drawSegments(ctx, `${Math.round(level * 200)}`, cx, 888, 86);
    text("Boosted Volume", cx, 1015, "500 26px system-ui, sans-serif", "rgba(255,255,255,0.55)", "center");

    icon(ICONS.music, 44, 1080, 34);
    text("Media", 92, 1108, "500 30px system-ui, sans-serif", "rgba(255,255,255,0.85)");
    drawSegments(ctx, "0", 62, 1155, 30);
    drawSegments(ctx, "100", 553, 1155, 30);
    slider(100, 500, 1170, media);
    ctx.restore();
  }

  // Controls page.
  if (ease > 0) {
    ctx.save();
    ctx.translate((1 - ease) * W, 0); // slides in from the right
    rect(506, 140, 84, 84, 22, "#24262c", "rgba(255,255,255,0.08)");
    icon(ICONS.speaker, 528, 162, 40, "#fff");
    // The card, fading out towards its foot.
    const card = ctx.createLinearGradient(0, 250, 0, 1210);
    card.addColorStop(0, "#202227");
    card.addColorStop(1, "rgba(17,18,21,0.4)");
    const edge = ctx.createLinearGradient(0, 250, 0, 1210);
    edge.addColorStop(0, "rgba(255,255,255,0.14)");
    edge.addColorStop(0.6, "rgba(255,255,255,0.05)");
    edge.addColorStop(1, "rgba(255,255,255,0)");
    rect(40, 250, W - 80, 960, 40, card, edge);
    CONTROLS.forEach(({ label, icon: d, at }, i) => {
      const y = 310 + i * 180;
      icon(d, 76, y, 32);
      text(label, 126, y + 26, "500 28px system-ui, sans-serif", "#fff");
      slider(110, 520, y + 85, label === "Media" ? media : Math.min(1, at * level * 2));
    });
    ctx.restore();
  }

  // Tabs, the highlight sliding from BOOST to CONTROLS.
  rect(30, 1250, W - 60, 96, 48, "#1c1d22", "rgba(255,255,255,0.06)");
  ctx.save();
  ctx.shadowColor = "#3b82f6";
  ctx.shadowBlur = 18;
  rect(38 + ease * 284, 1258, 270, 80, 40, "#0f1a3a", "#3b82f6");
  ctx.restore();
  text("BOOST", 173, 1308, "600 26px system-ui, sans-serif", `rgba(255,255,255,${1 - ease * 0.15})`, "center");
  text("CONTROLS", 457, 1308, "600 26px system-ui, sans-serif", `rgba(255,255,255,${0.85 + ease * 0.15})`, "center");
}

/**
 * The boost dial, `R` = outer radius of its marks: dashes and a glowing band lit green→red up to `level`,
 * a riveted bezel, a chrome ring, a dark face reading BOOST, and a blue pointer at the level.
 * Drawn on the phone screen and as the knob beside it, so both match.
 */
function drawDial(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, level: number) {
  const ang = (t: number) => ((t * 270 - 225) * Math.PI) / 180; // 0 = lower left, 1 = lower right; matches the drag sweep
  const at = (a: number, r: number) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  const circle = (r: number, fill: string | CanvasGradient) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  const ring = (r: number, width: number, style: string | CanvasGradient) => {
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  };
  const light = (r: number, top: string, bottom: string) => {
    const g = ctx.createLinearGradient(cx - r * 0.5, cy - r, cx + r * 0.5, cy + r);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    return g;
  };

  // Green → yellow → red round the sweep: one conic gradient colours the marks, the band and its haze.
  const hues = ctx.createConicGradient(ang(0), cx, cy);
  const span = 270 / 360;
  for (let t = 0; t <= 1.0001; t += 0.05) hues.addColorStop(t * span, `hsl(${Math.max(0, 120 - t * 220)} 95% 55%)`);
  hues.addColorStop(1, "hsl(0 95% 55%)");

  ctx.save();
  ctx.lineCap = "round";
  // Coloured haze the band throws onto the background.
  if (level > 0) {
    ctx.strokeStyle = hues;
    ctx.globalAlpha = 0.28;
    ctx.filter = `blur(${R * 0.12}px)`;
    ctx.lineWidth = R * 0.3;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.8, ang(0), ang(level));
    ctx.stroke();
    ctx.filter = "none";
    ctx.globalAlpha = 1;
  }

  // Outer ring of short dashes: dim all round, coloured up to the level.
  const dashes = (to: number, style: string | CanvasGradient) => {
    ctx.strokeStyle = style;
    ctx.lineWidth = R * 0.014;
    ctx.beginPath();
    for (let i = 0; i < TICKS; i++) {
      const t = i / (TICKS - 1);
      if (t > to) break;
      ctx.moveTo(...at(ang(t), R * 0.93));
      ctx.lineTo(...at(ang(t), R));
    }
    ctx.stroke();
  };
  dashes(1, "rgba(255,255,255,0.1)");
  if (level > 0) dashes(level, hues);

  // The band: a soft glow, then the solid stroke.
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = R * 0.045;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.82, ang(0), ang(1));
  ctx.stroke();
  if (level > 0) {
    ctx.strokeStyle = hues;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.82, ang(0), ang(level));
    ctx.filter = `blur(${R * 0.03}px)`;
    ctx.lineWidth = R * 0.08;
    ctx.stroke();
    ctx.filter = "none";
    ctx.lineWidth = R * 0.04;
    ctx.stroke();
  }
  ctx.restore();

  // Bezel: dark metal casting a shadow, a ring of rivets round it.
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.95)";
  ctx.shadowBlur = R * 0.12;
  ctx.shadowOffsetY = R * 0.04;
  circle(R * 0.7, light(R * 0.7, "#4a4b52", "#0b0b0e"));
  ctx.restore();
  const bezel = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R * 0.7);
  bezel.addColorStop(0, "#111215");
  bezel.addColorStop(0.5, "#2a2b30");
  bezel.addColorStop(1, "#141518");
  circle(R * 0.69, bezel);
  ring(R * 0.69, R * 0.008, light(R * 0.7, "rgba(255,255,255,0.35)", "rgba(255,255,255,0.05)"));
  for (let i = 0; i < 24; i++) {
    const [x, y] = at((i / 24) * Math.PI * 2 + ang(level), R * 0.63); // the rivets turn with the knob
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.beginPath();
    ctx.arc(x, y, R * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(150,152,160,0.55)";
    ctx.beginPath();
    ctx.arc(x, y + R * 0.004, R * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chrome ring: brushed streaks, bright top-left and bottom-right, darker between; the streaks turn with the level.
  ring(R * 0.575, R * 0.012, "#000");
  const brush = ctx.createConicGradient(-Math.PI / 2 + level * 0.6, cx, cy);
  for (let k = 0; k <= 90; k++) {
    const th = (k / 90) * Math.PI * 2;
    const noise = (Math.abs(Math.sin(k * 12.9898) * 43758.5453) % 1) - 0.5;
    const v = 0.55 + 0.42 * Math.cos(2 * (th + Math.PI / 3)) + noise * 0.12;
    const c = Math.round(Math.min(1, Math.max(0.08, v)) * 255);
    brush.addColorStop(k / 90, `rgb(${c},${c},${Math.min(255, c + 6)})`);
  }
  circle(R * 0.57, brush);
  circle(R * 0.57, light(R * 0.57, "rgba(255,255,255,0.25)", "rgba(0,0,0,0.25)"));
  ring(R * 0.565, R * 0.01, light(R * 0.57, "rgba(255,255,255,0.95)", "rgba(255,255,255,0.4)"));
  // Inner edge: a dark line, a thin bright bevel, a dark line.
  ring(R * 0.455, R * 0.012, "#050506");
  ring(R * 0.44, R * 0.014, light(R * 0.44, "#e9ebef", "#6a6d74"));
  ring(R * 0.428, R * 0.01, "#000");

  // Face: dark glass, a touch lighter in the middle, shaded under the rim.
  const face = ctx.createRadialGradient(cx, cy - R * 0.05, R * 0.02, cx, cy, R * 0.425);
  face.addColorStop(0, "#26282e");
  face.addColorStop(0.75, "#141519");
  face.addColorStop(1, "#08080a");
  circle(R * 0.425, face);

  // BOOST, glowing blue.
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const blue = ctx.createLinearGradient(0, cy - R * 0.1, 0, cy + R * 0.1);
  blue.addColorStop(0, "#9cc0ff");
  blue.addColorStop(1, "#3d6ff0");
  ctx.shadowColor = "rgba(61,111,240,0.6)";
  ctx.shadowBlur = R * 0.06;
  ctx.font = `800 ${R * 0.19}px system-ui, sans-serif`;
  ctx.fillStyle = blue;
  ctx.fillText("BOOST", cx, cy + R * 0.01);
  ctx.restore();

  // Blue pointer on the bezel at the level: tapered, glowing, with a pale core.
  const m = ang(level);
  const n = m + Math.PI / 2;
  const [bx, by] = at(m, R * 0.66);
  const [tx, ty] = at(m, R * 0.8);
  const half = (w: number) => [Math.cos(n) * w, Math.sin(n) * w];
  const [wx, wy] = half(R * 0.03);
  const [vx, vy] = half(R * 0.012);
  ctx.save();
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = R * 0.09;
  const pointer = ctx.createLinearGradient(bx, by, tx, ty);
  pointer.addColorStop(0, "#1d5bff");
  pointer.addColorStop(1, "#7fd3ff");
  ctx.fillStyle = pointer;
  ctx.beginPath();
  ctx.moveTo(bx - wx, by - wy);
  ctx.lineTo(tx - vx, ty - vy);
  ctx.lineTo(tx + vx, ty + vy);
  ctx.lineTo(bx + wx, by + wy);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#e6f7ff";
  ctx.lineCap = "round";
  ctx.lineWidth = R * 0.01;
  ctx.beginPath();
  ctx.moveTo(...at(m, R * 0.69));
  ctx.lineTo(...at(m, R * 0.78));
  ctx.stroke();
  ctx.restore();
}

// Seven-segment digits: which of a b c d e f g (top, top right, bottom right, bottom, bottom left, top left, middle) light up.
const SEGS = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];

/** `s` as glowing white LCD digits, centred on `cx`, top at `y`, `h` tall; unlit segments show faintly behind. */
function drawSegments(ctx: CanvasRenderingContext2D, s: string, cx: number, y: number, h: number) {
  const w = h * 0.55;
  const t = h * 0.13; // segment thickness
  const gap = h * 0.22;
  const g = t * 0.18; // the hairline between neighbouring segments
  const total = s.length * (w + t) + (s.length - 1) * gap;
  // A segment from (x1,y1) to (x2,y2), straight across or down, pointed at both ends.
  const seg = (p: Path2D, x1: number, y1: number, x2: number, y2: number) => {
    const across = y1 === y2;
    const [a, b] = across ? [x1 + g, x2 - g] : [y1 + g, y2 - g];
    const pts = across
      ? [[a, y1], [a + t / 2, y1 - t / 2], [b - t / 2, y1 - t / 2], [b, y1], [b - t / 2, y1 + t / 2], [a + t / 2, y1 + t / 2]]
      : [[x1, a], [x1 + t / 2, a + t / 2], [x1 + t / 2, b - t / 2], [x1, b], [x1 - t / 2, b - t / 2], [x1 - t / 2, a + t / 2]];
    p.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([px, py]) => p.lineTo(px, py));
    p.closePath();
  };
  const lit = new Path2D();
  const dim = new Path2D();
  [...s].forEach((ch, i) => {
    const x = cx - total / 2 + t / 2 + i * (w + t + gap);
    const on = SEGS[+ch] ?? "";
    const m = y + h / 2;
    const all: Record<string, [number, number, number, number]> = {
      a: [x, y, x + w, y], b: [x + w, y, x + w, m], c: [x + w, m, x + w, y + h], d: [x, y + h, x + w, y + h],
      e: [x, m, x, y + h], f: [x, y, x, m], g: [x, m, x + w, m],
    };
    for (const [k, [x1, y1, x2, y2]] of Object.entries(all)) seg(on.includes(k) ? lit : dim, x1, y1, x2, y2);
  });
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fill(dim);
  ctx.shadowColor = "rgba(255,255,255,0.85)";
  ctx.shadowBlur = h * 0.18;
  ctx.fillStyle = "#f4f7ff";
  ctx.fill(lit);
  ctx.shadowBlur = h * 0.06;
  ctx.fill(lit);
  ctx.restore();
}

/** A slider's thumb: a brushed-metal disc lit from above, casting a shadow. */
function thumb(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const circle = (rad: number) => {
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
  };
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = r * 0.6;
  ctx.shadowOffsetY = r * 0.2;
  ctx.fillStyle = "#3a3c42";
  circle(r);
  ctx.fill();
  ctx.restore();
  const brush = ctx.createConicGradient(0, x, y);
  for (let k = 0; k <= 48; k++) {
    const th = (k / 48) * Math.PI * 2;
    const noise = (Math.abs(Math.sin(k * 78.233) * 43758.5453) % 1) - 0.5;
    const c = Math.round(Math.min(1, Math.max(0.2, 0.62 + 0.32 * Math.cos(2 * (th + Math.PI / 4)) + noise * 0.1)) * 255);
    brush.addColorStop(k / 48, `rgb(${c},${c},${Math.min(255, c + 6)})`);
  }
  ctx.fillStyle = brush;
  circle(r * 0.96);
  ctx.fill();
  const shade = ctx.createLinearGradient(0, y - r, 0, y + r);
  shade.addColorStop(0, "rgba(255,255,255,0.3)");
  shade.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = shade;
  ctx.fill();
  ctx.lineWidth = r * 0.07;
  const rim = ctx.createLinearGradient(0, y - r, 0, y + r);
  rim.addColorStop(0, "rgba(255,255,255,0.9)");
  rim.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.strokeStyle = rim;
  circle(r * 0.93);
  ctx.stroke();
}

/**
 * The volume hero: the phone held facing front, its screen the booster app (dial, readout and media slider follow the knob)
 * and a knob beside it that sets the level. Clicking anywhere in the
 * hero, or turning the knob, sends a ring through the background from behind
 * the phone, as strong as the volume — silent when muted. Pair with
 * `<ShaderBackground clicks={false} />`, which plays the rings.
 */
export function HeroVolume({ className }: { className?: string; accent?: string }) {
  const [level, setLevel] = useState(0.6);
  const [page, setPage] = useState(0); // 0 Boost, 1 Controls, between while switching
  const [live] = useState(() => (typeof document === "undefined" ? undefined : Object.assign(document.createElement("canvas"), { width: W, height: H })));
  const phone = useRef<HTMLDivElement>(null);
  const dial = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(level);
  const lastPulse = useRef(0);
  const dragging = useRef(false);
  const reduce = useReducedMotion();
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
    drawScreen(live.getContext("2d")!, level, page);
  }, [live, level, page]);

  // The app loops: Boost for BOOST_MS, then Controls for PAGE_MS, then back.
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let id = 0;
    const flip = (from: number) => {
      id = window.setTimeout(() => {
        const to = 1 - from;
        const t0 = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / FLIP_MS);
          setPage(from + (to - from) * t);
          if (t < 1) raf = requestAnimationFrame(step);
          else flip(to);
        };
        raf = requestAnimationFrame(step);
      }, from === 0 ? BOOST_MS : PAGE_MS);
    };
    flip(0);
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  useEffect(() => {
    const ctx = dial.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, DIAL, DIAL);
    drawDial(ctx, DIAL / 2, DIAL / 2, DIAL * 0.47, level);
  }, [level]);

  // The background beats on its own: a ring from the phone every BEAT ms, as strong as the volume.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => levelRef.current > 0 && pulse(), BEAT);
    return () => clearInterval(id);
  }, [reduce]);

  // The knob turns itself between 50% and 200%, up and back, until someone takes it.
  useEffect(() => {
    if (reduce) return;
    let id = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (touched.current) return;
      const v = 0.625 - 0.375 * Math.cos((((now - t0) % SWEEP) / SWEEP) * Math.PI * 2);
      levelRef.current = v;
      setLevel(v);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [reduce]);

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

  const pct = Math.round(level * 200); // 0–200%, 100% straight up

  return (
    <div className="relative">
      {/* On phones, nudged left to make room for the widget at the bottom right. */}
      <div ref={phone} className="-translate-x-[14%] tablet:translate-x-0">
        <PhoneModel live={live} liveKey={`${level}-${page}`} className={className} />
      </div>

      {/* Bottom right, over the phone's faded foot, on phones; beside the phone from tablet up. */}
      <div className="absolute right-4 bottom-[18%] z-10 flex flex-col items-center gap-2 tablet:top-[30%] tablet:right-auto tablet:bottom-auto tablet:left-[calc(50%+min(26vw,16vh))] compact:left-[calc(50%+min(30vw,22vh))]">
        <div className="flex flex-col items-center gap-1 rounded-3xl bg-[linear-gradient(#2a2b31,#1a1b20)] p-3 shadow-[0_16px_32px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] ">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={200}
          aria-valuenow={pct}
          aria-valuetext={`${pct}%`}
          onKeyDown={onKey}
          onPointerDown={onDown}
          onPointerMove={(e) => turn(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          className="relative size-[104px] cursor-grab touch-none active:cursor-grabbing rounded-full outline-offset-4 select-none tablet:size-[100px] desktop-sm:size-[120px]"
        >
          {/* The same boost dial as on the screen. */}
          <canvas ref={dial} width={DIAL} height={DIAL} className="absolute inset-0 size-full" aria-hidden />
        </div>
        <p className="text-[22px] leading-none font-bold tabular-nums tablet:text-[24px]" style={{ color: level > 0 ? tickColor(level) : "rgba(255,255,255,0.4)" }}>
          {pct}%
        </p>
        <p className="text-[11px] text-white/50">{pct === 0 ? "Muted" : pct > 100 ? "Boosted Volume" : "Volume"}</p>
        </div>
        <Hint />
      </div>
    </div>
  );
}
