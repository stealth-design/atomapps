import Image from "next/image";
import { siteConfig } from "@/data/site";

/**
 * Site footer (Figma 1576:4269, 1440x800).
 *
 * One centred column: the AtomApps wordmark running the full width, then the
 * legal links, the trademark notices and the copyright. The panel is only as
 * tall as that column plus its paddings. It used to be held at 800px or the
 * full window under the header, whichever was larger, with the column pinned
 * to the bottom and empty space above it; that was dropped by request so the
 * footer reads as a closing band under the last fold, not a page of its own.
 *
 * It used to open with a "Get in touch" call to action and carry the tagline
 * and the contact address under the wordmark, with the copyright pushed to the
 * right of the legal row. All of that is gone by request; the address still
 * lives in `siteConfig.email`, which the legal pages use.
 *
 * Two numbers to be careful with:
 *
 *   - The wordmark asset reserves 19.024% of its own box as transparent space
 *     above the ink (box 4.32 wide to tall, ink 5.34), so the visible gap
 *     above the letters is the top padding plus that share of the box. Any
 *     change to the top padding should allow for it.
 *   - What follows the wordmark is measured to its box, which ends on the
 *     descenders of "pp", so there is no hidden slack in that gap.
 *
 * An earlier revision carried the three section links between the call to
 * action and the wordmark. This artboard has no such row, so they are gone;
 * the header still carries them.
 */
export function Footer() {
  return (
    <footer
      id="contact"
      // As tall as its content and no taller: at full scroll the fold above
      // stays in view over the footer's top edge, rather than the footer
      // filling the window under the header.
      className="relative w-full overflow-hidden bg-[#171717]"
    >
      <div className="mx-auto w-full max-w-[var(--content-max-width)] px-5 pt-[45px] pb-[38px] tablet:px-10 tablet:pt-[62px] tablet:pb-[37px]">
        {/* ---------- wordmark and legal ---------- */}
        <div>
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
          {/* Centred under the wordmark, and the copyright is no longer in
              this row: the foot of the panel is one centred column now, so a
              line pushed to the right edge would be the only thing in it that
              is not. */}
          <nav className="mt-[36px] flex flex-wrap justify-center gap-x-[28px] gap-y-[16px] text-[14px] leading-[17px] text-white tablet:mt-[48px] tablet:gap-x-[56px]">
            {siteConfig.legal.map((item) => (
              <a
                key={item.label}
                href={item.href}
                // A 14px line box is a 17px-tall touch target, under the 24px
                // WCAG 2.5.8 floor. The pseudo-element grows the hit area into
                // the 16px stack gap without moving anything: 11px a side lands
                // at 39px and still leaves 2px between two stacked rows, so
                // neither steals the other's taps.
                className="relative before:absolute before:inset-x-0 before:-inset-y-[11px] before:content-['']"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* ---------- trademark attribution ---------- */}
          {/* The quietest thing on the panel: smaller and dimmer than the
              legal row above, so it reads as a required notice rather than as
              another link. The measure holds each notice to one line at 1440
              and lets both wrap on a phone. */}
          <div className="mx-auto mt-[40px] flex max-w-[1040px] flex-col gap-[6px] text-center text-[12px] leading-[18px] text-[#8a8a8a] tablet:mt-[56px]">
            {siteConfig.disclaimers.map((notice) => (
              <p key={notice}>{notice}</p>
            ))}
          </div>

          {/* ---------- copyright ---------- */}
          <p className="mt-[18px] text-center text-[14px] leading-[20px] text-white tablet:mt-[22px]">
            {siteConfig.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
