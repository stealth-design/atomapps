"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { APP_INDEX, appIconSrc } from "@/data/apps";
import { ICON_RADIUS } from "@/components/folds/fold03/appIcons";

/**
 * The rest of the family, at the foot of every app page. The same artwork as
 * Fold 03's grid, at the same corner radius, so it reads as the same set of
 * icons a reader came in through — just with names under them this time.
 *
 * Built from `APP_INDEX`, so the two unreleased apps are in it too, marked as
 * such rather than left out: they have pages of their own, and a grid missing
 * two of the icons the reader just came from would read as a gap.
 *
 * A native scroll-snap row (as in Fold 06) rather than a carousel library; the
 * arrows just scroll it by most of a viewport-width of icons.
 */
export function MoreApps({ currentSlug }: { currentSlug: string }) {
  const others = APP_INDEX.filter((app) => app.slug !== currentSlug);
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section aria-labelledby="more-apps-heading">
      <div className="flex items-center justify-between gap-4">
        <h2
          id="more-apps-heading"
          className="text-[24px] leading-[30px] font-normal text-[var(--foreground)] tablet:text-[30px] tablet:leading-[38px]"
        >
          More from Atom Apps
        </h2>
        <div className="flex gap-[10px]">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scroll(dir)}
              aria-label={dir < 0 ? "Previous apps" : "Next apps"}
              className="flex size-[40px] items-center justify-center rounded-full border border-[#d9d9de] text-[var(--foreground)] transition-colors duration-300 can-hover:hover:bg-[#111116] can-hover:hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none" className={dir < 0 ? "rotate-180" : ""}>
                <path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={track}
        className="mt-[20px] flex snap-x snap-mandatory gap-[16px] overflow-x-auto py-[8px] [scrollbar-width:none] tablet:mt-[28px] tablet:gap-[24px] [&::-webkit-scrollbar]:hidden"
      >
        {/* App Store-style cards: the place in the row, the icon, the name
            with "Launcher" set under it as the subtitle, and a View pill. */}
        {others.map((app, i) => (
          <li key={app.slug} className="w-[220px] shrink-0 snap-start tablet:w-[240px]">
            <Link
              href={`/apps/${app.slug}`}
              className="group/app relative flex h-[250px] flex-col items-center rounded-[28px] bg-[#eef0f8] px-5 pt-9 pb-6 text-center transition-colors duration-300 can-hover:hover:bg-[#e4e7f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              <span className="absolute top-4 left-5 text-[18px] leading-none font-semibold text-black/30 tabular-nums">{i + 1}</span>
              <span
                className="block size-[80px] shrink-0 overflow-hidden shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:group-hover/app:scale-[1.06] motion-reduce:transition-none"
                style={{ borderRadius: ICON_RADIUS }}
              >
                <Image src={appIconSrc(app)} alt="" width={279} height={280} sizes="80px" className="aspect-square w-full object-cover" />
              </span>
              <span className="mt-4 text-[16px] leading-[21px] font-semibold text-[var(--foreground)]">
                {app.title.replace(/ Launcher$/, "")}
              </span>
              <span className="mt-1 text-[13px] leading-[18px] text-[#61616a]">
                Launcher{app.comingSoon && " · Coming soon"}
              </span>
              <span className="mt-auto rounded-full bg-white px-4 py-1.5 text-[13px] leading-none font-semibold text-[var(--accent,#3455fd)]">
                View
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
