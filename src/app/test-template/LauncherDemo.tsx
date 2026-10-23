"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import {
  AlarmClock, ArrowUpDown, BatteryFull, Bell, BellRing, BookOpen, BookOpenText, Calculator, CalendarClock, CalendarPlus, ChartLine,
  ClipboardCopy, Clover, CloudSun, Coins, Compass, Ear, FileText, Flame, Flashlight, Folder, Footprints, Globe, HandCoins, Headphones,
  Heart, History, House, ImagePlus, Landmark, Languages, Lightbulb, ListChecks, Lock, Mail, Mic, Newspaper, Orbit, Palette, PenLine,
  QrCode, Radar, Ruler, Scale, ScanBarcode, Search as SearchIcon, Share2, Siren, SlidersHorizontal, Smartphone, Sparkles, Target, Thermometer,
  ThumbsUp, Timer, TrendingUp, Trophy, Type, Vibrate, Volume2, Watch, ZoomIn, type LucideIcon,
} from "lucide-react";
import { ICON_RADIUS } from "@/components/folds/fold03/appIcons";

const WALLPAPERS = [
  "linear-gradient(160deg,#8ec5ff 0%,#7de0c4 55%,#cdeccf 100%)",
  "linear-gradient(160deg,#f6a5c0 0%,#c3a6ff 60%,#8ec5ff 100%)",
  "linear-gradient(160deg,#ffd27a 0%,#f6a5c0 55%,#c3a6ff 100%)",
  "linear-gradient(160deg,#1d2b64 0%,#3a6ea5 55%,#7de0c4 100%)",
];
// The home screen's other apps: plain tiles, so the app's own icon stands out.
const TILES = ["#ffffff59", "#ffffff40", "#ffffff4d", "#ffffff33", "#ffffff40", "#ffffff59", "#ffffff33"];

/** Steps through `n` states every `ms`, so a scene can play out in JS. */
function useTick(n: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((i) => (i + 1) % n), ms);
    return () => clearInterval(t);
  }, [n, ms]);
  return i;
}

type App = { name: string; icon: string; features: { title: string }[] };

// A Lucide icon for each listed feature, by the first pattern its title
// matches — so the more specific patterns come first ("Tip Calculator"
// before "Calculator", "Audio Bible" before "Bible").
const FEATURE_ICONS: [RegExp, LucideIcon][] = [
  [/clap|whistle/i, Ear], [/flash/i, Flashlight], [/magnif/i, ZoomIn], [/compass/i, Compass], [/sos/i, Siren], [/light/i, Lightbulb],
  [/tip/i, HandCoins], [/bmi/i, Scale], [/mortgage/i, House], [/loan/i, Landmark], [/interest/i, TrendingUp], [/unit/i, Ruler],
  [/currency/i, Coins], [/calculat/i, Calculator], [/qr/i, QrCode], [/barcode/i, ScanBarcode], [/history/i, History],
  [/clipboard|copy/i, ClipboardCopy], [/vibrat|beep/i, Vibrate], [/radar/i, Radar], [/forecast/i, CloudSun],
  [/temperature|air/i, Thermometer], [/news/i, Newspaper], [/alarm/i, AlarmClock], [/international|world/i, Globe],
  [/remind/i, Bell], [/duration|timer/i, Timer], [/stopwatch/i, Watch], [/voice|speech/i, Mic], [/image/i, ImagePlus],
  [/pdf|document/i, FileText], [/email/i, Mail], [/format/i, Type], [/grammar|writing|text/i, PenLine],
  [/translat|language/i, Languages], [/schedule/i, CalendarClock], [/event/i, CalendarPlus], [/horoscope|astrolog/i, Sparkles],
  [/birth chart/i, Orbit], [/lucky/i, Clover], [/love/i, Heart], [/checklist|create notes/i, ListChecks], [/color/i, Palette],
  [/lock/i, Lock], [/categor/i, Folder], [/sort/i, ArrowUpDown], [/share/i, Share2], [/audio/i, Headphones],
  [/study/i, BookOpenText], [/bible/i, BookOpen], [/step/i, Footprints], [/distance|calorie/i, Flame], [/goal/i, Target],
  [/insight/i, ChartLine], [/milestone/i, Trophy], [/multi alert/i, BellRing], [/customiz/i, SlidersHorizontal],
  [/battery/i, BatteryFull], [/easy/i, ThumbsUp], [/compatib/i, Smartphone], [/volume|sound/i, Volume2], [/find/i, SearchIcon],
];
const featureIcon = (title: string) => FEATURE_ICONS.find(([re]) => re.test(title))?.[1] ?? Sparkles;
type Props = { app: App; text: string };

/**
 * A coded phone acting out one launcher feature, picked by its title — every
 * app's launcher lists the same ones. Each scene loops; `key` on the scene
 * restarts it whenever the explorer opens another. `text` is the feature's
 * own copy. Under reduced motion the keyframed scenes show their finished state.
 */
