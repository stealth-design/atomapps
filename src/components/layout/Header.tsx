"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "@/lib/gsap";
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
 * Over the hero the bar drops its white ground for the artboard's scrim
 * (Figma 1551:4258) and inverts: white wordmark, white links, and the contact
 * pill white on black type. It is the hero's own frame that makes that legible
 * — the scrim is 50% black on the top edge and clear by the bar's foot, which
 * reads against a photograph and does nothing at all against the white folds
 * below it. So the inversion is scoped to the hero rather than applied for the
 * whole page: past it the bar returns to the solid white below, and pages with
 * no hero (there is one, /contact) never leave it. Both cuts of the mark are
 * in the bar and cross-fade, because an `src` swap cannot be transitioned.
 *
 * The mark is `final-atom-logo-dark.png` / `-white.png` — see the note at the
 * element for why derived files rather than a CSS filter.
 *
 * The bar retracts on the way down the page and comes back the moment the
 * scroll reverses. Direction comes from a ScrollTrigger rather than a `scroll`
 * listener: Lenis owns the scroll position here and already drives
 * ScrollTrigger from the same ticker (see SmoothScroll), so reading direction
 * from it means one source of truth and no second listener firing on a
 * position Lenis has not finished settling.
 */

/**
 * Movement to ignore before the bar reacts, in pixels.
 *
 * Without it a trackpad's own jitter around a standstill flips direction on
 * its own and the bar flickers in and out while nobody is really scrolling.
 */
const DIRECTION_THRESHOLD = 8;

/** The bar's own height, in pixels — mirrors `--header-height`. */
const HEADER_HEIGHT = 50;

/**
 * The bar's ground over the hero, straight off the artboard (Figma 1551:4258):
 * black at half opacity along the top edge, clear by the bar's foot. It is a
 * scrim, not a panel — it darkens whatever the bar is over just enough to hold
 * white type, which is why it only works over the hero's photograph.
 */
const HERO_SCRIM = "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)";

/** The state swap. Matches the retract, so the two read as one movement. */
const SWAP = "transition-colors duration-[450ms] ease-[cubic-bezier(0.625,0.05,0,1)] motion-reduce:transition-none";
const SWAP_FADE = "transition-opacity duration-[450ms] ease-[cubic-bezier(0.625,0.05,0,1)] motion-reduce:transition-none";

interface HeaderProps {
  /**
   * Set on pages whose first fold is the dark hero, which is the only backdrop
   * the scrim above is legible over. It is a prop rather than something read
   * from the route so the server renders the right bar and there is no white
   * flash over the hero before hydration.
   */
  transparentOverHero?: boolean;
}

