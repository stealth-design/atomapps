"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * A tuning panel for the hero copy's white glow (GLOW in AppTemplate), shown only
 * with `?glow` in the URL. Each slider sets a CSS variable on <html> that GLOW
 * reads, so changes show live; "Copy values" puts them on the clipboard.
 */
const CONTROLS = [
  { k: "--g0", label: "Centre opacity", min: 0, max: 1, step: 0.05, v: 1, unit: "" },
  { k: "--g1", label: "Middle opacity", min: 0, max: 1, step: 0.05, v: 1, unit: "" },
  { k: "--g1p", label: "Middle stop", min: 0, max: 100, step: 1, v: 40, unit: "%" },
  { k: "--g2", label: "Outer opacity", min: 0, max: 1, step: 0.05, v: 0.45, unit: "" },
  { k: "--g2p", label: "Outer stop", min: 0, max: 100, step: 1, v: 70, unit: "%" },
  { k: "--gblur", label: "Blur", min: 0, max: 80, step: 1, v: 70, unit: "px" },
  { k: "--gscale", label: "Spread", min: 0.3, max: 2.5, step: 0.05, v: 1.5, unit: "" },
] as const;

export function GlowDebugger() {
  // Read on the client only (false on the server), so the panel never renders into the static HTML.
  const on = useSyncExternalStore(() => () => {}, () => new URLSearchParams(location.search).has("glow"), () => false);
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries(CONTROLS.map((c) => [c.k, c.v])));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!on) return;
    const root = document.documentElement;
    for (const c of CONTROLS) root.style.setProperty(c.k, `${vals[c.k]}${c.unit}`);
  }, [on, vals]);

  if (!on) return null;
  const text = CONTROLS.map((c) => `${c.label}: ${vals[c.k]}${c.unit}`).join("\n");

  return (
    <div className="fixed right-4 bottom-4 z-[100] w-[280px] rounded-2xl bg-black/85 p-4 text-[12px] text-white shadow-2xl backdrop-blur">
      <p className="mb-3 font-semibold">Hero glow</p>
      {CONTROLS.map((c) => (
        <label key={c.k} className="mb-2 block">
          <span className="flex justify-between text-white/70">
            {c.label}
            <span className="tabular-nums text-white">
              {vals[c.k]}
              {c.unit}
            </span>
          </span>
          <input
            type="range"
            min={c.min}
            max={c.max}
            step={c.step}
            value={vals[c.k]}
            onChange={(e) => setVals((v) => ({ ...v, [c.k]: Number(e.target.value) }))}
            className="w-full accent-white"
          />
        </label>
      ))}
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(text).then(() => (setCopied(true), setTimeout(() => setCopied(false), 1500)))}
        className="mt-2 w-full rounded-full bg-white py-2 font-semibold text-black"
      >
        {copied ? "Copied" : "Copy values"}
      </button>
    </div>
  );
}
