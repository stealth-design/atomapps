"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Mic } from "lucide-react";
import { useReducedMotion } from "./useReducedMotion";
import { NOTE_PITCH } from "./HeroSkies";

/*
 * The notes hero, written on the sky's ruled paper rather than in a phone:
 * a big mic in the middle that hears a command, types out what it heard and
 * says what it did; the day's to-do list on the left, where spoken tasks
 * land and finished ones are struck through; and "Try saying" on the right,
 * the commands it knows, the one playing lit — press any to hear it.
 *
 * It plays on its own: each command in turn, then the list starts over.
 * Everything is derived from where it is in the loop (`cmd`, and `t` ticks
 * into it), so the list is always INITIAL with the commands so far applied.
 * Under reduced motion it rests with every command applied, and pressing a
 * command shows its result at once. No microphone, no sound.
 */

type Item = { text: string; meta?: string; done?: boolean };
type Cmd = { say: string; result: string; add?: Item; done?: string };

const INITIAL: Item[] = [{ text: "Plan the weekend" }, { text: "Reply to Sam" }, { text: "Water the plants" }];
const COMMANDS: Cmd[] = [
  { say: "Add buy milk to my list", result: "Added · Shopping", add: { text: "Buy milk", meta: "Shopping" } },
  { say: "Remind me to call Mom at 6 pm", result: "Added · Today, 6:00 PM", add: { text: "Call Mom", meta: "6:00 PM" } },
  { say: "Mark reply to Sam as done", result: "Done · Reply to Sam", done: "Reply to Sam" },
  { say: "Gym tomorrow at 7 am", result: "Added · Tomorrow, 7:00 AM", add: { text: "Gym", meta: "Tomorrow 7 AM" } },
  { say: "Add pay rent on Friday", result: "Added · Friday", add: { text: "Pay rent", meta: "Fri" } },
  { say: "Tick off water the plants", result: "Done · Water the plants", done: "Water the plants" },
];

const TICK = 50; // ms
const LISTEN = 14; // ticks of listening before the words come
const GAP = 8; // ticks between the last word and the result
const HOLD = 44; // ticks the result shows
const REST = 40; // ticks with the full list before it starts over
const applyAt = (c: number) => LISTEN + COMMANDS[c].say.length + GAP;
const endOf = (c: number) => applyAt(c) + HOLD;

const apply = (list: Item[], c: Cmd) =>
  c.add ? [...list, c.add] : list.map((it) => (it.text === c.done ? { ...it, done: true } : it));

const INK = "#23305a"; // pen blue, on the paper

