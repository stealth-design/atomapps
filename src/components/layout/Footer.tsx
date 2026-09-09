import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site";

/**
 * Site footer (Figma 1576:4269, 1440x800).
 *
 * The call to action sits on the top right, the AtomApps wordmark runs the full
 * width of the foot, and the legal row tucks under it — links left, copyright
 * right. The middle of the panel is deliberately empty: the two blocks are
 * anchored to opposite ends and the ~273px between them is what the artboard
 * asks for, not slack left over.
 *
 * The composition is the artboard's; the way it is held together is not. Every
 * block used to sit at its measured offset from the top of a panel fixed at
 * 800px, which only holds at the width those offsets were taken from. The
 * blocks are in flow instead, the panel's height is a floor rather than a cap,
 * and `mt-auto` is what pins the foot — with the paddings below that resolves
 * to the artboard's own numbers (wordmark box top at 428 of 800) at 1440, and
 * gives way rather than clipping above it.
 *
 * Two numbers to be careful with:
 *
 *   - The wordmark asset reserves 19.024% of its own box as transparent space
 *     above the ink (box 4.32 wide to tall, ink 5.34). Nothing here depends on
 *     that, because the block is anchored by its foot, but any change to the
 *     padding above it does.
 *   - The gap under the wordmark is 3px. That is the artboard's, and it is
 *     tight on purpose — the legal row reads as part of the lockup rather than
 *     as a separate band. It is measured to the wordmark's box, which ends on
 *     the descenders of "pp", so there is no hidden slack in it.
 *
 * An earlier revision carried the three section links between the call to
 * action and the wordmark. This artboard has no such row, so they are gone;
 * the header still carries them.
 */
export function Footer() {
  return (
    <footer
      id="contact"
      // A floor, not a fixed height: at 1440 this is the artboard's 800px, and
      // above that it gives way rather than clipping the wordmark.
      className="relative min-h-[657px] w-full overflow-hidden bg-[#171717] tablet:min-h-[800px]"
    >
      <div className="mx-auto flex min-h-[657px] w-full max-w-[var(--content-max-width)] flex-col px-5 pt-[45px] pb-[38px] tablet:min-h-[800px] tablet:px-10 tablet:pt-[62px] tablet:pb-[37px]">
        {/* ---------- call to action ---------- */}
        {/*
         * The ring and its gap are fractions of the call to action's own type
         * size, so the three stay in proportion at any width — the artboard's
         * 67 / 47 / 17px at 1440, and still that lockup at 2560.
         */}
        {/* `Link` for the same reason as the header's: /contact is a route. */}
        <Link
          href={siteConfig.footerCta.href}
          className="group flex w-fit items-center gap-[0.254em] self-end text-[32px] leading-[1.4] font-medium text-[#f5f5f7] tablet:text-[clamp(67px,calc(var(--locked-vw)*0.04653),104px)]"
        >
          <span>{siteConfig.footerCta.label}</span>

          {/*
           * The arrow leaves through the top-right corner and its replacement
           * arrives from the bottom-left, so the ring reads as one arrow
           * travelling through rather than a glyph that swaps. Two copies
           * rather than one moving out and back: a single arrow would have to
           * return along the diagonal it just left by, which reads as a recoil.
           *
           * `overflow-hidden` on the ring is what sells it — both are clipped
           * to the circle, so neither is ever seen outside it.
           */}
          <span className="relative grid size-[40px] shrink-0 place-items-center overflow-hidden rounded-full bg-white tablet:size-[0.701em]">
            <Arrow className="translate-x-0 translate-y-0 group-hover:translate-x-[150%] group-hover:-translate-y-[150%]" />
            <Arrow className="-translate-x-[150%] translate-y-[150%] group-hover:translate-x-0 group-hover:translate-y-0" />
          </span>
        </Link>

        {/* ---------- wordmark and legal, on the foot ---------- */}
        {/* `mt-auto` is what holds the artboard's shape: the call to action
            stays at the top and these two sit together on the foot however
            tall the panel ends up. */}
        <div className="mt-auto">
          {/* The final lockup ships as a single asset with the colour orbit
              drawn into it, so this composes nothing. Light cut, for this
              #171717 panel. */}
          <Image
            src="/logos/final-atom-logo-white.png"
            alt={siteConfig.name}
            width={14786}
            height={3422}
            sizes="100vw"
            className="h-auto w-full"
          />

          {/* ---------- legal ---------- */}
          <div className="mt-[26px] flex flex-col gap-[24px] text-[14px] leading-[17px] text-white tablet:mt-[3px] tablet:flex-row tablet:items-center tablet:gap-0">
            {/* `tablet:contents` dissolves this row above the breakpoint, so the
                desktop layout still lays both links out as direct children of the
                flex row with its own spacing. */}
            <div className="flex gap-[28px] tablet:contents">
              {siteConfig.legal.map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  // A 14px line box is a 17px-tall touch target, under the 24px WCAG
                  // 2.5.8 floor. The pseudo-element grows the hit area into the 24px
                  // stack gap without moving anything: 11px a side lands at 39px and
                  // still leaves 2px between the two, so neither steals the other's
                  // taps.
                  className={`relative before:absolute before:inset-x-0 before:-inset-y-[11px] before:content-[''] ${
                    index > 0 ? "tablet:ml-[103px]" : ""
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <p className="tablet:ml-auto">{siteConfig.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * The ring's arrow. Sized in `em` so it tracks the call to action's type, and
 * transitioned on the same curve the rest of the page's hovers use.
 */
function Arrow({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      className={`col-start-1 row-start-1 size-[22px] transition-transform duration-[600ms] ease-[cubic-bezier(0.625,0.05,0,1)] motion-reduce:transition-none tablet:size-[0.388em] ${className}`}
    >
      <path
        d="M6 18 18 6M9 6h9v9"
        stroke="#171717"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
