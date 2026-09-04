import Image from "next/image";
import { siteConfig } from "@/data/site";

/**
 * Site footer.
 *
 * Figma (canvas `----> v7`):
 *   desktop  1144:2746  1440 x 800
 *   mobile   1136:2513   393 x 657
 *
 * A dark panel with the "Get in touch" call to action top-right, the AtomApps
 * wordmark set oversized across the foot, and the legal row beneath — one line
 * on desktop, stacked on mobile.
 *
 * The composition is the artboard's; the way it is held together is not.
 * Every block used to sit at its measured offset from the top of a panel fixed
 * at 800px, which only holds at the width those offsets were taken from. The
 * wordmark is full-bleed, so its height goes up with the viewport — past about
 * 1900px it ran out through the foot of the panel and the legal row printed
 * over it. Now the blocks are in flow, the panel's height is a floor rather
 * than a cap, and the call to action is sized in `vw` off its own artboard
 * value, so the lockup holds its proportions instead of shrinking against a
 * wordmark that keeps growing.
 *
 * The wordmark's colour orbit sits over its "o". The offsets below are derived
 * from Figma's own rendered output rather than the node box: Figma draws that
 * image fill at ~72% of the layer's 305px frame (a scale the REST API doesn't
 * report), so using the node box put the rings 1.39x too large. One set of
 * percentages reproduces both artboards — verified against each render.
 */
export function Footer() {
  return (
    <footer
      id="contact"
      // A floor, not a fixed height: at 1440 this is the artboard's 800px, and
      // above that it gives way rather than clipping the wordmark.
      className="relative min-h-[657px] w-full overflow-hidden bg-[#171717] tablet:min-h-[800px]"
    >
      <div className="flex min-h-[657px] flex-col px-5 pt-[45px] pb-[38px] tablet:min-h-[800px] tablet:px-10 tablet:pt-[61px] tablet:pb-[54px]">
        {/* ---------- call to action ---------- */}
        {/*
         * The ring and its gap are fractions of the call to action's own type
         * size, so the three stay in proportion at any width — the artboard's
         * 67 / 47 / 17px at 1440, and still that lockup at 2560.
         */}
        <a
          href={siteConfig.footerCta.href}
          className="group flex w-fit items-center gap-[0.254em] self-end text-[32px] leading-[1.4] font-medium text-[#f5f5f7] tablet:text-[clamp(67px,4.653vw,104px)]"
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
        </a>

        {/* ---------- oversized wordmark ---------- */}
        {/* `mt-auto` is what holds the artboard's shape: the call to action
            stays at the top, and the wordmark and legal row sit together on
            the foot however tall the panel ends up. */}
        <div className="mt-auto pt-[64px]">
          <div className="relative">
            <Image
              src="/logos/atomapps-wordmark-large.svg"
              alt={siteConfig.name}
              width={1362}
              height={255}
              className="h-auto w-full"
            />
            <Image
              src="/logos/atomapps-orbit-large.png"
              alt=""
              width={640}
              height={640}
              // Renders at 16.43% of the wordmark block — ~64px on a phone, so
              // the 640px intrinsic was pulling a 1920w variant onto mobile.
              sizes="16vw"
              aria-hidden="true"
              className="absolute top-[-7.03%] left-[19.5%] h-auto w-[16.43%]"
            />
          </div>

          {/* ---------- legal ---------- */}
          <div className="mt-[26px] flex flex-col gap-[24px] text-[14px] leading-[17px] text-white tablet:mt-[18px] tablet:flex-row tablet:items-center tablet:gap-0">
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
