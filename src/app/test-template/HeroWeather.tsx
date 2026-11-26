"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneModel } from "./PhoneModel";
import { useReducedMotion } from "./useReducedMotion";
import { PERIOD } from "./WeatherScene";
import { ICON_EXT } from "@/components/folds/fold03/appIcons";

const W = 630; // the screen canvas, 9:20 like the phone's display
const H = 1400;
const FADE_MS = 500; // a new weather fades and rises into the widget

// lucide icons (24-unit), as SVG markup so the canvas can draw them as images.
const ICON = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  cloudRain: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
  cloudLightning: '<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/>',
  snowflake: '<path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4"/><path d="m17 3-3 6 1.5 3"/><path d="M2 12h6.5L10 9"/><path d="m20 10-1.5 2 1.5 2"/><path d="M22 12h-6.5L14 15"/><path d="m4 10 1.5 2L4 14"/><path d="m7 21 3-6-1.5-3"/><path d="m7 3 3 6h4"/>',
  cloudSun: '<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
  cloudDrizzle: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/>',
  umbrella: '<path d="M12 13v7a2 2 0 0 0 4 0"/><path d="M12 2v2"/><path d="M20.992 13a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-19.923 0A1 1 0 0 0 3 13z"/>',
  zap: '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>',
  mapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
};
type IconName = keyof typeof ICON;

