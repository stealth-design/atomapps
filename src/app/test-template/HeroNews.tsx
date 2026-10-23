"use client";

import { useState } from "react";
import { CloudRain, CloudSun, MapPin, Newspaper } from "lucide-react";
import { FlatPhone } from "./FlatPhone";
import { HOURS } from "./WeatherScene";
import { Hint } from "./Hint";

// Made-up stories for the demo, one per category.
const STORIES = [
  { tag: "Local", title: "City council approves new protected bike lanes", ago: "2m" },
  { tag: "Business", title: "Markets edge higher as tech shares rebound", ago: "8m" },
  { tag: "Sports", title: "Underdogs win season opener in overtime", ago: "15m" },
  { tag: "Tech", title: "New phone chips promise two-day battery life", ago: "21m" },
  { tag: "Weather", title: "Weekend storms expected to clear by Monday", ago: "34m" },
];
const TABS = ["For you", "Business", "Sports", "Tech"];

type Screen = "feed" | "top" | "weather";

function Feed() {
  return (
    <>
      <div className="flex gap-1.5 overflow-hidden">
        {TABS.map((t, i) => (
          <span key={t} className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${i ? "bg-[#f3f4f8] text-black/55" : "bg-[var(--accent)] text-white"}`}>
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl bg-[#f6f6f8]">
        <div className="h-24 bg-[linear-gradient(135deg,var(--accent),#7b6fd6_60%,#f7931e)]" />
        <div className="p-3">
          <p className="text-[9px] font-bold tracking-wide text-[var(--accent)] uppercase">{STORIES[0].tag}</p>
          <p className="mt-0.5 text-[13px] leading-tight font-bold">{STORIES[0].title}</p>
        </div>
      </div>
      {STORIES.slice(1, 3).map(({ tag, title }, i) => (
        <div key={title} className="mt-2.5 flex gap-2.5">
          <span className={`size-12 shrink-0 rounded-xl ${i ? "bg-[linear-gradient(135deg,#1ec4c0,#2b6fc4)]" : "bg-[linear-gradient(135deg,#f7931e,#f26b1d)]"}`} />
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wide text-black/40 uppercase">{tag}</p>
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
          <span className="w-4 shrink-0 text-[18px] leading-none font-bold text-[var(--accent)] tabular-nums">{i + 1}</span>
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

const TITLES: Record<Screen, string> = { feed: "Breaking News", top: "Top stories", weather: "Weather" };

/**
 * The breaking news hero: a flat phone showing the news feed, with two
 * buttons beside it. Top stories swaps its screen for the headline list
 * ("Updated just now"), Weather for the forecast card; pressing either
 * again goes back to the feed.
 */
export function HeroNews() {
  const [screen, setScreen] = useState<Screen>("feed");
  const buttons = [
    { id: "top" as const, label: "Top stories", Icon: Newspaper, note: "Updated just now" },
    { id: "weather" as const, label: "Weather", Icon: CloudSun, note: "Local forecast" },
  ];
  const note = buttons.find((b) => b.id === screen)?.note;

  return (
    <div className="relative mt-6 short:mt-3">
      <style>{`@keyframes tt-screen{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}`}</style>
      {note && (
        <p role="status" className="absolute -top-4 left-1/2 z-20 flex w-max -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-[13px] font-medium text-white shadow-lg">
          <span className="size-2 rounded-full bg-[#3ddc84]" />
          {note}
        </p>
      )}

      <FlatPhone>
        <div key={screen} className="px-4 pt-5 motion-safe:animate-[tt-screen_.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <p className="mb-3 text-[20px] leading-none font-bold">{TITLES[screen]}</p>
          {screen === "feed" ? <Feed /> : screen === "top" ? <Top /> : <Weather />}
        </div>
      </FlatPhone>

      {buttons.map(({ id, label, Icon }, i) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          aria-pressed={screen === id}
          onClick={() => setScreen(screen === id ? "feed" : id)}
          className={`absolute top-[30%] z-10 flex items-center gap-2 rounded-full bg-white/75 p-3 text-[15px] font-semibold text-[var(--foreground)] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] ring-1 backdrop-blur-md transition-transform duration-300 can-hover:hover:scale-105 active:scale-95 tablet:px-5 ${
            i ? "right-3 tablet:right-auto tablet:left-[calc(50%+min(160px,40vw))]" : "left-3 tablet:right-[calc(50%+min(160px,40vw))] tablet:left-auto"
          } ${screen === id ? "ring-2 ring-[var(--accent)]" : "ring-black/5"}`}
        >
          <Icon aria-hidden className="size-[22px]" strokeWidth={1.8} />
          <span className="hidden tablet:inline">{label}</span>
          <Hint />
        </button>
      ))}
    </div>
  );
}
