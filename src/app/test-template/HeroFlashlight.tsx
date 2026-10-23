"use client";

import { useEffect, useRef, useState } from "react";
import { Flashlight } from "lucide-react";
import { PhoneModel, type PhoneAction } from "./PhoneModel";
import { Hint } from "./Hint";

const W = 630; // the screen canvas, 9:20 like the phone's display
const H = 1400;
const SWATCHES = [
  { name: "White", color: "#ffffff" },
  { name: "Warm amber", color: "#ffb347" },
  { name: "Red", color: "#ff3b30" },
  { name: "Green", color: "#34c759" },
  { name: "Blue", color: "#0a84ff" },
  { name: "Pink", color: "#ff5fa2" },
];

/** The phone's screen: a colour edge to edge, or with none picked, the app's dark screen-light panel. */
function drawScreen(ctx: CanvasRenderingContext2D, color: string | null, accent: string) {
  ctx.fillStyle = color ?? "#0b0d10";
  ctx.fillRect(0, 0, W, H);
  if (color) return;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("9:41", 64, 90); // left of the punch-hole camera
  ctx.textAlign = "center";
  ctx.font = "700 56px system-ui, sans-serif";
  ctx.fillText("Screen light", W / 2, 300);
  ctx.beginPath();
  ctx.arc(W / 2, 700, 170, 0, Math.PI * 2);
  ctx.lineWidth = 18;
  ctx.strokeStyle = accent;
  ctx.stroke();
  ctx.font = "160px system-ui, sans-serif";
  ctx.fillText("🔦", W / 2, 760);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 34px system-ui, sans-serif";
  ctx.fillText("Pick a colour", W / 2, 1020);
}

/**
 * The flashlight hero. Left of the phone, colour swatches: picking one holds
 * the phone facing front with its screen lit in that colour and a glow of it
 * behind; picking it again lets go. Right of it, the Flashlight toggle: on,
 * the hero goes dark (`data-dark` on the hero section — AppTemplate turns the
 * copy white), the phone turns to its back with its flash held on, and a
 * pool of torchlight spreads from it. A colour picked in the dark turns the
 * phone back round, a screen light glowing in the dark. The torch never
 * strobes; under reduced motion the phone doesn't turn and the pool is the
 * light.
 */
export function HeroFlashlight({ className, accent }: { className?: string; accent: string }) {
  const [color, setColor] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);
  const [action, setAction] = useState<PhoneAction>();
  const [live] = useState(() => (typeof document === "undefined" ? undefined : Object.assign(document.createElement("canvas"), { width: W, height: H })));
  const ref = useRef<HTMLDivElement>(null);

  // The phone's pose follows the controls: a colour faces it front, the torch alone turns it round.
  const pose = (c: string | null, t: boolean, at: number) => {
    setColor(c);
    setTorch(t);
    setAction(c ? { at, does: "front", hold: true } : t ? { at, does: "torch", hold: true } : undefined);
  };

  useEffect(() => {
    if (live) drawScreen(live.getContext("2d")!, color, accent);
  }, [live, color, accent]);

  useEffect(() => {
    const hero = ref.current!.closest("section")!;
    hero.dataset.dark = String(torch);
    return () => void delete hero.dataset.dark;
  }, [torch]);

  const beam = torch && !color;

  return (
    <div ref={ref} className="relative">
      {/* Torchlight, from the flash, over the dark hero. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute top-[30%] left-1/2 size-[min(1400px,180vw)] -translate-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,246,220,0.75)_0%,rgba(255,240,205,0.28)_22%,rgba(255,235,190,0.08)_45%,transparent_62%)] transition-opacity duration-[600ms] motion-reduce:transition-none ${beam ? "opacity-100" : "opacity-0"}`}
      />
      {/* The screen's colour, glowing behind the phone. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute top-[42%] left-1/2 size-[min(90vw,60vh)] -translate-1/2 rounded-full blur-3xl transition-[opacity,background-color] duration-500 motion-reduce:transition-none ${color ? (torch ? "opacity-80" : "opacity-55") : "opacity-0"}`}
        style={{ backgroundColor: color ?? "transparent" }}
      />

      <PhoneModel live={live} liveKey={`${color}${accent}`} action={action} className={className} />

      {torch && (
        <p
          role="status"
          className="absolute top-1/2 left-1/2 z-20 flex w-max -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#1d1d1f] shadow-lg"
        >
          <span className="size-2 rounded-full bg-[#ffd27a]" />
          {color ? "Screen light on" : "Torch on"}
        </p>
      )}

      <div
        role="group"
        aria-label="Screen colour"
        // A column at the screen's left edge on phones, clear of the phone; beside it, left, from tablet up.
        className="absolute top-[24%] left-3 z-10 flex flex-col gap-2 rounded-[22px] bg-white/75 p-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-md tablet:top-[34%] tablet:right-[calc(50%+min(26vw,16vh))] tablet:left-auto tablet:grid tablet:grid-cols-3 tablet:p-2.5 desktop-sm:flex desktop-sm:flex-row"
      >
        {SWATCHES.map(({ name, color: c }) => (
          <button
            key={c}
            type="button"
            aria-label={name}
            aria-pressed={color === c}
            onClick={() => pose(color === c ? null : c, torch, performance.now())}
            className={`size-7 rounded-full ring-offset-2 transition-transform duration-200 active:scale-90 can-hover:hover:scale-110 tablet:size-8 ${
              color === c ? "ring-2 ring-[#1d1d1f]" : "ring-1 ring-black/15"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <Hint />
      </div>

      <button
        type="button"
        role="switch"
        aria-label="Flashlight"
        aria-checked={torch}
        onClick={() => pose(color, !torch, performance.now())}
        className={`absolute top-[34%] left-[calc(50%+min(26vw,16vh))] z-10 flex items-center gap-2 rounded-full p-3 text-[15px] font-semibold shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] ring-1 backdrop-blur-md transition-[background-color,color,transform] duration-300 active:scale-95 can-hover:hover:scale-105 tablet:px-5 ${
          torch ? "bg-[#ffd27a] text-[#1d1d1f] ring-[#ffd27a]" : "bg-white/75 text-[#1d1d1f] ring-black/5"
        }`}
      >
        <Flashlight aria-hidden className="size-[22px]" strokeWidth={1.8} />
        <span className="hidden tablet:inline">Flashlight</span>
        <span aria-hidden className={`hidden h-5 w-9 rounded-full p-0.5 transition-colors tablet:block ${torch ? "bg-[#1d1d1f]" : "bg-black/15"}`}>
          <span className={`block size-4 rounded-full bg-white transition-transform duration-300 ${torch ? "translate-x-4" : ""}`} />
        </span>
        <Hint />
      </button>
    </div>
  );
}