export function Header({ transparentOverHero = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRetracted, setIsRetracted] = useState(false);
  const [isOverHero, setIsOverHero] = useState(transparentOverHero);

  // Mirrors of the two values the ScrollTrigger needs to read on every frame.
  // Kept in refs so `onUpdate` can compare against them without the effect
  // depending on state and rebuilding the trigger on every toggle.
  const lastScroll = useRef(0);
  const retracted = useRef(false);

  const setRetracted = useCallback((next: boolean) => {
    if (retracted.current === next) return;
    retracted.current = next;
    setIsRetracted(next);
  }, []);

  useGSAP(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        const delta = y - lastScroll.current;
        if (Math.abs(delta) < DIRECTION_THRESHOLD) return;
        lastScroll.current = y;

        // Never retracted over the top of the page: the first 50px is the bar's
        // own height, and hiding it there would take it away as the hero
        // arrives rather than once the reader is into the page.
        setRetracted(y > 50 && delta > 0);
      },
    });

    // The bar is inverted only while it is genuinely over the hero: the swap
    // lands when the hero's bottom edge reaches the bar's foot, so it never
    // holds white type over the white fold underneath.
    const hero = transparentOverHero ? document.getElementById("fold-01") : null;
    const heroTrigger = hero
      ? ScrollTrigger.create({
          trigger: hero,
          start: `bottom top+=${HEADER_HEIGHT}`,
          end: "max",
          onToggle: (self) => setIsOverHero(!self.isActive),
        })
      : null;
    // `onToggle` only fires on a crossing, so the initial state has to be read
    // off the trigger — otherwise a load already scrolled past the hero (a
    // hash link, or a restored position) would come up inverted.
    if (heroTrigger) setIsOverHero(!heroTrigger.isActive);

    return () => {
      trigger.kill();
      heroTrigger?.kill();
    };
  }, [setRetracted, transparentOverHero]);

  return (
    <>
      {/* `transform-gpu` promotes the bar to its own compositing layer. It is
          not cosmetic: iOS Safari intermittently fails to paint a
          `position: fixed` element on first load over a tall page and only
          brings it in once a scroll forces a repaint, which is what made the
          nav look absent on a first visit. Giving it a layer up front means it
          is composited from the first frame.

          Safe here because `MobileMenu` is a sibling of this element, not a
          descendant — a transform would otherwise become the containing block
          for its `fixed inset-0` panel. */}
      <header
        // Focus brings it back before anything can be tabbed to behind it:
        // a retracted bar is off screen but its links are still in the tab
        // order, and focus landing on something invisible is a dead end.
        onFocusCapture={() => setRetracted(false)}
        // Tailwind v4 puts `-translate-y-full` on the `translate` property,
        // which is separate from the `transform` that `transform-gpu` sets, so
        // the two compose rather than one dropping the other.
        className={`fixed top-0 right-0 left-0 z-[var(--z-header)] h-[50px] transform-gpu transition-transform duration-[450ms] ease-[cubic-bezier(0.625,0.05,0,1)] motion-reduce:transition-none ${
          isRetracted && !isMenuOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Two grounds rather than one that changes colour: a gradient and a
            solid cannot be transitioned into each other, so they are stacked
            and their opacity is cross-faded instead. The scrim is second, so
            over the hero it is all that shows; past it the white beneath it
            takes over. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-white ${SWAP_FADE} ${isOverHero ? "opacity-0" : "opacity-100"}`}
        />
        {transparentOverHero && (
          <div
            aria-hidden="true"
            style={{ backgroundImage: HERO_SCRIM }}
            className={`absolute inset-0 ${SWAP_FADE} ${isOverHero ? "opacity-100" : "opacity-0"}`}
          />
        )}

        <div className="relative mx-auto flex h-full max-w-[var(--content-max-width)] items-center justify-between px-5 tablet:px-10">
          {/* Full header height so the home link is a 50px target rather than
              the wordmark's own 24px — the logo still sits where it did. */}
          <Link
            href="/"
            aria-label={`${siteConfig.name} — home`}
            className="flex h-full items-center"
          >
            {/* The two ink cuts of the final lockup — dark for the white bar,
                light for the scrim — held one over the other and cross-faded,
                because an `src` swap cannot be transitioned and the orbit in
                the mark is orange, blue and teal, so `filter: invert()` would
                take those with it. Both share the 4.32 aspect the previous
                lockup had, so the widths below are unchanged, and next/image
                serves each at 140px, not at the source's megabytes.

                132 wide on mobile against the artboard's 104: at phone size
                the wordmark read as an afterthought.

                Only the dark cut is `priority` when there is no hero, because
                it is the one that shows; with a hero the light cut leads. */}
            <span className="relative block w-[132px] tablet:w-[126px]">
              <Image
                src="/logos/final-atom-logo-dark.png"
                alt={siteConfig.name}
                width={8226}
                height={1904}
                priority={!transparentOverHero}
                sizes="140px"
                className={`h-auto w-full ${SWAP_FADE} ${isOverHero ? "opacity-0" : "opacity-100"}`}
              />
              {transparentOverHero && (
                <Image
                  src="/logos/final-atom-logo-white.png"
                  alt=""
                  aria-hidden="true"
                  width={14786}
                  height={3422}
                  priority
                  sizes="140px"
                  className={`absolute inset-0 h-auto w-full ${SWAP_FADE} ${isOverHero ? "opacity-100" : "opacity-0"}`}
                />
              )}
            </span>
          </Link>

          <nav className="hidden items-center gap-14 tablet:flex">
            {siteConfig.nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                data-underline-link
                // Black on the white bar, matching the wordmark; white over
                // the hero, where the scrim is what carries it.
                className={`text-[15px] leading-[20px] ${SWAP} ${isOverHero ? "text-white" : "text-black"}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* `Link`, not `<a>`: this now points at a route (/contact) rather
              than an in-page anchor, so it should navigate client-side.

              The arrow shifts a little on hover and the pill lightens. Both are
              behind `@media (hover: hover)` — Tailwind's `hover:` alone also
              fires on a tap, which leaves a phone showing the hover state until
              something else is touched. */}
          <Link
            href={siteConfig.cta.href}
            // The pill inverts with the bar — the artboard has it white with
            // black type over the hero — and its hover moves the ground one
            // step further from the type either way round.
            className={`group hidden h-[33px] items-center justify-center gap-[7px] rounded-full pr-[12px] pl-[14px] text-[15px] leading-[20px] transition-colors duration-300 ease-[cubic-bezier(0.625,0.05,0,1)] tablet:inline-flex ${
              isOverHero
                ? "bg-white text-[#111116] can-hover:hover:bg-[#dedee2]"
                : "bg-[#111116] text-white can-hover:hover:bg-[#2c2c33]"
            }`}
          >
            {siteConfig.cta.label}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden="true"
              fill="none"
              className="shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:group-hover:translate-x-[3px] motion-reduce:transition-none"
            >
              <path
                d="M2.5 7h9M8 3.5 11.5 7 8 10.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            // Three bare rules, no disc behind them. The 33px box stays even
            // without the circle: the menu's close button mirrors it so the
            // control does not shift when the panel opens. The pseudo-element
            // pads the hit area out to 45px for thumbs.
            className={`relative flex size-[33px] items-center justify-center before:absolute before:-inset-[6px] before:content-[''] tablet:hidden ${SWAP} ${
              isOverHero ? "text-white" : "text-[#111116]"
            }`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
            >
              <path
                d="M3 6.5h18M3 12h18M3 17.5h18"
                stroke="currentColor"
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
