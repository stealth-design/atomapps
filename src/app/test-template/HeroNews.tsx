"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "./useReducedMotion";
import { CloudRain, MapPin } from "lucide-react";
import { FlatPhone } from "./FlatPhone";
import { HOURS } from "./WeatherScene";

// Made-up stories for the demo, one per category.
const STORIES = [
  {
    tag: "Local",
    title: "City council approves new protected bike lanes",
    ago: "2m",
  },
  {
    tag: "Business",
    title: "Markets edge higher as tech shares rebound",
    ago: "8m",
  },
  {
    tag: "Sports",
    title: "Underdogs win season opener in overtime",
    ago: "15m",
  },
  {
    tag: "Tech",
    title: "New phone chips promise two-day battery life",
    ago: "21m",
  },
  {
    tag: "Weather",
    title: "Weekend storms expected to clear by Monday",
    ago: "34m",
  },
];
const TABS = ["For you", "Business", "Sports", "Tech"];

// Made-up alerts that pop up round the phone and drop onto its screen.
const BREAKING = [
  { tag: "World", title: "Leaders reach late-night climate deal" },
  { tag: "Markets", title: "Stocks hit record high at the opening bell" },
  { tag: "Sports", title: "Last-second goal sends hosts into the final" },
  { tag: "Tech", title: "Major outage hits messaging apps worldwide" },
  { tag: "Weather", title: "Storm warning issued for the coast tonight" },
  { tag: "Science", title: "Probe sends first close-up images of comet" },
  { tag: "Local", title: "Downtown bridge reopens two weeks early" },
  { tag: "Business", title: "Airline orders 120 new long-haul jets" },
];
// Where alerts pop up round the phone (tablet up): side, then top as a share of the hero's demo area.
// Clear of the two buttons, which sit at 30%.
const SLOTS: ["l" | "r", string][] = [
  ["l", "4%"],
  ["r", "6%"],
  ["l", "50%"],
  ["r", "52%"],
  ["l", "72%"],
  ["r", "74%"],
];
const POP_EVERY = 1700; // ms between alerts popping up round the phone
const POP_LIFE = 4600; // ms each one stays, popping in and fading out
const BANNER_EVERY = 4400; // ms between alerts dropping onto the phone

type Pop = { id: number; slot: number; story: number };

/**
 * Breaking alerts, looping: one drops onto the phone's screen as a push
 * notification every BANNER_EVERY ms, and round the phone (tablet up) a new
 * alert card pops up every POP_EVERY ms in the next free slot, then fades.
 * All decorative (the feed carries the news), and none of it shows under
 * reduced motion.
 */
function useBreaking() {
  const reduce = useReducedMotion();
  const [pops, setPops] = useState<Pop[]>([]);
  const [banner, setBanner] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let id = 0;
    const timers = new Set<number>();
    const pop = () => {
      const n = id++;
      setPops((ps) => {
        const taken = new Set(ps.map((p) => p.slot));
        const slot = [...SLOTS.keys()]
          .map((k) => (n + k) % SLOTS.length)
          .find((k) => !taken.has(k));
        return slot === undefined
          ? ps
          : [...ps, { id: n, slot, story: n % BREAKING.length }];
      });
      const t = window.setTimeout(() => {
        setPops((ps) => ps.filter((p) => p.id !== n));
        timers.delete(t);
      }, POP_LIFE);
      timers.add(t);
    };
    const popper = window.setInterval(pop, POP_EVERY);
    const dropper = window.setInterval(
      () => setBanner((b) => b + 1),
      BANNER_EVERY,
    );
    pop();
    return () => {
      clearInterval(popper);
      clearInterval(dropper);
      timers.forEach(clearTimeout);
      setPops([]);
    };
  }, [reduce]);

  return { pops, banner, reduce };
}

/** The copy's ink, not its full-width box: the union of its text and the button, in viewport px. */
function copyBox(hero: HTMLElement) {
  const copy = hero.querySelector<HTMLElement>("[data-copy]");
  if (!copy) return null;
  let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
  const add = (x: DOMRect) => {
    if (!x.width) return;
    l = Math.min(l, x.left); t = Math.min(t, x.top); r = Math.max(r, x.right); b = Math.max(b, x.bottom);
  };
  const walk = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    range.selectNodeContents(n);
    add(range.getBoundingClientRect());
  }
  copy.querySelectorAll("a").forEach((a) => add(a.getBoundingClientRect()));
  return l === Infinity ? null : { left: l, top: t, right: r, bottom: b };
}

type Far = { id: number; x: number; y: number; depth: number; story: number };
const FAR_EVERY = 420; // ms between alerts popping up in the background
const FAR_LIFE = 5200;

/**
 * The background: breaking alerts popping up all over the hero, at three
 * depths (the far ones smaller, softer and fainter), each fading after
 * FAR_LIFE ms. Over the headline's column only far ones appear, so the copy
 * stays readable. Drawn into the hero itself (a portal), over its sky and
 * under its foot fade and copy. Decorative; nothing under reduced motion.
 */
