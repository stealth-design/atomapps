"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import { Bell, MapPin } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "./useReducedMotion";

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

const CARD = "rounded-[24px] bg-white/90 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.4)] ring-1 ring-black/5 backdrop-blur-md";

/**
 * The calendar hero: four blocks that fly in from four sides on load — the
 * month grid from the left, today's date from the top, an event card from
 * the right and a reminder chip from below — then drift with the cursor at
 * different depths. Under reduced motion the blocks are simply there.
 */
export function HeroCalendar() {
  const todayString = useToday();
  const still = useReducedMotion();
  const scope = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ layout: LAYOUTS.wide, scale: 1 });
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

  // The blocks drift toward the cursor, each at its own depth.
  const drift = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", String(((e.clientX - r.left) / r.width - 0.5) * 2));
    e.currentTarget.style.setProperty("--my", String(((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  const depth = (px: number) => ({ transform: `translate(calc(var(--mx, 0) * ${px}px), calc(var(--my, 0) * ${px}px))` });

  const today = todayString ? new Date(todayString) : null;
  const year = today?.getFullYear() ?? 2026;
  const month = today?.getMonth() ?? 0;

  return (
    <div className="mx-auto mt-8 mb-[150px] w-[min(640px,calc(100vw-32px))] short:mt-4 roomy:w-[740px]" style={{ height: L.h * scale }}>
      <div
        ref={scope}
        onPointerMove={drift}
        onPointerLeave={(e) => (e.currentTarget.style.setProperty("--mx", "0"), e.currentTarget.style.setProperty("--my", "0"))}
        className="relative origin-top-left"
        style={{ width: L.w, height: L.h, transform: `scale(${scale})` }}
      >
        {today && (
          <>
            <div className="absolute" style={{ ...L.month, ...depth(6) }}>
              <div className={`piece month invisible p-5 ${CARD}`}>
                <p className="mb-3 text-[17px] font-bold">
                  {MONTHS[month]} <span className="font-normal text-black/40">{year}</span>
                </p>
                <MonthGrid year={year} month={month} today={today.getDate()} />
              </div>
            </div>
            <div className="absolute" style={{ ...L.today, ...depth(14) }}>
              <div className={`piece today invisible grid size-[136px] place-items-center text-center ${CARD}`}>
                <div>
                  <p className="text-[12px] font-semibold tracking-wide text-[var(--accent)] uppercase">{today.toLocaleDateString("en-US", { weekday: "long" })}</p>
                  <p className="text-[64px] leading-none font-bold tabular-nums">{today.getDate()}</p>
                  <p className="text-[12px] text-black/45">{MONTHS[month]}</p>
                </div>
              </div>
            </div>
            <div className="absolute" style={{ ...L.event, ...depth(18) }}>
              <div className={`piece event invisible p-4 ${CARD}`}>
                <p className="flex items-center gap-2 text-[15px] font-semibold">
                  <MapPin aria-hidden className="size-4 text-[var(--accent)]" strokeWidth={2.2} />
                  Team lunch
                </p>
                <p className="mt-1 pl-6 text-[13px] text-black/50">Fri · 1:00 PM</p>
                <div className="mt-3 h-1.5 rounded-full bg-[var(--accent)]/20">
                  <div className="h-full w-2/3 rounded-full bg-[var(--accent)]" />
                </div>
              </div>
            </div>
            <div className="absolute" style={{ ...L.reminder, ...depth(10) }}>
              <div className={`piece reminder invisible flex items-center gap-2 rounded-full bg-[#1d1d1f] py-2.5 pr-5 pl-3 text-[14px] font-semibold text-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]`}>
                <Bell aria-hidden className="size-4 text-[#ffd27a]" strokeWidth={2.2} />
                10:00 · Dentist
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
