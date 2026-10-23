"use client";

import { useState, type ReactNode } from "react";

/**
 * An endless horizontal strip (the `tt-marquee` keyframes, defined by
 * AppTemplate) that pauses on hover. Moving content that runs past five
 * seconds needs a way to stop it (WCAG 2.2.2), so there is a pause button —
 * kept out of sight and only shown when the keyboard reaches it.
 * `children` are the <li>s, already doubled so -50% loops seamlessly.
 */
export function Marquee({
  label,
  duration,
  className = "",
  children,
}: {
  label: string;
  duration: number;
  className?: string;
  children: ReactNode;
}) {
  const [paused, setPaused] = useState(false);

  return (
    <div>
      <div className={className}>
        <ul
          aria-label={label}
          className="flex w-max animate-[tt-marquee_linear_infinite] can-hover:hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ animationDuration: `${duration}s`, ...(paused ? { animationPlayState: "paused" } : {}) }}
        >
          {children}
        </ul>
      </div>
      <div className="mx-auto flex max-w-[var(--content-max-width)] justify-end px-[var(--content-padding)] motion-reduce:hidden">
        <button
          type="button"
          aria-pressed={paused}
          aria-label={`${paused ? "Play" : "Pause"} ${label}`}
          onClick={() => setPaused((p) => !p)}
          className="sr-only grid size-9 place-items-center focus-visible:not-sr-only focus-visible:mt-4 rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] transition-colors can-hover:hover:bg-black/5"
        >
          <svg viewBox="0 0 12 12" className="size-3" fill="currentColor" aria-hidden>
            {paused ? <path d="M2.5 1.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L3.4.7a.6.6 0 0 0-.9.5Z" /> : <path d="M2 1h3v10H2zM7 1h3v10H7z" />}
          </svg>
        </button>
      </div>
    </div>
  );
}