function AlertField() {
  const reduce = useReducedMotion();
  const [hero, setHero] = useState<HTMLElement | null>(null);
  const [alerts, setAlerts] = useState<Far[]>([]);
  // Stable, so it runs once on mount rather than on every render.
  const anchor = useCallback(
    (el: HTMLSpanElement | null) => setHero(el?.closest("section") ?? null),
    [],
  );

  useEffect(() => {
    if (reduce || !hero) return;
    let id = 0;
    const timers = new Set<number>();
    const add = () => {
      // Only below the fixed header's current foot, so none pops up under it once the page has scrolled.
      const r = hero.getBoundingClientRect();
      const headerFoot = document.querySelector("header")?.getBoundingClientRect().bottom ?? 50;
      const top = Math.max(3, ((headerFoot + 16 - r.top) / r.height) * 100);
      if (top > 85) return; // the hero has all but scrolled away
      // Keep clear of the copy (headline to rating), with a margin: a few tries for a spot outside it.
      const c = copyBox(hero);
      let x = 0;
      let y = 0;
      for (let tries = 0; ; tries++) {
        if (tries === 8) return; // no free spot this tick
        x = 2 + Math.random() * 84;
        y = top + Math.random() * (85 - top);
        if (!c) break;
        const ax = r.left + (x / 100) * r.width;
        const ay = r.top + (y / 100) * r.height;
        // An alert is up to 260 x 70px from its top-left corner.
        const clear = ax > c.right + 24 || ax + 260 < c.left - 24 || ay > c.bottom + 24 || ay + 70 < c.top - 24;
        if (clear) break;
      }
      const n = id++;
      const middle = x > 26 && x < 62; // over the phone
      const a = {
        id: n,
        x,
        y,
        depth: middle ? 0 : Math.floor(Math.random() * 3),
        story: Math.floor(Math.random() * BREAKING.length),
      };
      setAlerts((as) => [...as, a]);
      const t = window.setTimeout(() => {
        setAlerts((as) => as.filter((v) => v.id !== n));
        timers.delete(t);
      }, FAR_LIFE);
      timers.add(t);
    };
    const tick = window.setInterval(() => !document.hidden && add(), FAR_EVERY);
    return () => {
      clearInterval(tick);
      timers.forEach(clearTimeout);
      setAlerts([]);
    };
  }, [reduce, hero]);

  return (
    <span ref={anchor} hidden>
      {hero &&
        createPortal(
          <div
            aria-hidden
            className="under-copy pointer-events-none absolute inset-0 z-[5] overflow-hidden"
          >
            {alerts.map(({ id, x, y, depth, story }) => {
              const s = BREAKING[story];
              return (
                <div
                  key={id}
                  className="absolute w-[260px] origin-top-left"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    scale: [0.6, 0.8, 1][depth],
                    opacity: [0.35, 0.6, 0.9][depth],
                    filter: depth ? undefined : "blur(1.5px)",
                  }}
                >
                  <div
                    className="flex gap-2.5 rounded-2xl bg-white/90 p-3 shadow-[0_14px_32px_-16px_rgba(0,0,0,0.3)] ring-1 ring-black/5 animate-[bn-pop_both]"
                    style={{ animationDuration: `${FAR_LIFE}ms` }}
                  >
                    <Bell />
                    <div className="min-w-0 text-left">
                      <p className="text-[10px] font-bold tracking-wide uppercase">
                        <span className="text-[#e5322d]">Breaking</span>{" "}
                        <span className="text-black/35">· {s.tag} · now</span>
                      </p>
                      <p className="mt-0.5 text-[13px] leading-snug font-semibold text-[var(--foreground)]">
                        {s.title}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>,
          hero,
        )}
    </span>
  );
}

function Bell() {
  return (
    <span className="relative grid size-7 shrink-0 place-items-center rounded-lg bg-[#e5322d] text-white">
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    </span>
  );
}

type Screen = "feed" | "top" | "weather";

function Feed() {
  return (
    <>
      <div className="flex gap-1.5 overflow-hidden">
        {TABS.map((t, i) => (
          <span
            key={t}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${i ? "bg-[#f3f4f8] text-black/55" : "bg-[var(--accent)] text-white"}`}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl bg-[#f6f6f8]">
        <div className="h-24 bg-[linear-gradient(135deg,var(--accent),#7b6fd6_60%,#f7931e)]" />
        <div className="p-3">
          <p className="text-[9px] font-bold tracking-wide text-[var(--accent)] uppercase">
            {STORIES[0].tag}
          </p>
          <p className="mt-0.5 text-[13px] leading-tight font-bold">
            {STORIES[0].title}
          </p>
        </div>
      </div>
      {STORIES.slice(1, 3).map(({ tag, title }, i) => (
        <div key={title} className="mt-2.5 flex gap-2.5">
          <span
            className={`size-12 shrink-0 rounded-xl ${i ? "bg-[linear-gradient(135deg,#1ec4c0,#2b6fc4)]" : "bg-[linear-gradient(135deg,#f7931e,#f26b1d)]"}`}
          />
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wide text-black/40 uppercase">
              {tag}
            </p>
            <p className="text-[12px] leading-tight font-semibold">{title}</p>
          </div>
        </div>
      ))}
    </>
  );
}

function Top() {
  return (
    <ol className="flex flex-col">
      {STORIES.map(({ tag, title, ago }, i) => (
        <li key={title} className="flex gap-3 border-b border-black/5 py-2.5">
          <span className="w-4 shrink-0 text-[18px] leading-none font-bold text-[var(--accent)] tabular-nums">
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-[12px] leading-tight font-semibold">{title}</p>
            <p className="mt-1 text-[10px] text-black/40">
              {tag} · {ago} ago
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Weather() {
  return (
    <div className="rounded-3xl bg-[linear-gradient(160deg,#4a7bd0,#2b4a9a)] p-4 text-white">
      <p className="flex items-center gap-1 text-[12px] font-semibold">
        <MapPin aria-hidden className="size-3.5" strokeWidth={2.2} />
        Detroit
      </p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-[46px] leading-none font-light">18°</p>
        <div className="text-right">
          <CloudRain aria-hidden className="ml-auto size-8" strokeWidth={1.6} />
          <p className="mt-1 text-[12px] font-semibold">Light rain</p>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-6 border-t border-white/20 pt-3 text-center">
        {HOURS.map(({ at, Icon, temp }) => (
          <li key={at} className="flex flex-col items-center gap-1">
            <span className="text-[9px] opacity-70">{at}</span>
            <Icon aria-hidden className="size-3.5" strokeWidth={1.8} />
            <span className="text-[11px] font-semibold">{temp}°</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TITLES: Record<Screen, string> = {
  feed: "Breaking News",
  top: "Top stories",
  weather: "Weather",
};

/**
 * The breaking news hero: a flat phone showing the news feed, with two
 * buttons beside it. Top stories swaps its screen for the headline list
 * ("Updated just now"), Weather for the forecast card; pressing either
 * again goes back to the feed.
 */
export function HeroNews() {
  // The side buttons that switched it to Top stories / Weather are gone; it shows the feed.
  const [screen] = useState<Screen>("feed");
  const { pops, banner, reduce } = useBreaking();
  const drop = BREAKING[(banner + 3) % BREAKING.length];

  return (
    <div className="relative mt-6 short:mt-3">
      <style>{`@keyframes tt-screen{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}
@keyframes bn-pop{0%{opacity:0;transform:translateY(12px) scale(.8)}9%{opacity:1;transform:translateY(-2px) scale(1.04)}14%{transform:none}86%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-10px) scale(.96)}}
@keyframes bn-drop{0%{transform:translateY(-130%)}10%,82%{transform:none}100%{transform:translateY(-130%)}}`}</style>

      <AlertField />
      {/* Alerts popping up round the phone. Decorative: the phone's banner carries the same news. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden tablet:block"
      >
        {pops.map(({ id, slot, story }) => {
          const [side, top] = SLOTS[slot];
          const s = BREAKING[story];
          return (
            <div
              key={id}
              className={`absolute w-[250px] ${side === "l" ? "right-[calc(50%+min(190px,42vw))]" : "left-[calc(50%+min(190px,42vw))]"}`}
              style={{ top }}
            >
              <div
                className="flex gap-2.5 rounded-2xl bg-white/90 p-3 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-md animate-[bn-pop_both]"
                style={{
                  animationDuration: `${POP_LIFE}ms`,
                  rotate: `${side === "l" ? -2 : 2}deg`,
                }}
              >
                <Bell />
                <div className="min-w-0 text-left">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase">
                    <span className="relative flex size-1.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-[#e5322d]" />
                      <span className="size-1.5 rounded-full bg-[#e5322d]" />
                    </span>
                    <span className="text-[#e5322d]">Breaking</span>
                    <span className="text-black/35">· {s.tag} · now</span>
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug font-semibold text-[var(--foreground)]">
                    {s.title}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <FlatPhone>
        {/* The push notification dropping in under the status bar, a new one each loop. */}
        {!reduce && (
          <div
            key={banner}
            aria-hidden
            className="absolute inset-x-2 top-8 z-10 flex gap-2 rounded-2xl bg-white/95 p-2.5 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.4)] ring-1 ring-black/5 backdrop-blur"
            style={{
              animation: `bn-drop ${BANNER_EVERY}ms cubic-bezier(.2,.8,.2,1) both`,
            }}
          >
            <Bell />
            <div className="min-w-0 text-left">
              <p className="text-[9px] font-bold tracking-wide uppercase">
                <span className="text-[#e5322d]">Breaking</span>{" "}
                <span className="text-black/35">· {drop.tag} · now</span>
              </p>
              <p className="text-[11px] leading-tight font-semibold">
                {drop.title}
              </p>
            </div>
          </div>
        )}
        <div
          key={screen}
          className="px-4 pt-5 motion-safe:animate-[tt-screen_.45s_cubic-bezier(0.22,1,0.36,1)_both]"
        >
          <p className="mb-3 text-[20px] leading-none font-bold">
            {TITLES[screen]}
          </p>
          {screen === "feed" ? (
            <Feed />
          ) : screen === "top" ? (
            <Top />
          ) : (
            <Weather />
          )}
        </div>
      </FlatPhone>

    </div>
  );
}
