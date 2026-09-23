import { useId } from "react";

/**
 * Five stars filled to the rating — 4.4 paints four full stars and 40% of the
 * fifth. Fold 05's `StarRating` is a fixed four-and-a-half glyph because every
 * app the design carries rounds to it; the app pages show fourteen listings
 * that run from 4.2 to 4.8, so this one measures the fill instead.
 *
 * One `clipPath` per instance: the id has to be unique because a page shows
 * this twice (the hero and the details card), and two clip paths sharing an
 * id would both resolve to whichever came first.
 */

const STAR =
  "M10 15.27 4.18 18.9l1.64-6.81L.5 7.5l6.96-.59L10 .5l2.54 6.41 6.96.59-5.32 4.59 1.64 6.81z";
const STEP = 22;
const WIDTH = STEP * 4 + 20;

export function StarRating({ rating, className }: { rating: number; className?: string }) {
  const id = useId();
  const clipId = `stars-${id.replace(/:/g, "")}`;
  const fill = Math.max(0, Math.min(5, rating));
  // Whole stars are 20 wide with a 2px gap, so the fill edge lands inside the
  // partial star rather than in the gap before it.
  const whole = Math.floor(fill);
  const filledWidth = whole * STEP + (fill - whole) * 20;

  return (
    <span className={className} role="img" aria-label={`Rated ${rating} out of 5`}>
      <svg viewBox={`0 0 ${WIDTH} 20`} aria-hidden="true" className="h-full w-auto">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={filledWidth} height="20" />
          </clipPath>
        </defs>
        {[0, 1, 2, 3, 4].map((index) => (
          <path key={index} d={STAR} transform={`translate(${index * STEP} 0)`} fill="#1c1b1f" opacity="0.2" />
        ))}
        <g clipPath={`url(#${clipId})`}>
          {[0, 1, 2, 3, 4].map((index) => (
            <path key={index} d={STAR} transform={`translate(${index * STEP} 0)`} fill="#1c1b1f" />
          ))}
        </g>
      </svg>
    </span>
  );
}
