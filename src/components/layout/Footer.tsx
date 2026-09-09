import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site";

/**
 * Site footer.
 *
 * Figma (canvas `----> v7`):
 *   desktop  1144:2746  1440 x 800
 *   mobile   1136:2513   393 x 657
 *
 * A dark panel stacked down the centre line: the AtomApps wordmark across the
 * top, the "Get in touch" call to action under it, the three section links
 * below that, and the legal row on the foot — the only block that is not
 * centred, with the links left and the copyright right.
 *
 * The composition is the artboard's; the way it is held together is not.
 * Every block used to sit at its measured offset from the top of a panel fixed
 * at 800px, which only holds at the width those offsets were taken from. The
 * blocks are in flow instead, the panel's height is a floor rather than a cap,
 * and the legal row is pushed to the foot by `mt-auto`, so the lockup keeps
 * its shape as the panel grows.
 *
 * The wordmark reserves 19.024% of its own box as transparent space above the
 * ink — the asset's box is 4.32 wide to tall, the ink inside it 5.34. That is
 * why the padding above it looks short against the gap it actually renders:
 * at the artboard's width the box starts 45px down and the wordmark itself
 * appears 83px down. Any change to the top padding has to account for it.
 */

export function Footer() {
  return (
    <footer
      id="contact"
      // A floor, not a fixed height: at 1440 this is the artboard's 800px, and
      // above that it gives way rather than clipping the wordmark.
      className="relative min-h-[657px] w-full overflow-hidden bg-[#171717] tablet:min-h-[800px]"
    >
      <div className="mx-auto flex min-h-[657px] w-full max-w-[var(--content-max-width)] flex-col px-5 pt-[36px] pb-[38px] tablet:min-h-[800px] tablet:px-10 tablet:pt-[45px] tablet:pb-[45px]">
        {/* ---------- wordmark ---------- */}
        {/* The final lockup ships as a single asset with the colour orbit drawn
            into it, so this composes nothing — see the note above for the
            transparent band the asset carries over the ink. Light cut, for
            this #171717 panel. */}
        <Image
          src="/logos/final-atom-logo-white.png"
          alt={siteConfig.name}
          width={14786}
          height={3422}
          sizes="(max-width: 767px) 100vw, 64vw"
          // 64% of the content row from tablet up — the artboard's 872 of the
          // 1360 between the gutters — and the full row below it, where a
          // 353px-wide phone has none to spare. A share rather than a fixed
          // width so the lockup keeps its proportions against the call to
          // action, which is sized off the same row.
          className="mx-auto h-auto w-full tablet:w-[64%]"
        />

        {/* ---------- call to action ---------- */}
        {/*
         * The ring and its gap are fractions of the call to action's own type
         * size, so the three stay in proportion at any width — the artboard's
         * 67 / 47 / 17px at 1440, and still that lockup at 2560.
         */}
        {/* `Link` for the same reason as the header's: /contact is a route. */}
        <Link
          href={siteConfig.footerCta.href}
          className="group mx-auto mt-[170px] flex w-fit items-center gap-[0.254em] text-[32px] leading-[1.4] font-medium text-[#f5f5f7] tablet:mt-[210px] tablet:text-[clamp(67px,calc(var(--locked-vw)*0.04653),104px)]"
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

        {/* ---------- section links ---------- */}
        {/* The same three the header carries, so they come from the same place
            in the config rather than being written out again here. */}
        <nav className="mt-[90px] flex flex-wrap items-center justify-center gap-x-[28px] gap-y-[14px] tablet:mt-[38px] tablet:gap-x-[97px]">
          {siteConfig.nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              data-underline-link
              className="text-[18px] leading-[24px] text-[#f5f5f7] tablet:text-[36px] tablet:leading-[47px]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* ---------- legal ---------- */}
        {/* `mt-auto` is what holds the artboard's shape: the stack above keeps
            its own spacing off the top of the panel, and this row sits on the
            foot however tall the panel ends up. */}
        <div className="mt-auto flex flex-col gap-[24px] pt-[64px] text-[14px] leading-[17px] text-white tablet:flex-row tablet:items-center tablet:gap-0">
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
