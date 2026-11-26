"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { drawFace, W, H, type Face } from "./HeroPhone";

// The scene (three.js via React Three Fiber) loads on the client only, in its own chunk.
const RoomScene = dynamic(() => import("./RoomScene"), { ssr: false });

// The story, in ms after the clap: the hidden phone buzzes, the camera flies over to the cushion,
// the cushion lifts off, the camera closes in on the phone.
export const BUZZ = [700, 3800];
export const FLY_AT = 1300;
export const LIFT_AT = 2500;
export const LIFT_MS = 800;
export const CLOSE_AT = 2900;
const FOUND_AT = LIFT_AT + LIFT_MS;
const BACK_MS = 1400; // a replay first lets the camera ease back out
const HOLD_MS = 3000; // how long the found phone stays up before the loop starts over

type Phase = "idle" | "clap" | "ring" | "found";

/**
 * Find My Phone's hero: the living room fills the hero (RoomScene), the phone
 * slipped down the side of the sofa seat behind a cushion. Someone claps, the
 * cushion buzzes with light leaking out, the camera turns round to the sofa, the
 * cushion is pulled aside and there's the lit phone — found. Starts when the hero first comes into view and
 * loops; "Clap again" restarts it at once. Under reduced motion it plays
 * once and shows the found phone without the fly-in or the shake.
 */
export function HeroFindPhone({ face, className = "" }: { face: Face; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const act = useRef<number | null>(null);
  const liveDirty = useRef(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [live] = useState(() => (typeof document !== "undefined" ? Object.assign(document.createElement("canvas"), { width: W, height: H }) : undefined));
  const [icon, setIcon] = useState<HTMLImageElement>();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setIcon(img);
    img.src = face.icon;
  }, [face.icon]);

  // The screen tells the story: waiting, ringing, found.
  useEffect(() => {
    if (!live) return;
    const status = phase === "ring" ? "Clap detected · Ringing" : phase === "found" ? "Found it!" : face.status;
    const button = phase === "ring" ? "Ringing…" : face.button;
    drawFace(live.getContext("2d")!, { ...face, status, button }, icon);
    liveDirty.current = true;
  }, [live, face, icon, phase]);

  const play = () => {
    timers.current.forEach(clearTimeout);
    timers.current.length = 0; // same array: the unmount cleanup holds it
    const wait = act.current === null ? 0 : BACK_MS;
    act.current = null;
    setPhase("idle");
    const later = (ms: number, f: () => void) => timers.current.push(setTimeout(f, wait + ms));
    later(0, () => {
      act.current = performance.now();
      setPhase("clap");
    });
    later(BUZZ[0], () => setPhase("ring"));
    later(FOUND_AT, () => setPhase("found"));
    // Loops: holds on the found phone, then flies back out and claps again.
    // Not under reduced motion, where each loop would be a hard cut.
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) later(FOUND_AT + HOLD_MS, play);
  };

  useEffect(() => {
    if (!live) return;
    // First time in view: a beat to take in the room, then the clap.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      timers.current.push(setTimeout(play, 1200));
    });
    io.observe(host.current!);
    const t = timers.current;
    return () => {
      io.disconnect();
      t.forEach(clearTimeout);
    };
    // play only touches refs and state setters, so the first render's copy is fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  return (
    <div className={className}>
      <div ref={host} aria-hidden className="absolute inset-0">
        {live && <RoomScene live={live} act={act} liveDirty={liveDirty} />}
      </div>
      {/* Keeps the copy legible over the room. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.6)_45%,transparent_100%)]" />

      <style>{`
        @keyframes fp-clap{0%{transform:scale(.6) rotate(-8deg);opacity:0}15%{transform:scale(1.15) rotate(6deg);opacity:1}30%{transform:scale(.9) rotate(-4deg)}45%{transform:scale(1.15) rotate(6deg)}70%{transform:scale(1);opacity:1}100%{transform:scale(1.05);opacity:0}}
        @keyframes fp-wave{0%{transform:scale(.4);opacity:.7}100%{transform:scale(2.6);opacity:0}}
        @keyframes fp-pop{0%{transform:translateY(8px) scale(.9);opacity:0}100%{transform:none;opacity:1}}
      `}</style>

      {/* The clap: hands meeting twice, with sound waves going out. */}
      {phase === "clap" && (
        <div aria-hidden className="pointer-events-none absolute top-[58%] left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
          {[0, 1, 2].map((i) => (
            <span key={i} className="absolute size-28 rounded-full border-2 border-white/90 motion-safe:animate-[fp-wave_0.9s_ease-out_both]" style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
          <span className="text-[72px] leading-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] motion-safe:animate-[fp-clap_0.9s_ease-out_both]">👏</span>
        </div>
      )}

      <p role="status" className="absolute top-[47%] left-1/2 z-10 -translate-x-1/2">
        {(phase === "ring" || phase === "found") && (
          <span
            key={phase}
            className="flex w-max items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-[13px] font-medium text-white shadow-lg motion-safe:animate-[fp-pop_0.35s_ease-out_both]"
          >
            <span className={`size-2 rounded-full ${phase === "found" ? "bg-[#34c759]" : "animate-pulse bg-[#ff5a5a]"}`} />
            {phase === "found" ? "Phone found" : "Clap detected · Ringing"}
          </span>
        )}
      </p>

      {phase === "found" && (
        <button
          type="button"
          onClick={play}
          className="absolute bottom-[150px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/80 px-5 py-3 text-[15px] font-semibold text-[var(--foreground)] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-md transition-transform duration-300 motion-safe:animate-[fp-pop_0.35s_ease-out_both] can-hover:hover:scale-105 active:scale-95 tablet:bottom-[170px]"
        >
          <span className="text-[22px] leading-none">👏</span>
          Clap again
        </button>
      )}
    </div>
  );
}
