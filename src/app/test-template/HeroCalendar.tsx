"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import { Bell, MapPin } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "./useReducedMotion";
import { CalendarWeek } from "./CalendarWeek";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
// The composition's own sizes and where each block sits: side by side when
// there's room, stacked closer on phones. Either scales down to fit.
type Layout = { w: number; h: number } & Record<"month" | "today" | "event" | "reminder", CSSProperties>;
const LAYOUTS: Record<"wide" | "narrow", Layout> = {
  wide: {
    w: 640,
    h: 380,
    month: { top: 16, left: 170, width: 300 },
    today: { top: 8, left: 0 },
    event: { top: 150, right: 0, width: 200 },
    reminder: { bottom: 24, left: 24 },
  },
  // Today's tile sits over the month card's top-right corner, clear of its heading.
  narrow: {
    w: 380,
    h: 510,
    month: { top: 110, left: 40, width: 300 },
    today: { top: 0, right: 0 },
    event: { top: 370, right: 0, width: 200 },
    reminder: { top: 44, left: 0 },
  },
};

// Today, worked out in the browser so a statically built page still shows
// the real date. The date string is stable all day, as useSyncExternalStore
// needs; the server has none.
const noSubscribe = () => () => {};
const useToday = () => useSyncExternalStore(noSubscribe, () => new Date().toDateString(), () => null);

/** A month as a Monday-first grid: today ringed, a few days dotted with events. */
function MonthGrid({ year, month, today }: { year: number; month: number; today: number }) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const events = new Set([4, 11, 17, 23]);
  return (
    <div className="grid grid-cols-7 gap-y-1.5 text-center text-[13px] tabular-nums">
      {DAYS.map((d, i) => (
        <span key={i} className="font-semibold text-black/35">
          {d}
        </span>
      ))}
      {Array.from({ length: lead }, (_, i) => (
        <span key={`lead-${i}`} />
      ))}
      {Array.from({ length: days }, (_, i) => {
        const d = i + 1;
        return (
          <span key={d} className="relative mx-auto grid aspect-square w-full max-w-7 place-items-center">
            <span className={d === today ? "grid size-6 place-items-center rounded-full bg-[var(--accent)] font-semibold text-white" : "text-[#1d1d1f]"}>{d}</span>
            {events.has(d) && d !== today && <span className="absolute bottom-0 size-1 rounded-full bg-[var(--accent)]" />}
          </span>
        );
      })}
    </div>
  );
}

// The centre cards' loop: every STEP_MS the selection moves `add` days on from
// today, and the event card and reminder show that day's plans.
const STEP_MS = 3000;
const PLAN = [
  { add: 0, title: "Team lunch", time: "1:00 PM", reminder: "10:00 · Dentist", done: 0.66 },
  { add: 1, title: "Design review", time: "10:30 AM", reminder: "9:00 · Standup", done: 0.3 },
  { add: 3, title: "Gym session", time: "6:00 PM", reminder: "5:30 · Pack gym bag", done: 0.8 },
  { add: 5, title: "Brunch with family", time: "11:00 AM", reminder: "10:15 · Buy flowers", done: 0.5 },
  { add: 8, title: "Client call", time: "3:00 PM", reminder: "2:45 · Join the call", done: 0.15 },
  { add: 12, title: "Movie night", time: "7:30 PM", reminder: "7:00 · Book tickets", done: 0.9 },
];
// Keyed on the step, so each change fades in afresh.
const SWAP = "motion-safe:animate-[cal-in_0.45s_ease-out_both]";

const CARD = "rounded-[24px] bg-white/90 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.4)] ring-1 ring-black/5 backdrop-blur-md";

/**
 * The calendar hero: four blocks that fly in from four sides on load — the
 * month grid from the left, today's date from the top, an event card from
 * the right and a reminder chip from below and then stay put. Then they play on their own: every few seconds the
 * selected day moves on through the month (the date tile, the grid's
 * highlight) and the event card and reminder change to that day's plans.
 * Under reduced motion the blocks are simply there, on today.
 */
