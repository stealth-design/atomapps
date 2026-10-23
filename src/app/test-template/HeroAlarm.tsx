"use client";

import { useEffect, useState } from "react";
import { AlarmClock, Hourglass } from "lucide-react";
import { ACTION_MS, PhoneModel, type PhoneAction } from "./PhoneModel";
import { Hint } from "./Hint";

const W = 630; // the screen canvas, 9:20 like the phone's display
const H = 1400;
const TIMER_S = 10;
const ALARMS = [
  { time: "07:00", label: "Wake up", on: true },
  { time: "07:30", label: "Gym", on: false },
  { time: "08:15", label: "Leave for work", on: true },
  { time: "22:30", label: "Bedtime", on: false },
];

type Mode = "list" | "timer" | "ring";

/** The phone's screen for each mode, drawn live: the alarms list, the timer's countdown, or the ringing alarm. */
function drawScreen(ctx: CanvasRenderingContext2D, mode: Mode, left: number, note: string, accent: string) {
  ctx.fillStyle = "#0e1214";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("9:41", 64, 90); // left of the punch-hole camera
  ctx.textAlign = "center";

  if (mode === "ring") {
    const [time, label] = note.split(" · ");
    ctx.font = "300 170px system-ui, sans-serif";
    ctx.fillText(time, W / 2, 560);
    ctx.font = "600 52px system-ui, sans-serif";
    ctx.fillText(label, W / 2, 660);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(W / 2, 1060, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "600 38px system-ui, sans-serif";
    ctx.fillText("Stop", W / 2, 1073);
    return;
  }

  if (mode === "timer") {
    ctx.textAlign = "left";
    ctx.font = "700 60px system-ui, sans-serif";
    ctx.fillText("Timer", 60, 240);
    // A ring that empties as the time runs down.
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.arc(W / 2, 680, 220, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.arc(W / 2, 680, 220, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * left) / TIMER_S);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = "300 120px system-ui, sans-serif";
    ctx.fillText(`00:${String(left).padStart(2, "0")}`, W / 2, 720);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "500 36px system-ui, sans-serif";
    ctx.fillText("Cancel", W / 2, 1120);
    return;
  }

  ctx.textAlign = "left";
  ctx.font = "700 60px system-ui, sans-serif";
  ctx.fillText("Alarms", 60, 240);
  ALARMS.forEach(({ time, label, on }, i) => {
    const y = 330 + i * 230;
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.beginPath();
    ctx.roundRect(40, y, W - 80, 200, 44);
    ctx.fill();
    ctx.fillStyle = on ? "#fff" : "rgba(255,255,255,0.4)";
    ctx.font = "300 84px system-ui, sans-serif";
    ctx.fillText(time, 80, y + 110);
    ctx.font = "500 32px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(label, 84, y + 160);
    // The on/off switch.
    ctx.fillStyle = on ? accent : "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.roundRect(W - 200, y + 70, 110, 60, 30);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(on ? W - 120 : W - 170, y + 100, 24, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * The alarm clock hero. At rest the phone shows the alarms list. Ring alarm
 * turns it round to buzz and flash, as `ring` does, under "07:00 · Wake up".
 * Timer counts ten seconds down on its screen, then rings ("Timer · Time's
 * up"); pressing it again cancels. Under reduced motion the phone doesn't
 * turn, so the ringing screen shows instead.
 */
export function HeroAlarm({ className, accent }: { className?: string; accent: string }) {
  const [mode, setMode] = useState<Mode>("list");
  const [left, setLeft] = useState(TIMER_S);
  const [note, setNote] = useState("");
  const [action, setAction] = useState<PhoneAction>();
  const [live] = useState(() => (typeof document === "undefined" ? undefined : Object.assign(document.createElement("canvas"), { width: W, height: H })));

  const ring = (text: string, at: number) => {
    setNote(text);
    setMode("ring");
    setAction({ at, does: "ring" });
  };

  useEffect(() => {
    if (live) drawScreen(live.getContext("2d")!, mode, left, note, accent);
  }, [live, mode, left, note, accent]);

  // A ring lasts as long as the phone's ring action, then the list is back.
  useEffect(() => {
    if (mode !== "ring") return;
    const t = setTimeout(() => {
      setMode("list");
      setAction(undefined);
    }, ACTION_MS);
    return () => clearTimeout(t);
  }, [mode, action]);

  // The countdown: a second at a time, ringing at zero.
  useEffect(() => {
    if (mode !== "timer") return;
    const t = setTimeout(() => (left > 1 ? setLeft(left - 1) : ring("Timer · Time's up", performance.now())), 1000);
    return () => clearTimeout(t);
  }, [mode, left]);

  const buttons = [
    { label: "Ring alarm", Icon: AlarmClock, on: mode === "ring" && note.startsWith("07:00"), press: (at: number) => ring("07:00 · Wake up", at) },
    {
      label: mode === "timer" ? "Cancel timer" : "Timer",
      Icon: Hourglass,
      on: mode === "timer",
      press: (at: number) => {
        if (mode === "timer") {
          setMode("list");
          setAction(undefined);
          return;
        }
        setLeft(TIMER_S);
        setMode("timer");
        setAction({ at, does: "front", hold: true });
      },
    },
  ];

  return (
    <div className="relative">
      {/* Reduced motion only: a steady glow behind the phone in place of the flash. */}
      {mode === "ring" && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-[6%] left-1/2 hidden size-[min(80vw,48vh)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(255,244,214,0.55)_32%,transparent_70%)] motion-reduce:block"
        />
      )}

      <PhoneModel live={live} liveKey={`${mode}${left}${note}${accent}`} action={action} className={className} />

      {mode !== "list" && (
        <p
          role="status"
          className="absolute top-1/2 left-1/2 z-20 flex w-max -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-[13px] font-medium text-white shadow-lg"
        >
          <span className="size-2 animate-pulse rounded-full bg-[#ff5a5a]" />
          {mode === "timer" ? `Timer · 00:${String(left).padStart(2, "0")}` : note}
        </p>
      )}

      {buttons.map(({ label, Icon, on, press }, i) => (
        <button
          key={i}
          type="button"
          aria-label={label}
          aria-pressed={on}
          onClick={() => press(performance.now())}
          className={`absolute top-[34%] z-10 flex items-center gap-2 rounded-full bg-white/75 p-3 text-[15px] font-semibold text-[var(--foreground)] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] ring-1 backdrop-blur-md transition-[transform,box-shadow] duration-300 can-hover:hover:scale-105 active:scale-95 tablet:px-5 ${i ? "left-[calc(50%+min(28vw,17vh))]" : "right-[calc(50%+min(28vw,17vh))]"} ${on ? "ring-2 ring-[var(--accent)]" : "ring-black/5"}`}
        >
          <Icon aria-hidden className="size-[22px]" strokeWidth={1.8} />
          <span className="hidden tablet:inline">{label}</span>
          <Hint />
        </button>
      ))}
    </div>
  );
}
