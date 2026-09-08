import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { HeroMotion } from "@/components/folds/fold01/HeroMotion";

/**
 * Fold 01 — Hero
 *
 * Figma (canvas `----> v7`):
 *   desktop  1136:2593  1440 x 800
 *   mobile   1136:1088   393 x 761
 *
 * The scene is now two flat assets — `bg-image-mobile.png` and
 * `bg-image-desktop.png` — each carrying the whole composition: landscape,
 * penguin and phone. So this fold no longer assembles anything. What is left
 * on top of the plate is the moon (the mobile asset has no moon of its own;
 * the desktop one does), the copy, and the two foot gradients.
 *
 * That removed the live phone overlay and the penguin layer, and with them the
 * geometry that existed only to serve them: the oversized/offset plate boxes,
 * the `min()`/`max()` vw expressions that tracked a device photographed into
 * the plate as it scaled, and the desktop light wash that lit that device.
 *
 * The copy keeps its own numbers. Its top was originally derived from the
 * phone's — half the space between the header and the device, less half the
 * copy's own 120px — but those resolve to plain constants, so the text sits
 * where it always did over artwork that now supplies its own device.
 */
/**
 * How far the scene falls behind the page over one stage height, as a share of
 * that height — so the background leaves at 65% of scroll speed. It reads as a
 * percentage of the stage because both parallax targets are stage-sized boxes.
 *
 * It can go up to (but not reach) 100 without opening a gap. The bare strip the
 * scene leaves behind its top edge travels at HERO_LAG% of scroll while the
 * stage's own top leaves at 100%, so that strip stays above the viewport the
 * whole way; at the foot the scene simply hangs further past the stage than it
 * already did.
 */
const HERO_LAG = 35;

