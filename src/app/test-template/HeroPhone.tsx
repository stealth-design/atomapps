"use client";

import { useEffect, useState } from "react";
import { PhoneModel, ACTION_MS, type PhoneAction } from "./PhoneModel";
import type { HeroAction } from "@/data/appTemplates";
import { Hint } from "./Hint";

const W = 630; // the screen canvas, 9:20 like the phone's display
const H = 1400;

type Face = { name: string; icon: string; accent: string; button: string; status: string };

/** The app's main screen: icon and name, a big round button ringed in its accent, and a status line. */
function drawFace(ctx: CanvasRenderingContext2D, { name, accent, button, status }: Face, icon?: HTMLImageElement) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#ffffff");
  bg.addColorStop(1, "#eef1fb");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#1d1d1f";
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("9:41", 64, 90); // left of the punch-hole camera
  ctx.textAlign = "center";
  if (icon) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(W / 2 - 60, 170, 120, 120, 30);
    ctx.clip();
    ctx.drawImage(icon, W / 2 - 60, 170, 120, 120);
    ctx.restore();
  }
  ctx.font = "700 44px system-ui, sans-serif";
  ctx.fillText(name, W / 2, 360);

  // The button, with two soft rings round it like sound waves.
  ctx.fillStyle = accent;
  for (const [r, a] of [[330, 0.07], [270, 0.14]]) {
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(W / 2, 760, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(W / 2, 760, 210, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "700 50px system-ui, sans-serif";
  ctx.fillText(button, W / 2, 778);

  ctx.font = "600 38px system-ui, sans-serif";
  const w = ctx.measureText(status).width;
  ctx.fillStyle = "#34c759";
  ctx.beginPath();
  ctx.arc(W / 2 - w / 2 - 26, 1166, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1d1d1f";
  ctx.fillText(status, W / 2 + 10, 1180);
}

/**
 * The hero's 3D phone with the app's demo buttons beside it — left, then
 * right — from `@/data/appTemplates`. Pressing one plays its action on the
 * phone (see PhoneModel) and shows its note over the middle of it. With no actions it is
 * just the phone. `face` draws the app's main screen on it live instead of
 * an image. Under reduced motion the phone doesn't turn, so a ring or torch
 * shows as a steady white glow behind it instead of the flash LED.
 */
export function HeroPhone({ className, screen, face, actions = [] }: { className?: string; screen?: string; face?: Face; actions?: HeroAction[] }) {
  const [playing, setPlaying] = useState<(PhoneAction & { note: string; label: string }) | null>(null);
  const [live] = useState(() => (face && typeof document !== "undefined" ? Object.assign(document.createElement("canvas"), { width: W, height: H }) : undefined));
  const [icon, setIcon] = useState<HTMLImageElement>();

  // Drawn at once, then again when the icon has loaded.
  const iconSrc = face?.icon;
  useEffect(() => {
    if (!iconSrc) return;
    const img = new Image();
    img.onload = () => setIcon(img);
    img.src = iconSrc;
  }, [iconSrc]);
  useEffect(() => {
    if (live && face) drawFace(live.getContext("2d")!, face, icon);
  }, [live, face, icon]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(null), ACTION_MS);
    return () => clearTimeout(t);
  }, [playing]);

  const lit = playing?.does === "ring" || playing?.does === "torch";

  return (
    <div className="relative">
      {/* Reduced motion only: a steady glow in place of the flash LED. */}
      {lit && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-[6%] left-1/2 hidden size-[min(80vw,48vh)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(255,244,214,0.55)_32%,transparent_70%)] motion-reduce:block"
        />
      )}

      <PhoneModel screen={screen} live={live} liveKey={icon} action={playing ?? undefined} className={className} />

      {playing && (
        <p
          key={`note-${playing.at}`}
          role="status"
          className="absolute top-1/2 left-1/2 z-20 flex w-max -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-[13px] font-medium text-white shadow-lg"
        >
          <span className="size-2 animate-pulse rounded-full bg-[#ff5a5a]" />
          {playing.note}
        </p>
      )}

      {actions.slice(0, 2).map(({ label, emoji, does, note, screen: shot }, i) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          onClick={() => setPlaying({ at: performance.now(), does, screen: shot, note, label })}
          className={`absolute top-[34%] z-10 flex items-center gap-2 rounded-full bg-white/75 p-3 text-[15px] font-semibold text-[var(--foreground)] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] ring-1 backdrop-blur-md transition-[transform,box-shadow] duration-300 can-hover:hover:scale-105 active:scale-95 tablet:px-5 ${i ? "left-[calc(50%+min(28vw,17vh))]" : "right-[calc(50%+min(28vw,17vh))]"} ${playing?.label === label ? "ring-2 ring-[var(--accent)]" : "ring-black/5"}`}
        >
          <span className="text-[22px] leading-none">{emoji}</span>
          <span className="hidden tablet:inline">{label}</span>
          <Hint />
        </button>
      ))}
    </div>
  );
}
