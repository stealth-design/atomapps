"use client";

import { useEffect, useState } from "react";
import { ACTION_MS, PhoneModel, type PhoneAction } from "./PhoneModel";
import { AlarmWall } from "./AlarmWall";

const W = 630; // the screen canvas, 9:20 like the phone's display
const H = 1400;
const ALARMS = [
  { time: "07:00", label: "Wake up", on: true },
  { time: "07:30", label: "Gym", on: false },
  { time: "08:15", label: "Leave for work", on: true },
  { time: "22:30", label: "Bedtime", on: false },
];

type Mode = "list" | "ring";

/** The phone's screen, drawn live: the alarms list, or the ringing alarm. */
function drawScreen(ctx: CanvasRenderingContext2D, mode: Mode, note: string, accent: string) {
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
 * The alarm clock hero: the phone shows the alarms list, and when the
 * background's clock reaches 07:00 (AlarmWall) it turns round to buzz and
 * flash, as `ring` does, under "07:00 · Wake up". Under reduced motion the
 * phone doesn't turn and nothing rings.
 */
export function HeroAlarm({ className, accent }: { className?: string; accent: string }) {
  const [mode, setMode] = useState<Mode>("list");
  const [note, setNote] = useState("");
  const [action, setAction] = useState<PhoneAction>();
  const [live] = useState(() => (typeof document === "undefined" ? undefined : Object.assign(document.createElement("canvas"), { width: W, height: H })));

  const ring = (text: string, at: number) => {
    setNote(text);
    setMode("ring");
    setAction({ at, does: "ring" });
  };

  useEffect(() => {
    if (live) drawScreen(live.getContext("2d")!, mode, note, accent);
  }, [live, mode, note, accent]);

  // A ring lasts as long as the phone's ring action, then the list is back.
  useEffect(() => {
    if (mode !== "ring") return;
    const t = setTimeout(() => {
      setMode("list");
      setAction(undefined);
    }, ACTION_MS);
    return () => clearTimeout(t);
  }, [mode, action]);

  return (
    <div className="relative">
      {/* The night-to-morning loop behind it all; at 07:00 it rings the phone. */}
      <AlarmWall onAlarm={() => ring("07:00 · Wake up", performance.now())} />

      <PhoneModel live={live} liveKey={`${mode}${note}${accent}`} action={action} className={className} />

      {mode === "ring" && (
        <p
          role="status"
          className="absolute top-1/2 left-1/2 z-20 flex w-max -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-[13px] font-medium text-white shadow-lg"
        >
          <span className="size-2 animate-pulse rounded-full bg-[#ff5a5a]" />
          {note}
        </p>
      )}
    </div>
  );
}