export function HeroNotes() {
  const still = useReducedMotion();
  const last = COMMANDS.length - 1;
  const [{ cmd, t }, setRun] = useState({ cmd: 0, t: 0 });
  const at = still ? { cmd: last, t: endOf(last) } : { cmd, t };

  useEffect(() => {
    if (still) return;
    const id = setTimeout(() => {
      const end = endOf(cmd) + (cmd === last ? REST : 0);
      setRun(t + 1 < end ? { cmd, t: t + 1 } : { cmd: (cmd + 1) % COMMANDS.length, t: 0 });
    }, TICK);
    return () => clearTimeout(id);
  }, [cmd, t, still, last]);

  const c = COMMANDS[at.cmd];
  const applied = at.t >= applyAt(at.cmd);
  const listening = !applied;
  const heard = c.say.slice(0, Math.max(0, at.t - LISTEN));
  const showResult = applied && at.t < endOf(at.cmd) + (still ? 1 : 0);
  const list = COMMANDS.slice(0, at.cmd + (applied ? 1 : 0)).reduce(apply, INITIAL);
  const fresh = applied ? (c.add?.text ?? c.done) : undefined;

  const play = (k: number) => setRun({ cmd: k, t: still ? endOf(k) : 0 });

  // Writes the hero's copy and both lists on the sky's ruled lines: every row is one line tall
  // (`--pitch`), and each list is padded down so its rows' feet sit on lines.
  // The lines are NOTE_PITCH apart from half a pitch below the sky's top;
  // measured against the sky's layer, which the parallax moves on its own,
  // and refitted on resize.
  const list$ = useRef<HTMLDivElement>(null);
  const hints$ = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hero = list$.current!.closest("section")!;
    const sky = hero.querySelector<HTMLElement>("[data-depth='0.35']") ?? hero;
    const fit = () => {
      const pitch = NOTE_PITCH;
      const line = sky.getBoundingClientRect().top + pitch / 2; // any line, in viewport px
      const down = (y: number) => (((line - y) % pitch) + pitch) % pitch; // to the next line at or below y

      // The hero's copy, top down (each shift moves what follows): text gets a
      // line height of whole pitches and is nudged so its baselines sit just
      // on lines; the store button and the rating row rest their feet on one.
      const copy = hero.querySelector<HTMLElement>("[data-depth='-0.2']");
      const [h1, sub, cta, rating] = copy ? (Array.from(copy.children) as HTMLElement[]) : [];
      for (const el of [h1, sub, cta, rating]) if (el) el.style.cssText = el.style.cssText.replace(/(margin-top|line-height|height|align-items|padding-bottom):[^;]*;?/g, "");
      for (const el of [h1, sub]) {
        if (!el) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        let k = Math.max(1, Math.round((fs * 1.15) / pitch));
        if (k * pitch < fs * 0.95) k++;
        el.style.lineHeight = `${k * pitch}px`;
        const probe = Object.assign(document.createElement("span"), { style: "display:inline-block;width:0;height:0;vertical-align:baseline" });
        (el.firstElementChild ?? el).prepend(probe);
        const baseline = probe.getBoundingClientRect().top;
        probe.remove();
        el.style.marginTop = `${parseFloat(getComputedStyle(el).marginTop) + down(baseline + 4)}px`;
      }
      if (rating) Object.assign(rating.style, { height: `${pitch}px`, alignItems: "flex-end", paddingBottom: "4px" });
      for (const el of [cta, rating]) if (el) el.style.marginTop = `${parseFloat(getComputedStyle(el).marginTop) + down(el.getBoundingClientRect().bottom)}px`;

      for (const el of [list$.current, hints$.current]) {
        if (!el) continue;
        el.style.setProperty("--pitch", `${pitch}px`);
        const top = el.getBoundingClientRect().top;
        // Padding, not a transform, so what follows the list moves down with it.
        el.style.paddingTop = `${(((line - top) % pitch) + pitch) % pitch}px`;
      }
    };
    fit();
    // Refit on width changes only: the padding itself changes the hero's height
    // (it grows to fit), and refitting on that would chase its own tail.
    let width = hero.clientWidth;
    const ro = new ResizeObserver(() => {
      if (hero.clientWidth === width) return;
      width = hero.clientWidth;
      fit();
    });
    ro.observe(hero);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative mx-auto mt-5 mb-[150px] w-full max-w-[1200px] px-4 tablet:mt-8 desktop-sm:min-h-[350px] short:mt-4" style={{ color: INK }}>
      <style>{`@keyframes nt-land{0%{opacity:0;transform:translateY(-10px) scale(.95)}60%{opacity:1;transform:translateY(2px) scale(1.02)}100%{transform:none}}
@keyframes nt-mark{from{background-size:0% 100%}}
@keyframes nt-bar{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
@keyframes nt-ring{from{transform:scale(1);opacity:.5}to{transform:scale(1.9);opacity:0}}`}</style>

      {/* The voice command, centre. */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => !listening && play((at.cmd + 1) % COMMANDS.length)}
          aria-label={`Voice command. Try: ${COMMANDS[(at.cmd + 1) % COMMANDS.length].say}`}
          className="relative grid size-[68px] place-items-center tablet:size-[88px] rounded-full text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,0.45)] transition-transform duration-300 can-hover:hover:scale-105 active:scale-95"
          style={{ background: listening ? "var(--accent)" : "#1d1d1f" }}
        >
          {listening && !still && (
            <>
              <span className="absolute inset-0 rounded-full bg-[var(--accent)] animate-[nt-ring_1.6s_ease-out_infinite]" />
              <span className="absolute inset-0 rounded-full bg-[var(--accent)] animate-[nt-ring_1.6s_ease-out_.8s_infinite]" />
            </>
          )}
          {listening && !still && at.t > LISTEN / 2 ? (
            // Sound bars while it hears.
            <span aria-hidden className="relative flex h-8 items-center gap-[3px]">
              {[0.1, 0.35, 0, 0.25, 0.5].map((d, i) => (
                <span key={i} className="h-full w-[4px] origin-center rounded-full bg-white animate-[nt-bar_.7s_ease-in-out_infinite]" style={{ animationDelay: `${d}s` }} />
              ))}
            </span>
          ) : (
            <Mic aria-hidden className="relative size-7 tablet:size-9" strokeWidth={1.8} />
          )}
        </button>
        <p className="mt-3 text-[13px] font-semibold tracking-wide uppercase opacity-60">{listening ? "Listening…" : "Tap and speak"}</p>

        {/* What it heard, as it hears it. */}
        <p className="mt-3 min-h-[2.4em] max-w-[min(400px,100%)] text-center text-[clamp(20px,2.2vw,26px)] text-balance leading-tight font-semibold">
          {heard ? (
            <>
              &ldquo;{heard}
              {listening && <span className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.1em] animate-pulse bg-current" />}
              {!listening && "”"}
            </>
          ) : (
            <span className="opacity-30">&ldquo;Say a task…&rdquo;</span>
          )}
        </p>

        {/* What it did. */}
        <p
          role="status"
          className={`mt-3 flex items-center gap-2 rounded-full bg-[#1d1d1f] px-4 py-2 text-[13px] font-medium text-white shadow-lg transition-[opacity,transform] duration-300 ${showResult ? "opacity-100" : "translate-y-1 opacity-0"}`}
        >
          <span className="grid size-4 place-items-center rounded-full bg-[#3ddc84]">
            <Check aria-hidden className="size-3 text-[#1d1d1f]" strokeWidth={3} />
          </span>
          {c.result}
        </p>
      </div>

      {/* Today's list, written on the paper: left from desktop up, under the mic below that (latest three). */}
      <div ref={list$} className="mx-auto mt-6 w-[min(320px,100%)] desktop-sm:absolute desktop-sm:top-2 desktop-sm:right-[calc(50%+230px)] desktop-sm:mt-0 desktop-sm:w-[300px]">
        <p className="flex h-[var(--pitch,40px)] items-end gap-1.5 pb-[4px] text-[22px] leading-none font-bold">
          Today <span className="text-[14px] font-medium opacity-50">· {list.filter((i) => !i.done).length} to do</span>
        </p>
        <ul>
          {list.map((it, i) => (
            <li
              key={it.text}
              className={`h-[var(--pitch,40px)] items-end gap-3 pb-[4px] text-[17px] leading-none ${i < list.length - 3 ? "hidden desktop-sm:flex" : "flex"}`}
              style={it.text === fresh && c.add && !still ? { animation: "nt-land .55s cubic-bezier(0.34,1.56,0.64,1) both" } : undefined}
            >
              <span
                className={`grid size-[18px] shrink-0 place-items-center rounded-[5px] border-2 transition-colors duration-300 ${it.done ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-current opacity-60"}`}
              >
                {it.done && <Check aria-hidden className="size-3" strokeWidth={3.5} />}
              </span>
              <span className={`relative min-w-0 truncate transition-opacity duration-500 ${it.done ? "opacity-45" : ""}`}>
                <span
                  // A highlighter swipe on what was just added.
                  className="bg-[linear-gradient(transparent_55%,rgba(255,214,90,.65)_55%)] bg-no-repeat"
                  style={{
                    backgroundSize: it.text === fresh && c.add ? "100% 100%" : "0% 100%",
                    animation: it.text === fresh && c.add && !still ? "nt-mark .6s .35s ease-out both" : undefined,
                  }}
                >
                  {it.text}
                </span>
                {/* The strike-through, drawn across when it's done. */}
                <span
                  aria-hidden
                  className="absolute top-1/2 left-0 h-[2px] w-full origin-left bg-current transition-transform duration-500"
                  style={{ transform: `scaleX(${it.done ? 1 : 0})` }}
                />
              </span>
              {it.meta && <span className="ml-auto shrink-0 rounded-full bg-[var(--accent)]/12 px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">{it.meta}</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* On phones and tablets: the commands as chips to tap, scrolling sideways. */}
      <p className="mt-6 text-center text-[12px] font-semibold tracking-wide uppercase opacity-60 desktop-sm:hidden">Try saying</p>
      <div className="-mx-4 mt-2 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] tablet:flex-wrap tablet:justify-center desktop-sm:hidden">
        {COMMANDS.map((k, i) => (
          <button
            key={k.say}
            type="button"
            onClick={() => play(i)}
            aria-label={`Play the command: ${k.say}`}
            className={`flex shrink-0 snap-start items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium ring-1 transition-colors duration-300 ${
              i === at.cmd ? "bg-[#23305a] text-white ring-[#23305a]" : "bg-white/70 ring-black/10"
            }`}
          >
            <Mic aria-hidden className="size-3.5" strokeWidth={2.2} />
            &ldquo;{k.say}&rdquo;
          </button>
        ))}
      </div>

      {/* The commands it knows, the one playing lit; each plays when pressed. Desktop up. */}
      <div ref={hints$} className="absolute top-2 left-[calc(50%+230px)] hidden w-[300px] desktop-sm:block">
        <p className="flex h-[var(--pitch,40px)] items-end pb-[4px] text-[22px] leading-none font-bold">Try saying</p>
        <ul>
          {COMMANDS.map((k, i) => (
            <li key={k.say}>
              <button
                type="button"
                onClick={() => play(i)}
                aria-label={`Play the command: ${k.say}`}
                className={`flex h-[var(--pitch,40px)] w-full items-end gap-2.5 pb-[4px] text-left text-[16px] leading-none transition-[opacity,transform] duration-300 can-hover:hover:opacity-100 ${i === at.cmd ? "translate-x-1 font-semibold opacity-100" : "opacity-50"}`}
              >
                <Mic aria-hidden className={`size-4 shrink-0 ${i === at.cmd ? "text-[var(--accent)]" : ""}`} strokeWidth={2.2} />
                &ldquo;{k.say}&rdquo;
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
