"use client";

import { useEffect, useState } from "react";
import { PhoneModel, ACTION_MS, type PhoneAction } from "./PhoneModel";
import type { HeroAction } from "@/data/appTemplates";

/**
 * The hero's 3D phone with the app's demo buttons beside it — left, then
 * right — from `@/data/appTemplates`. Pressing one plays its action on the
 * phone (see PhoneModel) and shows its note above it. With no actions it is
 * just the phone. Under reduced motion the phone doesn't turn, so a ring or
 * torch shows as a steady white glow behind it instead of the flash LED.
 */
export function HeroPhone({ className, screen, actions = [] }: { className?: string; screen?: string; actions?: HeroAction[] }) {
  const [playing, setPlaying] = useState<(PhoneAction & { note: string; label: string }) | null>(null);

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

      <PhoneModel screen={screen} action={playing ?? undefined} className={className} />

      {playing && (
        <p
          key={`note-${playing.at}`}
          role="status"
          className="absolute top-[2%] left-1/2 flex w-max -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-[13px] font-medium text-white shadow-lg"
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
        </button>
      ))}
    </div>
  );
}