// The weathers, in RADAR_FRAG's order (see PERIOD), each with its wallpaper's top and bottom colours.
const WEATHERS: { icon: IconName; tint: string; label: string; temp: number; hi: number; lo: number; note: string; noteIcon: IconName; hours: IconName[]; sky: [string, string] }[] = [
  { icon: "sun", tint: "#FFD60A", label: "Sunny", temp: 26, hi: 28, lo: 17, note: "Clear skies all afternoon", noteIcon: "sun", hours: ["sun", "sun", "cloudSun", "sun", "sun", "cloudSun"], sky: ["#2F7FD8", "#9FD3FF"] },
  { icon: "cloud", tint: "#fff", label: "Cloudy", temp: 21, hi: 23, lo: 15, note: "Clouds thickening by 3 PM", noteIcon: "cloud", hours: ["cloud", "cloud", "cloudSun", "cloud", "cloudDrizzle", "cloudRain"], sky: ["#5E6F86", "#B9C5D3"] },
  { icon: "cloudRain", tint: "#fff", label: "Light rain", temp: 18, hi: 21, lo: 12, note: "Rain easing off by 3 PM", noteIcon: "umbrella", hours: ["cloudRain", "cloudRain", "cloudDrizzle", "cloud", "cloudSun", "sun"], sky: ["#34506E", "#8AA3BB"] },
  { icon: "cloudLightning", tint: "#FFD60A", label: "Thunderstorm", temp: 16, hi: 19, lo: 11, note: "Storm warning until 4 PM", noteIcon: "zap", hours: ["cloudLightning", "cloudLightning", "cloudRain", "cloudRain", "cloudDrizzle", "cloud"], sky: ["#1E2440", "#575D82"] },
  { icon: "snowflake", tint: "#fff", label: "Snow", temp: -2, hi: 0, lo: -6, note: "Snow settling, 4 cm by evening", noteIcon: "snowflake", hours: ["snowflake", "snowflake", "snowflake", "cloud", "snowflake", "cloud"], sky: ["#7F9AB8", "#E3ECF6"] },
];
const WALLPAPER: [string, string] = ["#1B2440", "#4A5F8C"];
const AT = ["Now", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"];
const DRIFT = [0, 0, 1, 2, 2, 1]; // each hour's temperature against now's

// The home screen's apps: our own icons (Fold 03's set, see appIcons.ts), two rows of four, then the dock.
const APPS = [
  { label: "Weather", icon: "icon-10" },
  { label: "Alarm", icon: "icon-01" },
  { label: "Calendar", icon: "icon-07" },
  { label: "Notes", icon: "icon-09" },
  { label: "Calculator", icon: "icon-11" },
  { label: "Flashlight", icon: "icon-12" },
  { label: "QR Scan", icon: "icon-13" },
  { label: "Bible", icon: "icon-14" },
];
const DOCK = ["icon-05", "icon-06", "icon-04", "icon-02"]; // Find My Phone, AI Chat, News, Volume
const appIcons = new Map<string, HTMLImageElement>();

/** Every icon the screen uses, loaded once as white (or tinted) images. Resolves when all have decoded. */
const icons = new Map<string, HTMLImageElement>();
const iconKey = (name: IconName, color: string) => `${name}|${color}`;
function loadIcons() {
  const want = new Set<string>([
    ...Object.keys(ICON).map((n) => iconKey(n as IconName, "#fff")),
    ...WEATHERS.map((w) => iconKey(w.icon, w.tint)),
  ]);
  const apps = [...APPS.map((a) => a.icon), ...DOCK].map((name) => {
    if (appIcons.has(name)) return;
    const img = new Image();
    img.src = `/images/fold03/${name}.${ICON_EXT[name] ?? "jpg"}`;
    appIcons.set(name, img);
    return img.decode().catch(() => {});
  });
  return Promise.all([
    ...apps,
    ...[...want].map((k) => {
      if (icons.has(k)) return;
      const [name, color] = k.split("|") as [IconName, string];
      const img = new Image();
      img.src = `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`,
      )}`;
      icons.set(k, img);
      return img.decode().catch(() => {});
    }),
  ]);
}

/**
 * The home screen with the widget showing weather `i`; `t` (0–1) fades and lifts the widget's new readings in,
 * and cross-fades its sky from weather `prev`'s. The wallpaper stays put.
 */
function drawScreen(ctx: CanvasRenderingContext2D, i: number, prev: number, t: number, font: string) {
  const w = WEATHERS[i];
  const icon = (name: IconName, x: number, y: number, size: number, color = "#fff") => {
    const img = icons.get(iconKey(name, color));
    if (img?.complete) ctx.drawImage(img, x, y, size, size);
  };
  const text = (s: string, x: number, y: number, size: number, weight: number, color = "#fff", align: CanvasTextAlign = "left") => {
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(s, x, y);
  };
  const rrect = (x: number, y: number, rw: number, rh: number, r: number, fill: string | CanvasGradient) => {
    ctx.beginPath();
    ctx.roundRect(x, y, rw, rh, r);
    ctx.fillStyle = fill;
    ctx.fill();
  };
  const grad = ([a, b]: [string, string], y0: number, y1: number) => {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    return g;
  };

  // Wallpaper: a fixed dusk blue, with two soft glows for depth.
  ctx.globalAlpha = 1;
  ctx.fillStyle = grad(WALLPAPER, 0, H);
  ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, a] of [[520, 260, 420, 0.18], [80, 1150, 460, 0.12]] as const) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // Status bar: the time left of the punch-hole camera, signal and battery right.
  text("9:41", 64, 90, 34, 600);
  ctx.fillStyle = "#fff";
  [0, 1, 2, 3].forEach((b) => ctx.fillRect(452 + b * 11, 82 - b * 6 - 6, 7, b * 6 + 6));
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(508, 64, 50, 24, 7);
  ctx.stroke();
  rrect(512, 68, 34, 16, 4, "#fff");
  rrect(561, 71, 4, 10, 2, "rgba(255,255,255,0.8)");

  // The widget: its own sky for the weather, cross-fading from the last one.
  const top = 150;
  rrect(40, top, 550, 500, 56, grad(WEATHERS[prev].sky, top, top + 500));
  ctx.globalAlpha = t;
  rrect(40, top, 550, 500, 56, grad(w.sky, top, top + 500));
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(40, top, 550, 500, 56);
  ctx.stroke();

  icon("mapPin", 76, top + 46, 30);
  text("Detroit", 114, top + 72, 32, 600);

  // The readings, fading and rising in on each change.
  ctx.save();
  ctx.globalAlpha = t;
  ctx.translate(0, (1 - t) * 14);
  text(`${w.temp}°`, 70, top + 220, 150, 300);
  icon(w.icon, 440, top + 40, 110, w.tint);
  text(w.label, 554, top + 196, 32, 600, "#fff", "right");
  text(`H ${w.hi}° · L ${w.lo}°`, 554, top + 236, 26, 400, "rgba(255,255,255,0.75)", "right");

  rrect(76, top + 262, 478, 62, 31, "rgba(255,255,255,0.2)");
  icon(w.noteIcon, 96, top + 278, 30);
  text(w.note, 140, top + 303, 25, 500);
  ctx.beginPath();
  ctx.arc(526, top + 293, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(76, top + 350, 478, 2);
  w.hours.forEach((h, k) => {
    const cx = 116 + k * 80;
    text(AT[k], cx, top + 392, 21, 500, "rgba(255,255,255,0.75)", "center");
    icon(h, cx - 20, top + 406, 40);
    text(`${w.temp + DRIFT[k]}°`, cx, top + 478, 26, 600, "#fff", "center");
  });
  ctx.restore();

  // An app icon, clipped to the same 20.8% corner radius as on the home page.
  const app = (name: string, x: number, y: number) => {
    const img = appIcons.get(name);
    if (!img?.complete) return;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, 112, 112, 112 * 0.208);
    ctx.clip();
    ctx.drawImage(img, x, y, 112, 112);
    ctx.restore();
  };

  // Two rows of apps.
  APPS.forEach((a, k) => {
    const x = 40 + (k % 4) * 146;
    const y = 710 + Math.floor(k / 4) * 190;
    app(a.icon, x, y);
    text(a.label, x + 56, y + 148, 22, 500, "#fff", "center");
  });

  // Page dots and the dock.
  [0, 1, 2].forEach((d) => {
    ctx.beginPath();
    ctx.arc(291 + d * 24, 1150, 6, 0, Math.PI * 2);
    ctx.fillStyle = d === 0 ? "#fff" : "rgba(255,255,255,0.45)";
    ctx.fill();
  });
  rrect(30, 1190, 570, 160, 60, "rgba(255,255,255,0.22)");
  DOCK.forEach((d, k) => app(d, 54 + k * 140, 1214));
}

/**
 * The weather hero: the phone facing front on its home screen, the app's widget on it cycling with the
 * radar map behind (the town under the map's centre, now, and the next few hours).
 */
export function HeroWeather({ className }: { className?: string; accent?: string }) {
  const reduce = useReducedMotion();
  const [live] = useState(() => (typeof document === "undefined" ? undefined : Object.assign(document.createElement("canvas"), { width: W, height: H })));
  const [frame, setFrame] = useState(0); // bumped on every redraw so the phone re-uploads the screen
  const shown = useRef(-1);

  useEffect(() => {
    if (!live) return;
    const ctx = live.getContext("2d")!;
    const font = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
    let raf = 0;
    let gone = false;
    let since = 0;
    let prev = 0;
    const tick = (now: number) => {
      const i = reduce ? 0 : Math.floor(now / PERIOD + 0.2) % WEATHERS.length;
      if (i !== shown.current) {
        prev = shown.current < 0 ? i : shown.current;
        shown.current = i;
        since = now;
      }
      const t = reduce ? 1 : Math.min(1, (now - since) / FADE_MS);
      // Redraw only while a change is fading in, and once when it settles.
      if (t < 1 || since >= 0) {
        drawScreen(ctx, i, prev, t * t * (3 - 2 * t), font);
        setFrame((f) => f + 1);
        if (t >= 1) since = -1;
      }
      if (!reduce) raf = requestAnimationFrame(tick);
    };
    loadIcons().then(() => {
      if (!gone) raf = requestAnimationFrame(tick);
    });
    return () => {
      gone = true;
      cancelAnimationFrame(raf);
    };
  }, [live, reduce]);

  return <PhoneModel live={live} liveKey={frame} className={className} />;
}
