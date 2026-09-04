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
      className="relative h-[657px] w-full overflow-hidden bg-[#171717] tablet:h-[800px]"
    >
      {/* ---------- call to action ---------- */}
      <a
        href={siteConfig.footerCta.href}
        className="absolute top-[45px] right-5 flex items-center gap-[10px] tablet:top-[61px] tablet:right-10 tablet:gap-[17px]"
      >
        <span className="text-[32px] leading-[45px] font-medium text-[#f5f5f7] tablet:text-[67px] tablet:leading-[94px]">
          {siteConfig.footerCta.label}
        </span>
        <span className="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-white tablet:size-[47px]">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            className="size-[22px] tablet:size-[26px]"
          >
            <path
              d="M6 18 18 6M9 6h9v9"
              stroke="#171717"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>

      {/* ---------- oversized wordmark ---------- */}
      <div className="absolute top-[403px] right-5 left-5 tablet:top-[488px] tablet:right-10 tablet:left-10">
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
      </div>

      {/* ---------- legal ---------- */}
      <div className="absolute top-[502px] right-5 left-5 flex flex-col gap-[24px] text-[14px] leading-[17px] text-white tablet:top-[746px] tablet:right-10 tablet:left-10 tablet:flex-row tablet:items-center tablet:gap-0">
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
        <p className="mt-[8px] tablet:mt-0 tablet:ml-auto">{siteConfig.copyright}</p>
      </div>
    </footer>
  );
}
