"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneModel, type PhoneAction } from "./PhoneModel";
import { useReducedMotion } from "./useReducedMotion";

const W = 630; // the screen canvas, 9:20 like the phone's display
const H = 1400;
const ZOOM = 3; // the magnifier's power, against the page as it shows round the phone
const ZOOM_PHONE = 4; // the chip's label on phone-width screens
const SPAN_PHONE = 75; // page px across the lens there; scaling off the small phone model filled it with a few huge letters
const LENS = { x: 50, y: 600, w: 530, h: 600, r: 48 }; // where the magnified view sits on the screen
const SPREAD = 1800; // ms the light takes to spread once the torch comes on

// The print on the page: the app's own selling points (its features and
// highlights, cut short), set evenly over the whole hero.
const PRINT = [
  "Brightest flashlight, on in one tap",
  "Magnifier with light: read the small print",
  "Built-in compass: never lose your way",
  "SOS alerts, seen from a distance",
  "Screen light: your display as a soft glow",
  "One swipe right from your home screen",
  "Home screen widget: time, weather & more",
  "Themed wallpapers for home & lock screen",
  "Search apps and the web from anywhere",
];
const CELL = { w: 320, h: 54 }; // each line's share of the page
const CELL_PHONE = { w: 320, h: 24 }; // phone-width screens: smaller, tighter lines

/**
 * The flashlight hero, playing on its own. The hero is a dark room with a
 * page of small print across it, unreadable until light reaches it. The
 * phone lies screen up over the page with its torch on: the light spreads
 * out from under it, and as the phone glides slowly over the page the print
 * comes and goes with the pool of light. On the phone's screen, a compass at
 * the top turns with the way it's heading, and under it the magnifier shows
 * the print beneath the phone, enlarged, live.
 *
 * The page and the light are a canvas in the hero itself, over its sky and
 * under the phone and copy; the hero is kept dark (`data-dark`), so the copy
 * turns white. Under reduced motion the phone stays put in its pool of light.
 */
