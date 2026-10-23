"use client";

import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { FlatPhone } from "./FlatPhone";
import { useReducedMotion } from "./useReducedMotion";
import { Hint } from "./Hint";

const AT_REST = ["Plan the weekend", "Reply to Sam"];
const SPOKEN = ["Buy milk", "Call mom at 6", "Gym tomorrow 7am"];
const TICK = 40; // ms a typed letter takes
const PAUSE = 15; // ticks between one task landing and the next starting
// The tick each spoken task starts typing on, after a short wait for the waves.
const STARTS = SPOKEN.reduce<number[]>((acc, task, i) => [...acc, i ? acc[i - 1] + SPOKEN[i - 1].length + PAUSE : 12], []);
const DONE = STARTS.at(-1)! + SPOKEN.at(-1)!.length + PAUSE;
const NOTE_FOR = 60; // ticks "3 tasks added" stays up

/**
 * The notes hero: a flat phone with a to-do list and a Voice command button
 * beside it. Pressing it puts up "Listening…", sends audio waves from the
 * button to the phone, and the three spoken tasks type themselves in one by
 * one, each then dropping into the list with a soft bounce. Then the waves
 * stop, the last task gets a colour tag and the note reads "3 tasks added".
 * Pressing again starts over. No microphone, no sound; under reduced motion
 * there are no waves and the tasks simply appear.
 */
export function HeroNotes() {
  const still = useReducedMotion();
  const [run, setRun] = useState(0);
  const [tick, setTick] = useState(0);
  const end = DONE + NOTE_FOR;

  useEffect(() => {
    if (!run || tick >= end) return;
    const t = setTimeout(() => setTick(tick + 1), TICK);
    return () => clearTimeout(t);
  }, [run, tick, end]);

  const start = () => {
    setTick(still ? DONE : 0);
    setRun((r) => r + 1);
  };

  const listening = run > 0 && tick < DONE;
  const typed = SPOKEN.map((task, i) => task.slice(0, Math.max(0, tick - STARTS[i])));
  const landed = run ? SPOKEN.filter((task, i) => typed[i] === task) : [];
  const typing = typed.find((text, i) => text && text !== SPOKEN[i]);
  const done = run > 0 && tick >= DONE;

  return (
    <div className="relative mt-6 short:mt-3">
      <style>{`@keyframes tt-land{from{opacity:0;transform:translateY(-14px) scale(.96)}to{opacity:1;transform:none}}@keyframes tt-wave{to{stroke-dashoffset:-48}}`}</style>

      {run > 0 && tick < end && (
        <p role="status" className="absolute -top-4 left-1/2 z-20 flex w-max -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-[13px] font-medium text-white shadow-lg">
          <span className={`size-2 rounded-full ${done ? "bg-[#3ddc84]" : "animate-pulse bg-[#ff5a5a]"}`} />
          {done ? "3 tasks added" : "Listening…"}
        </p>
      )}

      <FlatPhone>
        <div className="px-5 pt-6">
          <p className="text-[24px] leading-none font-bold">To do</p>
          <p className="mt-1 text-[12px] text-black/45">{AT_REST.length + landed.length} tasks</p>

          <div className={`mt-4 flex h-9 items-center gap-2 rounded-full px-3 text-[13px] transition-colors duration-300 ${listening ? "bg-[var(--accent)]/12 text-[#1d1d1f]" : "bg-[#f3f4f8] text-black/35"}`}>
            <Mic aria-hidden className={`size-4 shrink-0 ${listening ? "text-[var(--accent)]" : ""}`} strokeWidth={2} />
            {typing ? (
              <span className="truncate">
                {typing}
                <span className="ml-px inline-block h-3.5 w-px translate-y-0.5 animate-pulse bg-[#1d1d1f]" />
              </span>
            ) : listening ? (
              "Listening…"
            ) : (
              "Add a task"
            )}
          </div>

          <ul className="mt-4 flex flex-col gap-2">
            {[...AT_REST, ...landed].map((task, i) => {
              const fresh = i >= AT_REST.length;
              const tagged = done && task === SPOKEN.at(-1);
              return (
                <li
                  key={`${run}-${task}`}
                  className="flex items-center gap-3 rounded-2xl bg-[#f6f6f8] px-3 py-2.5 text-[13px] font-medium"
                  style={fresh && !still ? { animation: "tt-land .5s cubic-bezier(0.34,1.56,0.64,1) both" } : undefined}
                >
                  <span className="size-4 shrink-0 rounded-[5px] border-[1.5px] border-black/25" />
                  <span className="min-w-0 flex-1 truncate">{task}</span>
                  {tagged && <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">Fitness</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </FlatPhone>

      {/* Audio waves from the button into the phone's screen. */}
      {listening && !still && (
        <svg
          aria-hidden
          viewBox="0 0 160 60"
          preserveAspectRatio="none"
          className="pointer-events-none absolute top-[calc(30%-6px)] right-1/2 z-10 h-[72px] w-[min(160px,calc(50vw-64px))] [mask-image:linear-gradient(90deg,#000_40%,transparent)]"
        >
          {/* Three nested ripples, in phase, the inner ones smaller and fainter. */}
          {[22, 13, 6].map((a, i) => (
            <path
              key={a}
              d={`M0 30 Q20 ${30 - a} 40 30 T80 30 T120 30 T160 30`}
              fill="none"
              className="stroke-[var(--accent)]"
              strokeWidth={2.5 - i * 0.5}
              strokeLinecap="round"
              strokeDasharray="18 10"
              opacity={0.9 - i * 0.25}
              style={{ animation: `tt-wave ${0.7 + i * 0.15}s linear infinite` }}
            />
          ))}
        </svg>
      )}

      <button
        type="button"
        onClick={start}
        aria-label="Voice command"
        className={`absolute top-[30%] left-3 z-20 flex items-center gap-2 rounded-full p-3 text-[15px] font-semibold shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] ring-1 backdrop-blur-md transition-[transform,background-color,color] duration-300 can-hover:hover:scale-105 active:scale-95 tablet:right-[calc(50%+min(160px,40vw))] tablet:left-auto tablet:px-5 ${
          listening ? "bg-[var(--accent)] text-white ring-[var(--accent)]" : "bg-white/75 text-[var(--foreground)] ring-black/5"
        }`}
      >
        <Mic aria-hidden className="size-[22px]" strokeWidth={1.8} />
        <span className="hidden tablet:inline">Voice command</span>
        <Hint />
      </button>
    </div>
  );
}
