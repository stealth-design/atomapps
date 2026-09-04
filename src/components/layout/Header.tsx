"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { siteConfig } from "@/data/site";

/**
 * Site header (Figma: desktop 1136:3519, mobile 1136:2531) — 50px tall, fixed
 * over the hero with a 2% white wash. The nav, CTA and wordmark use
 * `mix-blend-mode: difference` exactly as the design does, which is what keeps
 * them legible over both the dark hero and the light folds underneath.
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-[var(--z-header)] h-[50px] bg-white/[0.02] backdrop-blur-[18px] tablet:backdrop-blur-none tablet:mix-blend-difference">
      <div className="mx-auto flex h-full max-w-[var(--content-max-width)] items-center justify-between px-5 tablet:px-10">
        {/* Full header height so the home link is a 50px target rather than
            the wordmark's own 24px — the logo still sits where it did. */}
        <a
          href="#fold-01"
          aria-label={`${siteConfig.name} — home`}
          className="flex h-full items-center"
        >
          <Logo width={104} blend={false} className="tablet:w-[126px]" />
        </a>

        <nav className="hidden items-center gap-14 tablet:flex">
          {siteConfig.nav.map((item) => (
            <a key={item.label} href={item.href} className="text-[15px] leading-[20px] text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={siteConfig.cta.href}
          className="hidden h-[33px] items-center justify-center rounded-full bg-white px-[14px] text-[15px] leading-[20px] text-black tablet:inline-flex"
        >
          {siteConfig.cta.label}
        </a>

        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          // The design's button is a 33px circle; the pseudo-element pads the
          // hit area out to 45px for thumbs without enlarging the circle.
          className="relative flex size-[33px] items-center justify-center rounded-full bg-white before:absolute before:-inset-[6px] before:content-[''] tablet:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
            <path d="M2.5 5.5h15M2.5 10h15M2.5 14.5h15" stroke="#1d1b20" strokeWidth="1.6" />
          </svg>
        </button>
      </div>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}