export function HeroFlashlight({ className }: { className?: string; accent?: string }) {
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const [live] = useState(() => (typeof document === "undefined" ? undefined : Object.assign(document.createElement("canvas"), { width: W, height: H })));
  const [action] = useState<PhoneAction>(() => ({ at: 0, does: "front", hold: true }));

  useEffect(() => {
    const hero = ref.current!.closest("section")!;
    hero.dataset.dark = "true";
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    // Over the hero's sky and foot fade, under the phone and copy (z-20).
    cv.className = "under-copy pointer-events-none absolute inset-0 z-[16] size-full";
    hero.append(cv);
    const ctx = cv.getContext("2d")!;
    const paper = document.createElement("canvas"); // the print, drawn once per size
    const lit = document.createElement("canvas"); // the print where the light falls, each frame
    const pctx = paper.getContext("2d")!;
    const lctx = lit.getContext("2d")!;
    const sctx = live?.getContext("2d");
    let w = 0;
    let h = 0;
    let d = 1;

    const layout = () => {
      d = devicePixelRatio;
      w = hero.clientWidth;
      h = hero.clientHeight;
      for (const c of [cv, paper, lit]) {
        c.width = w * d;
        c.height = h * d;
      }
      pctx.setTransform(d, 0, 0, d, 0, 0);
      pctx.clearRect(0, 0, w, h);
      printGrid(pctx);
    };

    // The print, in page px: one line per cell of an even grid, every other
    // row offset half a cell like brickwork, and the lines cycling so no two
    // neighbours match.
    const printGrid = (g: CanvasRenderingContext2D) => {
      const phoneW = w < 768;
      const cell = phoneW ? CELL_PHONE : CELL;
      g.font = `500 ${phoneW ? 9 : 13}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "rgba(240,230,210,0.9)";
      const cols = Math.max(2, Math.round(w / cell.w));
      const cw = w / cols;
      const rows = Math.ceil(h / cell.h);
      const ch = h / rows;
      for (let row = 0; row < rows; row++) {
        const shift = row % 2 ? cw / 2 : 0;
        for (let col = -1; col <= cols; col++) {
          const line = PRINT[(((col + row * 4) % PRINT.length) + PRINT.length) % PRINT.length];
          g.fillText(line, shift + col * cw + cw / 2, row * ch + ch / 2, cw - 24);
        }
      }
    };

    const t0 = performance.now();
    let heading = 0;
    let last = { x: 0, y: 0 };
    const draw = () => {
      const t = still ? SPREAD * 2 : performance.now() - t0;

      // The phone glides over the page on a slow figure, and the light goes with it.
      const ax = Math.min(w * (w < 700 ? 0.18 : 0.26), 380);
      const px = still ? 0 : Math.sin(t / 3400) * ax;
      const py = still ? 0 : Math.sin(t / 2300) * 26;
      if (phone.current) phone.current.style.transform = `translate(${px}px, ${py}px)`;
      const r = phone.current?.getBoundingClientRect();
      const s = hero.getBoundingClientRect();
      // The flash: on the phone's back, about a third of the way down the model.
      const lx = r ? r.left - s.left + r.width / 2 : w / 2;
      const ly = r ? r.top - s.top + r.height * 0.42 : h / 2;
      const grow = 1 - (1 - Math.min(1, t / SPREAD)) ** 3;
      const R = Math.max(220, Math.min(w, h) * 0.42) * grow;

      // Which way it's heading, for the compass: eased, from the last frame's move.
      const vx = lx - last.x;
      const vy = ly - last.y;
      last = { x: lx, y: ly };
      if (Math.hypot(vx, vy) > 0.05) {
        const target = Math.atan2(vx, -vy);
        let diff = target - heading;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        heading += diff * 0.06;
      }

      // The lit print: the page, kept only inside the pool of light.
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.globalCompositeOperation = "source-over";
      lctx.clearRect(0, 0, lit.width, lit.height);
      lctx.drawImage(paper, 0, 0);
      lctx.setTransform(d, 0, 0, d, 0, 0);
      lctx.globalCompositeOperation = "destination-in";
      if (R > 1) {
        const m = lctx.createRadialGradient(lx, ly, 0, lx, ly, R);
        m.addColorStop(0, "rgba(0,0,0,1)");
        m.addColorStop(0.45, "rgba(0,0,0,0.85)");
        m.addColorStop(0.8, "rgba(0,0,0,0.2)");
        m.addColorStop(1, "rgba(0,0,0,0)");
        lctx.fillStyle = m;
        lctx.fillRect(0, 0, w, h);
      } else lctx.clearRect(0, 0, w, h);
      lctx.globalCompositeOperation = "source-over";

      // The room: dark, the warm pool of light, then the print it shows.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#050608";
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      if (R > 1) {
        const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * 1.15);
        glow.addColorStop(0, "rgba(255,236,200,0.22)");
        glow.addColorStop(0.5, "rgba(255,226,180,0.08)");
        glow.addColorStop(1, "rgba(255,220,170,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(lit, 0, 0);

      // How many page px the screen canvas's width covers, as shown: measured
      // off screenshots (the model's tilt and the screen texture's mapping make it ~a fifth of the box).
      if (sctx) screen(sctx, lx, ly, R, heading, grow, r ? r.width * 0.2 : 150);
    };

    // The phone's screen: the compass, then the magnified print under the phone.
    const screen = (c: CanvasRenderingContext2D, px: number, py: number, pool: number, rad: number, on: number, onPage: number) => {
      c.fillStyle = "#07090c";
      c.fillRect(0, 0, W, H);
      c.fillStyle = "#fff";
      c.font = "600 34px system-ui, sans-serif";
      c.textAlign = "left";
      c.textBaseline = "alphabetic";
      c.fillText("9:41", 64, 90); // left of the punch-hole camera

      // Compass: a dial that turns against the heading, under a fixed pointer.
      const cx = W / 2;
      const cy = 330;
      const cr = 150;
      c.strokeStyle = "rgba(255,255,255,0.18)";
      c.lineWidth = 4;
      c.beginPath();
      c.arc(cx, cy, cr, 0, Math.PI * 2);
      c.stroke();
      c.save();
      c.translate(cx, cy);
      c.rotate(-rad);
      for (let i = 0; i < 72; i++) {
        const major = i % 6 === 0;
        c.rotate(Math.PI / 36);
        c.strokeStyle = major ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)";
        c.lineWidth = major ? 4 : 2;
        c.beginPath();
        c.moveTo(0, -cr + 8);
        c.lineTo(0, -cr + (major ? 30 : 20));
        c.stroke();
      }
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.font = "700 40px system-ui, sans-serif";
      ["N", "E", "S", "W"].forEach((l, i) => {
        const a = (i * Math.PI) / 2;
        c.save();
        c.translate(Math.sin(a) * (cr - 62), -Math.cos(a) * (cr - 62));
        c.rotate(rad); // letters stay upright
        c.fillStyle = l === "N" ? "#ff4d4d" : "#fff";
        c.fillText(l, 0, 0);
        c.restore();
      });
      c.restore();
      c.fillStyle = "#ffd27a";
      c.beginPath();
      c.moveTo(cx, cy - cr - 14);
      c.lineTo(cx - 16, cy - cr - 42);
      c.lineTo(cx + 16, cy - cr - 42);
      c.closePath();
      c.fill();
      const deg = Math.round(((((rad * 180) / Math.PI) % 360) + 360) % 360);
      const dir = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(deg / 45) % 8];
      // The centre: a needle pointing the way it's heading (up), red tip to north's side.
      c.fillStyle = "#ffd27a";
      c.beginPath();
      c.moveTo(cx, cy - 58);
      c.lineTo(cx + 12, cy);
      c.lineTo(cx - 12, cy);
      c.closePath();
      c.fill();
      c.fillStyle = "rgba(255,255,255,0.35)";
      c.beginPath();
      c.moveTo(cx, cy + 58);
      c.lineTo(cx + 12, cy);
      c.lineTo(cx - 12, cy);
      c.closePath();
      c.fill();
      c.fillStyle = "#fff";
      c.beginPath();
      c.arc(cx, cy, 8, 0, Math.PI * 2);
      c.fill();
      // The reading, under the dial, clear of its letters.
      c.font = "600 44px system-ui, sans-serif";
      c.fillText(`${deg}° ${dir}`, cx, cy + cr + 52);

      // The magnifier: what's under the phone, ZOOM times bigger.
      c.save();
      c.beginPath();
      c.roundRect(LENS.x, LENS.y, LENS.w, LENS.h, LENS.r);
      c.clip();
      c.fillStyle = "#050608";
      c.fillRect(LENS.x, LENS.y, LENS.w, LENS.h);
      // The page under the lens, drawn afresh at the lens's scale (so the
      // text stays sharp), ZOOM times bigger than it shows round the phone,
      // and dimming toward the edge of the light as it does on the page.
      c.save();
      const phoneW = innerWidth < 768;
      const zoom = phoneW ? ZOOM_PHONE : ZOOM;
      const k = phoneW ? LENS.w / SPAN_PHONE : (W * zoom) / onPage;
      c.translate(W / 2, LENS.y + LENS.h / 2);
      c.scale(k, k);
      c.translate(-px, -py);
      c.globalAlpha = 0.25 + 0.75 * on;
      printGrid(c);
      c.globalAlpha = 1;
      if (pool > 1) {
        const fall = c.createRadialGradient(px, py, 0, px, py, pool);
        fall.addColorStop(0, "rgba(5,6,8,0)");
        fall.addColorStop(0.45, "rgba(5,6,8,0.15)");
        fall.addColorStop(0.8, "rgba(5,6,8,0.8)");
        fall.addColorStop(1, "#050608");
        c.fillStyle = fall;
        c.fillRect(px - onPage, py - onPage * 2, onPage * 2, onPage * 4);
      }
      c.restore();
      // A soft vignette and a crosshair.
      const v = c.createRadialGradient(W / 2, LENS.y + LENS.h / 2, LENS.w * 0.25, W / 2, LENS.y + LENS.h / 2, LENS.w * 0.75);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,0.55)");
      c.fillStyle = v;
      c.fillRect(LENS.x, LENS.y, LENS.w, LENS.h);
      c.strokeStyle = "rgba(255,210,122,0.5)";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(W / 2 - 24, LENS.y + LENS.h / 2);
      c.lineTo(W / 2 + 24, LENS.y + LENS.h / 2);
      c.moveTo(W / 2, LENS.y + LENS.h / 2 - 24);
      c.lineTo(W / 2, LENS.y + LENS.h / 2 + 24);
      c.stroke();
      c.restore();
      c.strokeStyle = "rgba(255,255,255,0.22)";
      c.lineWidth = 3;
      c.beginPath();
      c.roundRect(LENS.x, LENS.y, LENS.w, LENS.h, LENS.r);
      c.stroke();
      // Its zoom chip, the text centred in it.
      const chipY = LENS.y + LENS.h - 52;
      c.fillStyle = "rgba(5,6,8,0.85)";
      c.strokeStyle = "rgba(255,210,122,0.6)";
      c.lineWidth = 2;
      c.beginPath();
      c.roundRect(W / 2 - 62, chipY - 26, 124, 52, 26);
      c.fill();
      c.stroke();
      c.fillStyle = "#ffd27a";
      c.font = "700 30px system-ui, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(`${zoom}×`, W / 2, chipY + 1);

      // The torch's state, at the foot: a drawn torch and the label, centred as one in the pill.
      const pillY = 1308;
      c.fillStyle = "rgba(255,210,122,0.16)";
      c.beginPath();
      c.roundRect(W / 2 - 150, pillY - 38, 300, 76, 38);
      c.fill();
      c.font = "600 32px system-ui, sans-serif";
      const label = "Torch on";
      const iw = 24;
      const gap = 16;
      const x0 = W / 2 - (iw + gap + c.measureText(label).width) / 2;
      c.fillStyle = "#ffd27a";
      c.beginPath(); // the head, wide at the lens end (up), and the handle
      c.moveTo(x0, pillY - 14);
      c.lineTo(x0 + iw, pillY - 14);
      c.lineTo(x0 + iw * 0.72, pillY - 2);
      c.lineTo(x0 + iw * 0.28, pillY - 2);
      c.closePath();
      c.fill();
      c.beginPath();
      c.roundRect(x0 + iw * 0.28, pillY - 2, iw * 0.44, 18, 3);
      c.fill();
      c.textAlign = "left";
      c.fillText(label, x0 + iw + gap, pillY + 1);
    };

    layout();
    draw();
    let width = hero.clientWidth;
    let height = hero.clientHeight;
    const ro = new ResizeObserver(() => {
      if (hero.clientWidth === width && hero.clientHeight === height) return;
      width = hero.clientWidth;
      height = hero.clientHeight;
      layout();
      draw();
    });
    ro.observe(hero);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);
    const loop = () => {
      if (visible && !document.hidden) draw();
      raf = requestAnimationFrame(loop);
    };
    if (!still) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      cv.remove();
      delete hero.dataset.dark;
    };
  }, [live, still]);

  return (
    <div ref={ref} className="relative">
      <div ref={phone} className="will-change-transform">
        <PhoneModel live={live} stream={!still} liveKey={still} action={action} className={className} />
      </div>
    </div>
  );
}
