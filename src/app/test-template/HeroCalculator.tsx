"use client";

import { useEffect, useState } from "react";
import { Hint } from "./Hint";

/*
 * The app's own calculator, as on its store screenshot: you type a whole
 * expression and the answer shows under it as you go. Precedence and
 * brackets are honoured, and a % after + or − is a share of what comes
 * before it, so 14552 − 25% is 10,914; anywhere else it is /100.
 */

const OPS = "+−×÷";
type Factor = { v: number; pct: boolean };

/** The expression's value as far as it is complete — trailing operators dropped, open brackets closed — or null. */
export function evaluate(expr: string): number | null {
  let e = expr.replace(/[+−×÷(]+$/, "");
  if (!e) return null;
  e += ")".repeat(Math.max(0, (e.match(/\(/g)?.length ?? 0) - (e.match(/\)/g)?.length ?? 0)));
  let i = 0;
  const val = (f: Factor) => (f.pct ? f.v / 100 : f.v);

  const factor = (): Factor => {
    if (e[i] === "−") {
      i++;
      const f = factor();
      return { ...f, v: -f.v };
    }
    let v: number;
    if (e[i] === "(") {
      i++;
      v = add();
      if (e[i++] !== ")") throw 0;
    } else {
      const m = /^\d*\.?\d*/.exec(e.slice(i))![0];
      if (!m || m === ".") throw 0;
      i += m.length;
      v = Number(m);
    }
    const pct = e[i] === "%";
    if (pct) i++;
    return { v, pct };
  };
  const term = (): Factor => {
    const first = factor();
    if (e[i] !== "×" && e[i] !== "÷") return first;
    let v = val(first);
    while (e[i] === "×" || e[i] === "÷") {
      const op = e[i++];
      const f = val(factor());
      v = op === "×" ? v * f : v / f;
    }
    return { v, pct: false };
  };
  function add(): number {
    let acc = val(term());
    while (e[i] === "+" || e[i] === "−") {
      const op = e[i++];
      const t = term();
      const d = t.pct ? (acc * t.v) / 100 : t.v;
      acc = op === "+" ? acc + d : acc - d;
    }
    return acc;
  }

  try {
    const v = add();
    return i === e.length && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** A result as the expression it becomes after "=": 12 significant digits, our minus sign. */
const raw = (n: number) => String(Number(n.toPrecision(12))).replace("-", "−");

/** One key press: the next expression. `done` means the last key was "=", so a digit starts afresh. */
export function press(expr: string, key: string, done = false): string {
  const last = expr.at(-1) ?? "";
  const num = /[\d.]*$/.exec(expr)![0];
  const closes = /[\d.)%]/.test(last);
  if (key === "C") return "";
  if (key === "⌫") return expr.slice(0, -1);
  if (key === "=") {
    const v = evaluate(expr);
    return v === null ? expr : raw(v);
  }
  if (/\d/.test(key)) {
    if (done) return key;
    if (last === ")" || last === "%") return `${expr}×${key}`;
    if (num === "0") return expr.slice(0, -1) + key;
    return num.replace(".", "").length >= 15 ? expr : expr + key;
  }
  if (key === ".") {
    if (done) return "0.";
    if (num.includes(".")) return expr;
    if (last === ")" || last === "%") return `${expr}×0.`;
    return expr + (num ? "." : "0.");
  }
  if (key === "%") return /[\d)]/.test(last) ? expr + key : expr;
  if (key === "()") {
    const open = (expr.match(/\(/g)?.length ?? 0) - (expr.match(/\)/g)?.length ?? 0);
    if (open > 0 && closes) return `${expr})`;
    return closes ? `${expr}×(` : `${expr}(`;
  }
  if (OPS.includes(key)) {
    if (!expr || last === "(") return key === "−" ? expr + key : expr;
    if (OPS.includes(last)) return expr.length === 1 || expr.at(-2) === "(" ? expr : expr.slice(0, -1) + key;
    return expr + key;
  }
  return expr;
}

/** Thousands separators on every number in the expression, as the app shows it. */
const group = (expr: string) => expr.replace(/\d+/g, (d, at: number) => (expr[at - 1] === "." ? d : d.replace(/\B(?=(\d{3})+(?!\d))/g, ",")));

const fmt = (n: number) =>
  Math.abs(n) >= 1e15 ? n.toExponential(6) : Number(n.toPrecision(12)).toLocaleString("en-US", { maximumFractionDigits: 10 });

const KEYS = ["C", "()", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ".", "⌫", "="];
const KEYBOARD: Record<string, string> = {
  "/": "÷", "*": "×", x: "×", "-": "−", "(": "()", ")": "()", ",": ".",
  Enter: "=", Escape: "C", Delete: "C", Backspace: "⌫",
};

// The app's palette, from its store screenshot.
const KEY_STYLE: Record<string, string> = {
  digit: "bg-[#f1f1f1] text-[#4a4a4a] can-hover:hover:bg-[#e6e6e6]",
  red: "bg-[#fdeceb] text-[#e8453c] can-hover:hover:bg-[#fadcd9]",
  op: "bg-[#f3f6e8] text-[#8aac3c] can-hover:hover:bg-[#e8eed4]",
  eq: "bg-[#8aac3c] text-white can-hover:hover:bg-[#7c9c33]",
};
const kind = (k: string) => (k === "=" ? "eq" : k === "C" || k === "⌫" ? "red" : /[\d.]/.test(k) ? "digit" : "op");

/**
 * The calculator hero's centrepiece: the app's calculator screen, working.
 * Typed on with the mouse or the keyboard (digits, + - * / ( ) %, Enter,
 * Backspace, Esc) — keys are only taken when nothing else on the page has focus.
 */
export function HeroCalculator() {
  const [{ expr }, setS] = useState({ expr: "", done: false });
  const [lit, setLit] = useState("");
  const tap = (k: string) => setS((s) => ({ expr: press(s.expr, k, s.done), done: k === "=" }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.activeElement && document.activeElement !== document.body && !(e.target as HTMLElement).closest("[data-calc]")) return;
      const key = KEYBOARD[e.key] ?? e.key;
      if (!KEYS.includes(key)) return;
      e.preventDefault();
      setS((s) => ({ expr: press(s.expr, key, s.done), done: key === "=" }));
      setLit(key);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!lit) return;
    const t = setTimeout(() => setLit(""), 140);
    return () => clearTimeout(t);
  }, [lit, expr]);

  const shown = group(expr) || "0";
  const result = /[+−×÷%(]/.test(expr.slice(1)) ? evaluate(expr) : null;
  const size = shown.length <= 9 ? "text-[44px] short:text-[38px]" : shown.length <= 13 ? "text-[32px]" : "text-[24px]";

  return (
    <div
      data-calc
      // The bottom margin clears the hero's strip.
      className="relative mx-auto mt-12 mb-[150px] w-[min(340px,calc(100vw-32px))] roomy:w-[390px] rounded-[28px] bg-white px-4 pt-3 pb-4 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/5 short:mt-8"
    >
      <div className="flex items-center justify-between text-[#333]" aria-hidden>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="text-[14px]">Calculator Launcher</span>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6M3 4v4h4M12 8v4l3 2" />
        </svg>
      </div>

      <div className="flex h-[clamp(84px,11svh,120px)] flex-col items-end justify-end pb-2">
        <p className={`flex max-w-full items-center leading-none tracking-tight break-all text-[#4a4a4a] tabular-nums ${size}`}>
          {shown}
          <span aria-hidden className="ml-0.5 h-[0.9em] w-px animate-pulse bg-[#4a4a4a]" />
        </p>
        <p role="status" aria-live="polite" className="mt-2 h-6 text-[22px] leading-6 text-[#8aac3c] tabular-nums">
          {result !== null && fmt(result)}
        </p>
      </div>
      <div className="mb-3 h-px bg-[#e5e5e5]" />

      <div className="grid grid-cols-4 gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            aria-label={{ "⌫": "Delete", "()": "Brackets", C: "Clear" }[k]}
            onClick={() => tap(k)}
            className={`grid h-[clamp(34px,4.4svh,46px)] place-items-center rounded-[12px] text-[22px] transition-[background-color,transform] duration-150 active:scale-95 ${KEY_STYLE[kind(k)]} ${k === lit ? "scale-95 brightness-95" : ""}`}
          >
            {k === "⌫" ? (
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
                <path d="M9 5h11v14H9l-6-7 6-7ZM12 9.5l5 5M17 9.5l-5 5" />
              </svg>
            ) : k === "()" ? (
              "( )"
            ) : k === "." ? (
              "·"
            ) : (
              k
            )}
          </button>
        ))}
      </div>
      <Hint className="absolute top-full left-1/2 mt-3 -translate-x-1/2" />
    </div>
  );
}