export default function Fold01() {
  return (
    <Section fold="01">
      <HeroMotion>
        {/*
         * The stage takes its height from whichever plate is showing.
         *
         * Below the 640px switch the height is an `aspect-ratio`, and it is
         * deliberately not derived from the viewport. It used to be
         * `min(calc(100vw * 2.11940), 82dvh)` — the plate's own 2556/1206
         * ratio, capped — which measured correctly in Chrome and resolved to
         * something else entirely on iOS Safari: the fold came out around 383px
         * tall on a 402px-wide phone, so `object-cover` cropped 55% of the
         * plate and blew the phone up past the frame. Mixing a `vw`-derived
         * `calc()` with `dvh` inside `min()` is what made it fragile, so none
         * of that is left: `aspect-[1206/2280]` is width over height and
         * nothing else, which every browser resolves the same way.
         *
         * 2280 rather than the plate's own 2556 is the crop. Paired with
         * `object-bottom` on the image it takes the difference off the sky at
         * the top and keeps the phone and the penguin on the fold's foot.
         *
         * 2280 is the shortest crop the composition survives, and the phone
         * painted into the plate is what sets it. Its bezel sits at 55.5% of
         * the asset's height, so cropping off the top raises it: at 1206/1900
         * the fold was 633px and the phone's top landed at 254px, 33px above
         * where the subtitle ends — the copy sat on the bezel. 2280 puts the
         * fold at 760px and the phone's top at 381px, which leaves 94px of
         * clear sky between the copy and the phone for the 68px moon to sit
         * in. `min-[640px]:aspect-auto` hands the fixed heights back.
         *
         * `min-[640px]` puts the fixed heights back from the point the
         * landscape asset takes over — the ratio above would give a 1229px
         * stage at 639px wide, which is right for a portrait plate and absurd
         * for a landscape one.
         *
         * From `desktop-sm` the hero is the viewport instead: one screen, top
         * to bottom, with the fixed 50px header over its own top edge rather
         * than pushing it down. That replaced a fixed 800px, the 1440
         * artboard's height, which only read correctly at that one size — a
         * 2560x1400 window is 3.2:1 against 800px, and `object-cover` threw
         * away 44% of the artwork's height to fill it. Full height tracks the
         * desktop asset's 1.802 far more closely: 1.3% cropped at 1920x1080
         * and 1.5% at 2560x1400, against 11% at 1440x900.
         *
         * `dvh` rather than `vh` so collapsing mobile browser chrome cannot
         * leave a strip under it.
         */}
        <div className="relative aspect-[1206/2280] w-full overflow-hidden bg-[#0d0d0d] min-[640px]:aspect-auto min-[640px]:h-[610px] tablet:h-[700px] desktop-sm:h-[100dvh]">
          {/*
           * Everything that makes up the scene sits in one shifted group so it
           * moves as a unit. The phone is only a screen overlay sitting on the
           * device photographed into the plate, so nudging it alone would slide
           * it off that device — the plate has to travel with it, and the copy
           * with both to keep the composition's spacing.
           *
           * How far this can travel is set by the plate's overhang above the
           * stage, and the tablet breakpoint is the tight one: its plate is
           * 798px against a 700px stage, so it starts only 38px high. 34px of
           * that is spent here, which leaves 4px in hand — going much further
           * would expose the stage's black along the top edge at 768px before
           * anywhere else.
           *
           * The bottom fades stay outside the group: they blend the stage into
           * the next fold and are anchored to its bottom edge, so moving them
           * would pull the fade's end up off the boundary.
           */}
          {/* `absolute inset-0` is load-bearing: the transform makes this a
              containing block for the absolutely-positioned children, so
              without it they would size against a zero-height div and the
              plate's `inset-0` and the phone's percentage top would both
              collapse to the stage's top edge. */}
          <div className="absolute inset-0 tablet:translate-y-[34px]">
            {/*
             * The scene behind the copy lags the scroll, so Fold 02 rises over
             * a background that is still on its way out.
             *
             * It is two layers rather than one because the copy has to sit
             * between them in paint order, exactly as it did before: plate and
             * moon under it, phone over it. Both carry the same numbers, which
             * is the constraint HeroMotion documents — the phone is only a
             * screen overlay on the device photographed into the plate, so any
             * difference between the two slides the lit screen off the device.
             *
             * The copy is deliberately left out of both, in the flow: that is
             * what keeps it leaving at the page's own speed, together with
             * Fold 02, while the scene behind it falls back.
             *
             * Each trigger is an untransformed stage-sized box and only the
             * target inside it moves, so ScrollTrigger never measures an
             * element it is also animating.
             */}
            <div
              data-parallax="trigger"
              data-parallax-start="0"
              data-parallax-end={HERO_LAG}
              data-parallax-scroll-start="top top"
              data-parallax-scroll-end="bottom top"
              className="pointer-events-none absolute inset-0"
            >
              <div data-parallax="target" className="absolute inset-0">
                {/* ---------- background plate ---------- */}
                {/*
                 * Both assets are finished compositions — the landscape, the
                 * penguin and the phone are all painted into them — so each is
                 * simply the fold itself, laid full-bleed and framed by
                 * `object-cover`. That replaces the oversized, offset boxes
                 * this fold used to need (mobile 247% wide at -73.8%, desktop
                 * 114% at -6.8%): those numbers existed to line a live overlay
                 * up with a device photographed into the plate, and there is no
                 * overlay left to line up.
                 *
                 * The swap is at 640px rather than `tablet`, and it is the
                 * stage's height that makes it work: below 640 the stage
                 * follows the portrait asset's 1206x2319 exactly, so
                 * `object-cover` has nothing to crop there. Above it the stage
                 * is a fixed height and the landscape asset is the one that
                 * suits it.
                 *
                 * 640 is about the narrowest the landscape can go before its
                 * own 42% horizontal crop starts eating the penguin at the
                 * left, which is what sets the floor. Cropping the landscape
                 * sideways is the cheap direction anyway — it keeps the sky the
                 * copy sits on and the phone below it.
                 */}
                {/*
                 * `top`/`bottom` rather than a translate: the group above
                 * nudges the whole scene down 34px from `tablet` up, which the
                 * old plate absorbed with its negative overhang and a
                 * full-bleed one does not — it left 34px of the stage's own
                 * black across the top. Cancelling it here keeps the artwork
                 * flush with the stage while the copy stays where the nudge
                 * puts it. It cannot be a `-translate-y`: GSAP writes this
                 * node's `transform` for the entrance and would wipe it.
                 */}
                {/*
                 * Past 1920 the plate lifts 40px: `top` goes to -74 while
                 * `bottom` stays at 34, which makes the box 40px taller and
                 * puts its top 40px higher. After the group's +34 the box runs
                 * -40 to the stage's own foot, so it still covers the stage —
                 * pulling the plate up without opening the stage's black along
                 * the bottom, which a plain shift would have done.
                 *
                 * Only the plate moves. The copy above has its own `top` and
                 * the moon is off by then, so the scene lifts under them.
                 */}
                <div
                  data-hero="bg"
                  className="absolute inset-0 tablet:top-[-34px] tablet:bottom-[34px] desktop-xl:top-[-74px]"
                >
                  <Image
                    src="/fold-one/bg-image-mobile.png"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-bottom min-[640px]:hidden"
                  />
                  <Image
                    src="/fold-one/bg-image-desktop.png"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="hidden object-cover object-center min-[640px]:block"
                  />
                </div>

                {/* ---------- small moon (mobile only; the desktop moon is in the plate) ---------- */}
                <Image
                  src="/images/fold01/hero-moon.png"
                  alt=""
                  width={204}
                  height={190}
                  priority
                  aria-hidden="true"
                  // `top` in px, not the artboard's 37.574%. That percentage was a share
                  // of a stage that used to be 833px tall; once the stage is capped
                  // it shrinks with the viewport and the moon rode up into the
                  // subtitle — 52px into it on a 360x761 screen. The copy ends at
                  // 287px at every mobile size (its own `top` is px-based too), so
                  // 312 clears it by 25px and still sits inside the shortest stage
                  // this cap produces.
                  className="absolute top-[300px] left-[77.519%] h-auto w-[16.911%] min-[640px]:hidden"
                />
              </div>
            </div>

            {/* ---------- copy ---------- */}
            {/*
             * Past 1920 the copy is centred in the gap between the header and
             * the phone rather than sitting on a fixed offset.
             *
             * The phone is painted into the plate, so its position has to be
             * read off the asset: its top edge is at 50.3% of the image's own
             * height. Resolved through `object-cover` against a 100dvh stage,
             * that midpoint sits at a near-constant 26.3% of the stage — 26.6%
             * at 1921x1080 through 26.1% at 2880x1620 — so the percentage is
             * what tracks it.
             *
             * The 137.5px comes off it because `top` positions the block's top,
             * not its centre: 103.5 is half the block's own height at these
             * sizes (two 84px lines, a 9px gap and a 30px subtitle), and 34 is
             * the shift the scene group adds. It has to move with the type —
             * it was 122.5 while the title was 68px.
             */}
            <div
              data-hero="copy"
              className="absolute top-[min(168.5px,calc(220.25px-13.091vw))] right-0 left-0 flex flex-col items-center gap-[12px] px-5 tablet:top-[92px] desktop-sm:top-[98px] desktop-sm:gap-[9px] desktop-xl:top-[calc(26.3%-137.5px)]"
            >
              {/* `max-w` grows with the type past 1920 — 527px holds
                  "Everyday tasks" on one line at 60px and would break it at
                  68px, which 600 clears. */}
              <h1 className="max-w-[355px] text-center text-[40px] leading-[43px] font-bold text-white max-mobile-sm:text-[35px] max-mobile-sm:leading-[38px] tablet:max-w-[440px] tablet:text-[48px] tablet:leading-[52px] desktop-sm:max-w-[527px] desktop-sm:text-[60px] desktop-sm:leading-[62px] desktop-xl:max-w-[720px] desktop-xl:text-[80px] desktop-xl:leading-[84px]">
                <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                  <span data-hero-line className="block">
                    Everyday tasks
                  </span>
                </span>
                <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                  <span data-hero-line className="block">
                    made easy
                  </span>
                </span>
              </h1>

              <p className="overflow-hidden pb-[0.14em] -mb-[0.14em] text-center text-[16px] leading-[20px] text-white tablet:text-[20px] tablet:leading-[24px] desktop-sm:text-[24px] desktop-sm:leading-[26px] desktop-xl:text-[28px] desktop-xl:leading-[30px]">
                <span data-hero-line className="block">
                  Through apps that people love
                </span>
              </p>
            </div>

          </div>

          {/* ---------- bottom fade into the next fold ---------- */}
          <div
            aria-hidden="true"
            // Artboard's own foot gradient (1326:5972): a 407px band starting
            // at 58% of the stage, opaque black at its bottom and clear by
            // 81.7% of the way up. It runs past the stage's foot, so on screen
            // it only ever reaches about 55% — the previous full-strength fade
            // from 56% is what buried the lower half of the phone.
            className="pointer-events-none absolute inset-x-0 top-[58.033%] h-[66.721%] min-[640px]:hidden"
            style={{
              backgroundImage: "linear-gradient(to top, #000000 0%, rgba(0,0,0,0) 81.7%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden min-[640px]:block"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, transparent 82.5%, rgba(0,0,0,0.93) 100%)",
            }}
          />
        </div>
      </HeroMotion>
    </Section>
  );
}
