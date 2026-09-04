"use client";

import { useState } from "react";
import Image from "next/image";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { siteConfig } from "@/data/site";

/**
 * Site header (Figma: desktop 1136:3519, mobile 1136:2531) — 50px tall, fixed,
 * a solid white bar at every scroll position.
 *
 * It used to be a 2% wash with `mix-blend-mode: difference` on the whole
 * header, which inverted everything behind it to stay legible over both the
 * dark hero and the light folds. That blend is why the bar could not simply be
 * made whiter: difference *inverts*, so raising the white wash turned the bar
 * grey over the light folds, and adding backdrop blur flattened the backdrop
 * to a mid-tone that the blended text then disappeared into (measured over the
 * Fold 05 photos). The bar is now opaque enough that the backdrop no longer
 * decides legibility, so the nav, CTA and menu button carry explicit dark
 * colours instead.
 *
 * The mark is `logo-final-dark.png` — see the note at the element for why a
 * derived file rather than a CSS filter.
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-[var(--z-header)] h-[50px] bg-white">
        <div className="mx-auto flex h-full max-w-[var(--content-max-width)] items-center justify-between px-5 tablet:px-10">
          {/* Full header height so the home link is a 50px target rather than
              the wordmark's own 24px — the logo still sits where it did. */}
          <a
            href="#fold-01"
            aria-label={`${siteConfig.name} — home`}
            className="flex h-full items-center"
          >
            {/* `logo-final.png` is the current lockup, but it ships as a white
                wordmark for dark grounds — on this white bar only its orbit
                would have shown. `logo-final-dark.png` is that same file with
                the greyscale ink inverted and the coloured orbit left alone,
                so the mark reads black here without the orbit turning into
                its complement (a flat `invert()` would have).

                132 wide on mobile against the artboard's 104: at phone size
                the wordmark read as an afterthought. */}
            <Image
              src="/images/logo-final-dark.png"
              alt={siteConfig.name}
              width={1600}
              height={370}
              priority
              sizes="140px"
              className="h-auto w-[132px] tablet:w-[126px]"
            />
          </a>

          <nav className="hidden items-center gap-14 tablet:flex">
            {siteConfig.nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                // Pure black, kept from when the bar was translucent and
                // needed every point of contrast; on solid white it simply
                // matches the wordmark.
                className="text-[15px] leading-[20px] text-black"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href={siteConfig.cta.href}
            className="hidden h-[33px] items-center justify-center rounded-full bg-[#111116] px-[14px] text-[15px] leading-[20px] text-white tablet:inline-flex"
          >
            {siteConfig.cta.label}
          </a>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            // Three bare rules, no disc behind them. The 33px box stays even
            // without the circle: the menu's close button mirrors it so the
            // control does not shift when the panel opens. The pseudo-element
            // pads the hit area out to 45px for thumbs.
            className="relative flex size-[33px] items-center justify-center before:absolute before:-inset-[6px] before:content-[''] tablet:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <path
                d="M3 6.5h18M3 12h18M3 17.5h18"
                stroke="#111116"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Sibling of the header, not a child: the header's backdrop-blur is a
          containing block for fixed positioning, which trapped this overlay in
          its 50px strip. */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