export function LauncherDemo({ scene, text, app }: { scene: string } & Props) {
  const Scene = { "One-swipe access": Swipe, "Home screen widget": Widget, Wallpaper, "Home screen shortcut": Shortcut, "Multi-touchpoint search": Search }[scene];
  return (
    <div className="ld relative aspect-[9/19.5] w-[280px] translate-y-12 rounded-[44px] border-[8px] border-[#1d1d1f] bg-[#1d1d1f] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)] tablet:w-[320px]">
      <style>{`@keyframes ld-swipe{0%,8%{transform:translateX(0);opacity:0}12%{opacity:1}30%{transform:translateX(170px);opacity:0}to{transform:translateX(170px);opacity:0}}
@keyframes ld-panel{0%,18%{transform:translateX(-102%)}32%,86%{transform:translateX(0)}to{transform:translateX(-102%)}}
@keyframes ld-row{0%,30%{opacity:0;transform:translateY(8px)}40%,86%{opacity:1;transform:none}to{opacity:0}}
@keyframes ld-pop{0%{opacity:0;transform:scale(.85) translateY(10px)}to{opacity:1;transform:none}}
@keyframes ld-float{50%{transform:translateY(-4px)}}
@keyframes ld-drop{0%,10%{opacity:0;transform:translateY(-60px) scale(1.3)}28%,to{opacity:1;transform:none}}
@keyframes ld-tap{0%,38%{opacity:0;transform:scale(.4)}44%{opacity:1}56%,to{opacity:0;transform:scale(1.6)}}
@keyframes ld-open{0%,50%{opacity:0;clip-path:inset(18% 62% 70% 14% round 16px)}62%,88%{opacity:1;clip-path:inset(0 round 0)}to{opacity:0;clip-path:inset(0 round 0)}}
@media (prefers-reduced-motion:reduce){.ld *{animation:none!important}}`}</style>
      {/* The screen. clip-path, not just overflow-hidden: Chrome lets backdrop-filter layers escape a rounded overflow clip. */}
      <div className="absolute inset-0 overflow-hidden rounded-[36px] [clip-path:inset(0_round_36px)]">
        {Scene ? <Scene key={scene} app={app} text={text} /> : <Home app={app} />}
      </div>
    </div>
  );
}

function Icon({ app, className = "" }: { app: App; className?: string }) {
  return <Image src={app.icon} alt="" width={96} height={96} className={`aspect-square ${className}`} style={{ borderRadius: ICON_RADIUS }} />;
}

/** The home screen every scene starts from: status bar, a grid with the app in it, a search pill and a dock. */
function Home({ app, wallpaper = WALLPAPERS[0], hideIcon, children }: { app: App; wallpaper?: string; hideIcon?: boolean; children?: ReactNode }) {
  return (
    <div className="absolute inset-0 transition-[background] duration-700" style={{ background: wallpaper }}>
      <div className="flex justify-between px-6 pt-3 text-[11px] font-semibold text-white">
        <span>9:41</span>
        <span>●●● ▮</span>
      </div>
      <div className="absolute inset-x-5 top-[38%] grid grid-cols-4 gap-x-4 gap-y-5">
        <div className={hideIcon ? "invisible" : ""}>
          <Icon app={app} className="w-full" />
        </div>
        {TILES.map((c, i) => (
          <span key={i} className="aspect-square rounded-[14px]" style={{ background: c }} />
        ))}
      </div>
      <div className="absolute inset-x-5 bottom-[13%] flex h-9 items-center gap-2 rounded-full bg-white/85 px-3 text-[12px] text-black/45">
        <SearchGlyph />
        Search
      </div>
      <div className="absolute inset-x-3 bottom-3 grid grid-cols-4 gap-4 rounded-[24px] bg-white/25 p-3 backdrop-blur-md">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="aspect-square rounded-[14px] bg-white/60" />
        ))}
      </div>
      {children}
    </div>
  );
}

