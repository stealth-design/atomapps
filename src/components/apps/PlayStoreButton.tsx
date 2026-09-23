import { cn } from "@/lib/utils";
import { playStoreUrl, type AppPage } from "@/data/apps";

/**
 * The way back to Google Play. A black pill in the shape of Fold 05's card
 * CTA — same height, same inversion on hover — with the Play triangle in place
 * of the arrow disc, so it reads as "this goes to the store" rather than "this
 * goes further into the site".
 *
 * Plain text and a drawn glyph rather than Google's badge artwork: the badge
 * comes with its own usage terms and a minimum clear space, and the pill
 * already matches everything else on the site.
 */
export function PlayStoreButton({ app, className }: { app: AppPage; className?: string }) {
  return (
    <a
      href={playStoreUrl(app)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group/cta relative inline-flex h-[44px] w-fit max-w-full shrink-0 items-center gap-[12px] rounded-full bg-black pr-[20px] pl-[14px]",
        "transition-colors duration-[450ms] ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:hover:bg-white motion-reduce:transition-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        className,
      )}
    >
      {/* The hairline that keeps the pill's edge once it turns white — see
          Fold 05's AppCard for the reasoning; this is the same construction. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-black transition-[box-shadow] duration-[450ms] ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:group-hover/cta:ring-black/15 motion-reduce:transition-none"
      />

      <span className="relative grid size-[24px] shrink-0 place-items-center rounded-full bg-white text-black transition-colors duration-[450ms] ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:group-hover/cta:bg-black can-hover:group-hover/cta:text-white motion-reduce:transition-none">
        <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true" fill="currentColor">
          <path d="M0 0.8v10.4c0 .6.66.98 1.18.68l8.34-5.2a.8.8 0 0 0 0-1.36L1.18.12A.8.8 0 0 0 0 .8Z" />
        </svg>
      </span>

      <span className="relative flex flex-col leading-none text-white transition-colors duration-[450ms] ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:group-hover/cta:text-black motion-reduce:transition-none">
        <span className="text-[10px] leading-[12px] tracking-[0.02em] uppercase opacity-80">Get it on</span>
        <span className="text-[15px] leading-[18px] font-semibold">Google Play</span>
      </span>
    </a>
  );
}
