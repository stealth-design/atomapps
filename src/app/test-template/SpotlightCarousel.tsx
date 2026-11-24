"use client";

import { useState } from "react";

const EVERY = 5500; // ms each USP shows before the next

/**
 * The dark spotlight card as a carousel of the app's USPs: it moves on to the
 * next every EVERY ms, the headline and text rising in word by word, with a
 * dot per USP and arrows either side. The current dot's fill is the timer:
 * the next USP shows when it ends, so holding it (pointer over the card, or
 * a control focused) holds the carousel, and under reduced motion, where it
 * doesn't run, nothing moves on by itself.
 */
export function SpotlightCarousel({ items, h2 }: { items: { title: string; text: string }[]; h2: string }) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const n = items.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);

  const { title, text } = items[i];
  const words = (s: string, from: number, step: number) =>
    s.split(" ").map((w, k) => (
      <span key={k} className="inline-block motion-safe:animate-[sp-word_0.6s_cubic-bezier(.2,.7,.2,1)_both]" style={{ animationDelay: `${from + k * step}ms` }}>
        {w}&nbsp;
      </span>
    ));

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Why people use it"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="relative mx-auto flex h-[440px] max-w-[1100px] flex-col items-center overflow-hidden rounded-[28px] bg-[#1f2026] pt-8 text-center text-white"
    >
      {/* The ground: soft green glows in the lower corners and a deep green wash up the sides, on one heavily
          blurred layer, so they melt into the charcoal with no seams. Bleeds past the card; the card clips it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[15%] blur-[70px] bg-[radial-gradient(35%_45%_at_12%_95%,#2f8a63,transparent),radial-gradient(35%_45%_at_88%_95%,#2f8a63,transparent),radial-gradient(30%_70%_at_0%_40%,#1f3b33,transparent),radial-gradient(30%_70%_at_100%_40%,#1f3b33,transparent)]"
      />
      <style>{`@keyframes sp-word{from{opacity:0;transform:translateY(.5em);filter:blur(6px)}}@keyframes sp-fill{from{transform:scaleX(0)}}`}</style>

      {/* Keyed on the USP, so each one reveals afresh. */}
      {/* The count sits top centre; the slide below it is centred in the space above the controls. */}
      <p key={`n${i}`} className="relative text-[13px] font-medium tracking-[0.12em] text-white/45 uppercase tabular-nums motion-safe:animate-[sp-word_0.5s_ease-out_both]">
        {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
      </p>
      <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`} className="relative my-auto px-6">
        {/* One line from desktop up; the text below keeps its measure. */}
        <h2 className={`${h2} desktop-sm:whitespace-nowrap`}>{words(title, 80, 70)}</h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-white/60">{words(text, 300 + title.split(" ").length * 40, 18)}</p>
      </div>

      {n > 1 && (
        <div className="relative mb-8 flex items-center gap-4">
          <button type="button" aria-label="Previous" onClick={() => go(-1)} className="grid size-10 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur transition-colors can-hover:hover:bg-white/20">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {items.map((u, k) => (
              <button
                key={u.title}
                type="button"
                aria-label={`Show ${k + 1}: ${u.title}`}
                aria-current={k === i}
                onClick={() => setI(k)}
                className={`relative h-2 overflow-hidden rounded-full bg-white/25 transition-[width] duration-300 ${k === i ? "w-8" : "w-2 can-hover:hover:bg-white/45"}`}
              >
                {k === i && (
                  <span
                    // The timer: fills over the USP's turn, paused while held; its end moves on.
                    key={i}
                    onAnimationEnd={() => go(1)}
                    className="absolute inset-0 origin-left bg-white motion-safe:animate-[sp-fill_linear_both]"
                    style={{ animationDuration: `${EVERY}ms`, animationPlayState: held ? "paused" : "running" }}
                  />
                )}
              </button>
            ))}
          </div>
          <button type="button" aria-label="Next" onClick={() => go(1)} className="grid size-10 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur transition-colors can-hover:hover:bg-white/20">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
