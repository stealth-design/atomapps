"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSun, MapPin, Snowflake, Sun, Umbrella, Zap } from "lucide-react";
import { useReducedMotion } from "./useReducedMotion";
import { PERIOD } from "./WeatherScene";

// The weathers, in RADAR_FRAG's order (see PERIOD).
const WEATHERS = [
  { Icon: Sun, label: "Sunny", temp: 26, hi: 28, lo: 17, note: "Clear skies all afternoon", NoteIcon: Sun, hours: [Sun, Sun, CloudSun, Sun, Sun, CloudSun] },
  { Icon: Cloud, label: "Cloudy", temp: 21, hi: 23, lo: 15, note: "Clouds thickening by 3 PM", NoteIcon: Cloud, hours: [Cloud, Cloud, CloudSun, Cloud, CloudDrizzle, CloudRain] },
  { Icon: CloudRain, label: "Light rain", temp: 18, hi: 21, lo: 12, note: "Rain easing off by 3 PM", NoteIcon: Umbrella, hours: [CloudRain, CloudRain, CloudDrizzle, Cloud, CloudSun, Sun] },
  { Icon: CloudLightning, label: "Thunderstorm", temp: 16, hi: 19, lo: 11, note: "Storm warning until 4 PM", NoteIcon: Zap, hours: [CloudLightning, CloudLightning, CloudRain, CloudRain, CloudDrizzle, Cloud] },
  { Icon: Snowflake, label: "Snow", temp: -2, hi: 0, lo: -6, note: "Snow settling, 4 cm by evening", NoteIcon: Snowflake, hours: [Snowflake, Snowflake, Snowflake, Cloud, Snowflake, Cloud] },
];
const AT = ["Now", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"];
const DRIFT = [0, 0, 1, 2, 2, 1]; // each hour's temperature against now's

/** The app's home-screen weather widget, cycling with the sky: the town under the map's centre, now, and the next few hours. */
export function HeroWeather() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const tick = () => setI(Math.floor(performance.now() / PERIOD + 0.2) % WEATHERS.length);
    tick();
    const id = window.setInterval(tick, 200);
    return () => clearInterval(id);
  }, [reduce]);
  const w = WEATHERS[reduce ? 0 : i];

  return (
    <div className="mx-auto mt-10 w-[min(440px,calc(100vw-32px))] roomy:w-[500px] rounded-[32px] bg-white/80 p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] ring-1 ring-black/5 backdrop-blur-xl tablet:p-6 short:mt-6">
      <style>{`@keyframes wx-in{from{opacity:0;transform:translateY(6px)}}`}</style>
      {/* Keyed on the weather, so each change fades its parts in afresh. */}
      <div key={w.label} className="motion-safe:[&_.wx]:animate-[wx-in_0.5s_ease-out_both]">
        <div className="flex items-start justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-[15px] font-semibold">
              <MapPin aria-hidden className="size-4" strokeWidth={2} />
              Detroit
            </p>
            <p className="wx mt-1 text-[64px] leading-none font-light tracking-tight tabular-nums">{w.temp}°</p>
          </div>
          <div className="text-right">
            <w.Icon aria-hidden className="wx ml-auto size-12 text-[var(--accent)]" strokeWidth={1.6} />
            <p className="wx mt-2 text-[15px] font-semibold">{w.label}</p>
            <p className="wx text-[13px] text-black/50 tabular-nums">
              H {w.hi}° · L {w.lo}°
            </p>
          </div>
        </div>
        <p className="wx mt-4 flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-3 py-1.5 text-[13px] font-medium text-[var(--accent)]">
          <w.NoteIcon aria-hidden className="size-4" strokeWidth={2} />
          {w.note}
          <span className="ml-auto size-2 animate-pulse rounded-full bg-[var(--accent)] motion-reduce:animate-none" />
        </p>
        <ul className="mt-4 grid grid-cols-6 gap-1 border-t border-black/5 pt-4 text-center">
          {w.hours.map((Icon, h) => (
            <li key={h} className="wx flex flex-col items-center gap-1.5" style={{ animationDelay: `${h * 40}ms` }}>
              <span className="text-[12px] text-black/50">{AT[h]}</span>
              <Icon aria-hidden className="size-5 text-[#1d1d1f]" strokeWidth={1.8} />
              <span className="text-[14px] font-semibold tabular-nums">{w.temp + DRIFT[h]}°</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

