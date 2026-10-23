"use client";

import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { LauncherDemo } from "./LauncherDemo";

/** The site's ease, for every change here. */
const EASE = "ease-[cubic-bezier(0.625,0.05,0,1)]";

/**
 * The launcher's extras as an explorer, after Apple's product tours: a column
 * of pills, one open at a time into a bubble of its text, with up/down
 * arrows stepping through them, beside a coded phone acting out the open one
 * (see LauncherDemo).
 *
 * Every item is laid out at its open width all the time, so its text never
 * rewraps mid-animation. Closed, a clip-path trims it to its pill (`--pill`,
 * the measured width of its header); open, the clip widens to the full box
 * while the text's row grows from 0fr to 1fr — two CSS transitions on the
 * same curve, and the items below slide down with the height as it grows.
 */
export function LauncherExplorer({ items, app }: { items: { title: string; text: string }[]; app: ComponentProps<typeof LauncherDemo>["app"] }) {
  const [open, setOpen] = useState(0);
  const id = useId();
  const list = useRef<HTMLUListElement>(null);
  const select = (i: number) => setOpen(Math.max(0, Math.min(items.length - 1, i)));

  // Each pill's width, for its clip. Re-measured on resize (the column, and
  // so the type, can change) and once the web font has loaded.
  useEffect(() => {
    const ul = list.current!;
    const measure = () => {
      for (const li of ul.children as HTMLCollectionOf<HTMLElement>) {
        li.style.setProperty("--pill", `${li.querySelector("button")!.offsetWidth}px`);
      }
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(ul);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="mx-auto mt-12 grid max-w-[1100px] overflow-hidden rounded-[32px] bg-[#eef0f8] desktop-sm:min-h-[640px] desktop-sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex items-center gap-6 p-6 tablet:p-10 desktop-sm:py-14 desktop-sm:pr-0 desktop-sm:pl-8">
        <div className="hidden flex-col gap-4 tablet:flex">
          <Arrow label="Previous feature" disabled={open === 0} onClick={() => select(open - 1)} />
          <Arrow label="Next feature" down disabled={open === items.length - 1} onClick={() => select(open + 1)} />
        </div>

        <ul ref={list} className="flex w-full max-w-[440px] min-w-0 flex-col gap-3">
          {items.map(({ title, text }, i) => {
            const on = i === open;
            return (
              <li
                key={title}
                className={`bg-white transition-[clip-path] duration-[600ms] motion-reduce:transition-none ${EASE}`}
                style={{
                  clipPath: on ? "inset(0 0 0 0 round 28px)" : "inset(0 calc(100% - var(--pill, 100%)) 0 0 round 28px)",
                }}
              >
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`${id}-${i}`}
                  onClick={() => select(i)}
                  className={`flex w-max items-center gap-3 py-3 pr-6 pl-3.5 text-[16px] font-semibold text-[var(--foreground)] ${on ? "cursor-default" : ""}`}
                >
                  {/* + turns to × as it opens. */}
                  <svg
                    viewBox="0 0 24 24"
                    className={`size-6 shrink-0 transition-transform duration-[600ms] motion-reduce:transition-none ${EASE} ${on ? "rotate-45" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden
                  >
                    <circle cx="12" cy="12" r="10.5" />
                    <path d="M12 7.5v9M7.5 12h9" strokeLinecap="round" />
                  </svg>
                  {title}
                </button>
                <div
                  id={`${id}-${i}`}
                  className={`grid transition-[grid-template-rows] duration-[600ms] motion-reduce:transition-none ${EASE} ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p
                      className={`px-6 pb-6 text-[16px] leading-[1.5] text-black/70 transition-opacity motion-reduce:transition-none tablet:px-7 tablet:pb-7 ${
                        on ? "opacity-100 delay-200 duration-500" : "opacity-0 duration-200"
                      }`}
                    >
                      {text}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-end justify-center px-6 pt-4 desktop-sm:pt-14">
        <LauncherDemo scene={items[open].title} text={items[open].text} app={app} />
      </div>
    </div>
  );
}

function Arrow({ label, down, disabled, onClick }: { label: string; down?: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-10 place-items-center rounded-full bg-white text-[var(--foreground)] transition-[opacity,transform] duration-300 disabled:opacity-35 can-hover:enabled:hover:scale-105 ${EASE}`}
    >
      <svg viewBox="0 0 24 24" className={`size-5 ${down ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 15l6-6 6 6" />
      </svg>
    </button>
  );
}
