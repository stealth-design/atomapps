"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { siteConfig } from "@/data/site";

/**
 * Site header (Figma: desktop 1136:3519, mobile 1136:2531) — 50px tall, fixed,
 * a frosted white bar at every scroll position.
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
 * The wordmark is inverted rather than blended (`Logo`'s `dark`). Figma
 * specifies a difference blend there, and that held while the bar was 72%
 * white, but thinning the bar for a glassier read drove the blended mark
 * toward the hero's own mid-tone and it faded out. An invert is
 * backdrop-independent. The colour orbit stays NORMAL either way, as Figma
 * has it.
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-[var(--z-header)] h-[50px] bg-white/[0.07]"
        // The filter does the work a heavier white used to: `contrast(0.55)`
        // pulls the backdrop toward mid-grey, which also drops its
        // saturation, and `brightness(1.5)` then lifts it — so the bar
        // lightens what is behind it instead of covering it, and the white
        // can stay at 7%.
        //
        // These numbers are the transparency limit for black nav type, found
        // by measuring at each link rather than at the bar's centre. The
        // hero darkens to the right, so "About Us" is always the worst case
        // and a centre reading flatters it badly — one candidate measured
        // 4.7:1 mid-bar and 3.5:1 under that link. Here the three links come
        // out at 7.0 / 6.2 / 4.7:1. Letting more of the backdrop through than
        // this puts the rightmost link under 4.5:1.
        //
        // Written out rather than assembled from `backdrop-*` utilities
        // because filter order changes the result: Tailwind composes
        // brightness before contrast, which lifts first and then pulls the
        // lifted values back toward grey, undoing most of the gain.
        style={{
          backdropFilter: "blur(26px) contrast(0.55) brightness(1.5) saturate(0.78)",
          WebkitBackdropFilter: "blur(26px) contrast(0.55) brightness(1.5) saturate(0.78)",
        }}
      >
        <div className="mx-auto flex h-full max-w-[var(--content-max-width)] items-center justify-between px-5 tablet:px-10">
          {/* Full header height so the home link is a 50px target rather than
              the wordmark's own 24px — the logo still sits where it did. */}
          <a
            href="#fold-01"
            aria-label={`${siteConfig.name} — home`}
            className="flex h-full items-center"
          >
            {/* 132 on mobile against the artboard's 104: at phone size the
                wordmark read as an afterthought. 132 x 30px still clears the
                50px bar. `dark` inverts the white wordmark rather than
                blending it: at this bar opacity a difference blend faded the
                mark out over the dark hero. */}
            <Logo width={132} dark className="tablet:w-[126px]" />
          </a>

          <nav className="hidden items-center gap-14 tablet:flex">
            {siteConfig.nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                // Pure black rather than the #111116 foreground: at this bar
                // opacity the hero shows through enough that the near-black
                // fell under 4.5:1, and the extra 15% of contrast black buys
                // is what keeps the nav at AA.
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
            // The design's button is a 33px circle; the pseudo-element pads the
            // hit area out to 45px for thumbs without enlarging the circle.
            className="relative flex size-[33px] items-center justify-center rounded-full bg-[#111116] before:absolute before:-inset-[6px] before:content-[''] tablet:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
              <path d="M2.5 5.5h15M2.5 10h15M2.5 14.5h15" stroke="#fff" strokeWidth="1.6" />
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
