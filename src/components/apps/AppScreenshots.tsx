import Image from "next/image";
import type { AppPage } from "@/data/apps";

/**
 * The listing's screenshot strip: one row, scrolled sideways, every image at
 * the same height so the phone shots and the wide feature graphics some
 * listings lead with sit on one baseline.
 *
 * The row bleeds to the container's gutters on purpose — the last image is
 * cut at the edge, which is what tells a reader there is more to scroll to.
 * `scroll-px` keeps the first and last snap points inside the gutter, so the
 * strip never parks an image half under the page edge.
 */
export function AppScreenshots({ app }: { app: AppPage }) {
  if (app.screenshots.length === 0) return null;

  return (
    <ul
      aria-label={`${app.name} screenshots`}
      className="-mx-[var(--content-padding)] flex snap-x snap-mandatory gap-[12px] overflow-x-auto scroll-px-[var(--content-padding)] px-[var(--content-padding)] pb-[8px] tablet:gap-[16px] [scrollbar-width:thin]"
    >
      {app.screenshots.map((shot, index) => (
        <li
          key={shot.src}
          className="shrink-0 snap-start overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] tablet:rounded-[18px]"
          style={{ aspectRatio: `${shot.width} / ${shot.height}` }}
        >
          <Image
            src={shot.src}
            alt={`${app.name} screenshot ${index + 1}`}
            width={shot.width}
            height={shot.height}
            // The first two are on screen at load; the rest come in as the
            // strip is scrolled.
            priority={index < 2}
            sizes="(max-width: 767px) 60vw, 30vw"
            className="h-[300px] w-auto tablet:h-[400px] desktop-sm:h-[440px]"
          />
        </li>
      ))}
    </ul>
  );
}
