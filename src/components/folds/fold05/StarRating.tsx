/**
 * The 4½-star row beside the App Store rating (Figma: four `star` glyphs plus
 * one `star_half`, 18px each on desktop).
 */
export function StarRating({ className }: { className?: string }) {
  return (
    <span className={className} role="img" aria-label="Rated 4.8 out of 5">
      <svg viewBox="0 0 106 20" fill="#1c1b1f" aria-hidden="true" className="h-full w-auto">
        <defs>
          <path
            id="fold05-star"
            d="M10 15.27 4.18 18.9l1.64-6.81L.5 7.5l6.96-.59L10 .5l2.54 6.41 6.96.59-5.32 4.59 1.64 6.81z"
          />
          <clipPath id="fold05-half">
            <rect x="0" y="0" width="10" height="20" />
          </clipPath>
        </defs>
        {[0, 22, 44, 66].map((x) => (
          <use key={x} href="#fold05-star" x={x} />
        ))}
        <g transform="translate(88 0)">
          <use href="#fold05-star" opacity="0.25" />
          <use href="#fold05-star" clipPath="url(#fold05-half)" />
        </g>
      </svg>
    </span>
  );
}