export function HeroCalendar() {
  const todayString = useToday();
  const still = useReducedMotion();
  const scope = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ layout: LAYOUTS.wide, scale: 1 });
  const [step, setStep] = useState(0);
  const { layout: L, scale } = fit;

  // The composition is laid out at its own size and scaled to the width it's given.
  useEffect(() => {
    const el = scope.current!.parentElement!;
    const ro = new ResizeObserver(([e]) => {
      const layout = e.contentRect.width < 520 ? LAYOUTS.narrow : LAYOUTS.wide;
      // The box is capped at the composition's width (more on roomy screens), so this only goes past 1 there.
      setFit({ layout, scale: e.contentRect.width / layout.w });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!todayString) return;
      const q = gsap.utils.selector(scope);
      if (still) {
        gsap.set(q(".piece"), { autoAlpha: 1 });
        return;
      }
      gsap
        .timeline({ delay: 0.2 })
        .fromTo(q(".month"), { x: -260, rotate: -8, autoAlpha: 0 }, { x: 0, rotate: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" })
        .fromTo(q(".today"), { y: -220, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "bounce.out" }, "<0.08")
        .fromTo(q(".event"), { x: 260, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, "<0.08")
        .fromTo(q(".reminder"), { y: 140, scale: 0.6, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.7, ease: "back.out(1.7)" }, "<0.08");
    },
    { scope, dependencies: [todayString, still] },
  );

  // The cards step through the plan on their own.
  useEffect(() => {
    if (still || !todayString) return;
    const id = setInterval(() => setStep((n) => (n + 1) % PLAN.length), STEP_MS);
    return () => clearInterval(id);
  }, [still, todayString]);

  const plan = PLAN[still ? 0 : step];
  const today = todayString ? new Date(todayString) : null;
  today?.setDate(today.getDate() + plan.add); // the selected day, from here on
  const year = today?.getFullYear() ?? 2026;
  const month = today?.getMonth() ?? 0;

  return (
    <div className="mx-auto mt-8 mb-[150px] w-[min(640px,calc(100vw-32px))] short:mt-4 roomy:w-[740px]" style={{ height: L.h * scale }}>
      <CalendarWeek />
      <style>{`@keyframes cal-in{from{opacity:0;transform:translateY(6px)}}`}</style>
      <div
        ref={scope}
        className="relative origin-top-left"
        style={{ width: L.w, height: L.h, transform: `scale(${scale})` }}
      >
        {today && (
          <>
            <div className="absolute" style={L.month}>
              <div className={`piece month invisible p-5 ${CARD}`}>
                <p key={month} className={`mb-3 text-[17px] font-bold ${SWAP}`}>
                  {MONTHS[month]} <span className="font-normal text-black/40">{year}</span>
                </p>
                <MonthGrid year={year} month={month} today={today.getDate()} />
              </div>
            </div>
            <div className="absolute" style={L.today}>
              <div className={`piece today invisible grid size-[136px] place-items-center text-center ${CARD}`}>
                <div key={step} className={SWAP}>
                  <p className="text-[12px] font-semibold tracking-wide text-[var(--accent)] uppercase">{today.toLocaleDateString("en-US", { weekday: "long" })}</p>
                  <p className="text-[64px] leading-none font-bold tabular-nums">{today.getDate()}</p>
                  <p className="text-[12px] text-black/45">{MONTHS[month]}</p>
                </div>
              </div>
            </div>
            <div className="absolute" style={L.event}>
              <div className={`piece event invisible p-4 ${CARD}`}>
                <div key={step} className={SWAP}>
                  <p className="flex items-center gap-2 text-[15px] font-semibold">
                    <MapPin aria-hidden className="size-4 shrink-0 text-[var(--accent)]" strokeWidth={2.2} />
                    {plan.title}
                  </p>
                  <p className="mt-1 pl-6 text-[13px] text-black/50">
                    {today.toLocaleDateString("en-US", { weekday: "short" })} · {plan.time}
                  </p>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-[var(--accent)]/20">
                  <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700 ease-out" style={{ width: `${plan.done * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="absolute" style={L.reminder}>
              <div className={`piece reminder invisible flex items-center gap-2 rounded-full bg-[#1d1d1f] py-2.5 pr-5 pl-3 text-[14px] font-semibold text-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]`}>
                <Bell aria-hidden className="size-4 text-[#ffd27a]" strokeWidth={2.2} />
                <span key={step} className={SWAP}>
                  {plan.reminder}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