const SearchGlyph = () => (
  <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/** A finger swipes right across the home screen and the app's panel slides in, its features listed. */
function Swipe({ app }: Props) {
  const loop = "4.5s cubic-bezier(0.625,0.05,0,1) infinite";
  return (
    <Home app={app}>
      <span className="absolute top-[55%] left-6 size-10 rounded-full bg-white/80 shadow-lg ring-4 ring-white/40 opacity-0" style={{ animation: `ld-swipe ${loop}` }} />
      <div className="absolute inset-0 bg-white/95 px-5 pt-12 backdrop-blur-md" style={{ animation: `ld-panel ${loop}` }}>
        <div className="flex items-center gap-3">
          <Icon app={app} className="w-10" />
          <p className="text-[15px] leading-tight font-bold">{app.name}</p>
        </div>
        <ul className="mt-5 flex flex-col gap-2">
          {app.features.slice(0, 5).map(({ title }, i) => {
            const Glyph = featureIcon(title);
            return (
            <li
              key={title}
              className="flex items-center gap-3 rounded-2xl bg-[#f3f4f8] px-3 py-2.5 text-[13px] font-semibold"
              style={{ animation: `ld-row ${loop}`, animationDelay: `${i * 80}ms` }}
            >
              <Glyph aria-hidden className="size-[18px] shrink-0 text-[var(--accent)]" strokeWidth={2} />
              {title}
            </li>
            );
          })}
        </ul>
      </div>
    </Home>
  );
}

/** A clock-and-weather widget pops onto the home screen; the clock is live. */
function Widget({ app }: Props) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <Home app={app}>
      <div className="absolute inset-x-4 top-[9%] flex items-center justify-between rounded-[24px] bg-white/30 p-4 text-white backdrop-blur-md" style={{ animation: "ld-pop .7s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <div>
          <p className="text-[34px] leading-none font-light tabular-nums">{now?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, "") ?? "9:41"}</p>
          <p className="mt-1.5 text-[11px] font-medium opacity-85">{now?.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) ?? " "}</p>
        </div>
        <div className="text-right">
          <span className="block text-[30px] leading-none" style={{ animation: "ld-float 3s ease-in-out infinite" }}>⛅</span>
          <p className="mt-1 text-[13px] font-semibold">24°</p>
        </div>
      </div>
    </Home>
  );
}

/** The wallpaper cycles, the chosen one ringed in a strip of thumbnails. */
function Wallpaper({ app }: Props) {
  const i = useTick(WALLPAPERS.length, 1600);
  return (
    <Home app={app} wallpaper={WALLPAPERS[i]}>
      <div className="absolute inset-x-4 top-[12%] flex justify-center gap-2 rounded-[22px] bg-white/30 p-2.5 backdrop-blur-md">
        {WALLPAPERS.map((w, j) => (
          <span
            key={w}
            className={`aspect-[9/16] w-11 rounded-lg transition-[box-shadow,transform] duration-300 ${j === i ? "scale-105 shadow-[0_0_0_2px_#fff]" : ""}`}
            style={{ background: w }}
          />
        ))}
      </div>
    </Home>
  );
}

/** The app's shortcut drops into the home grid, is tapped, and opens to the app. */
function Shortcut({ app }: Props) {
  const loop = "4.5s ease-out infinite";
  return (
    <Home app={app} hideIcon>
      <div className="absolute inset-x-5 top-[38%] grid grid-cols-4 gap-x-4">
        <div className="relative">
          <span className="block" style={{ animation: `ld-drop ${loop}` }}>
            <Icon app={app} className="w-full" />
          </span>
          <span className="absolute inset-0 rounded-full bg-white/70 opacity-0" style={{ animation: `ld-tap ${loop}` }} />
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white opacity-0" style={{ animation: `ld-open ${loop}` }}>
        <Icon app={app} className="w-16" />
        <p className="text-[14px] font-bold">{app.name}</p>
      </div>
    </Home>
  );
}

/** The search pill types a query and splits into results: the app first, then web suggestions from each engine. */
function Search({ app, text }: Props) {
  const word = app.name.split(" ")[0].toLowerCase();
  const n = useTick(word.length + 8, 180); // typing, then a hold on the results
  const typed = word.slice(0, n);
  const done = n >= word.length;
  return (
    <Home app={app}>
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
      <div className="absolute inset-x-4 top-[10%]">
        <div className="flex h-10 items-center gap-2 rounded-full bg-white px-3.5 text-[13px] shadow-lg">
          <SearchGlyph />
          <span className="font-medium">{typed}</span>
          <span className="-ml-1.5 h-4 w-px animate-pulse bg-black/60" />
        </div>
        <div className={`mt-2 rounded-[22px] bg-white p-3 shadow-lg transition-[opacity,transform] duration-300 ${done ? "" : "translate-y-1 opacity-0"}`}>
          <p className="text-[10px] font-semibold tracking-wide text-black/40 uppercase">Apps</p>
          <div className="mt-2 flex items-center gap-2.5">
            <Icon app={app} className="w-9" />
            <span className="text-[13px] font-semibold">{app.name}</span>
          </div>
          <p className="mt-3 text-[10px] font-semibold tracking-wide text-black/40 uppercase">Web</p>
          <ul className="mt-1 divide-y divide-black/5 text-[13px]">
            {[`${word} launcher`, `${word} app tips`, `best ${word} app`].map((q) => (
              <li key={q} className="flex items-center gap-2 py-2">
                <SearchGlyph />
                {q}
              </li>
            ))}
          </ul>
          <div className="mt-1 flex gap-1.5">
            {["Google", "Yahoo!", "Brave"].filter((e) => text.includes(e.replace("!", ""))).map((e) => (
              <span key={e} className="rounded-full bg-[#f3f4f8] px-2.5 py-1 text-[10px] font-semibold">
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Home>
  );
}
