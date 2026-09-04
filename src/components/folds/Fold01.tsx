import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { HeroMotion } from "@/components/folds/fold01/HeroMotion";
import { HeroPhone } from "@/components/folds/fold01/HeroPhone";

/**
 * Fold 01 — Hero
 *
 * Figma (canvas `----> v7`):
 *   desktop  1136:2593  1440 x 800
 *   mobile   1136:1088   393 x 761
 *
 * Layout notes: every offset below is the design measurement expressed as a
 * percentage of the artboard, so the composition holds at any viewport width.
 * The background plate is deliberately oversized and offset (desktop 1643x912
 * at -98,-44; mobile 976x910 at -292,-64) — that framing is part of the design.
 *
 * Mobile follows Figma 1326:5953 (395x610) exactly: plate, moon, copy, phone
 * and the foot gradient are that frame's own numbers, so the phone overlay and
 * the device photographed into the plate line up by construction rather than
 * by a shared nudge. That is why the shifted group below applies from `tablet`
 * up only.
 */
export default function Fold01() {
  return (
    <Section fold="01">
      <HeroMotion>
        <div className="relative h-[610px] w-full overflow-hidden bg-[#0d0d0d] tablet:h-[700px] desktop-sm:h-[800px]">
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
            {/* ---------- background plate ---------- */}
            <div data-hero="bg" className="absolute inset-0">
              <div className="absolute top-[-10.574%] left-[-73.797%] h-[149.18%] w-[247.114%] tablet:hidden">
                <Image
                  src="/images/fold01/hero-bg-mobile.jpg"
                  alt=""
                  fill
                  priority
                  sizes="250vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute top-[-5.5%] left-[-6.81%] hidden h-[114%] w-[114.1%] tablet:block">
                <Image
                  src="/images/fold01/hero-bg-desktop.jpg"
                  alt=""
                  fill
                  priority
                  sizes="115vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* ---------- soft light wash behind the phone (desktop only) ---------- */}
            <div
              aria-hidden="true"
              className="absolute top-[43.75%] left-[5.07%] hidden h-[51.75%] w-[89.86%] tablet:block"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 50% 50%, rgba(217,217,217,0.10) 0%, rgba(217,217,217,0) 70%)",
              }}
            />

            {/* ---------- small moon (mobile only; the desktop moon is in the plate) ---------- */}
            <Image
              src="/images/fold01/hero-moon.png"
              alt=""
              width={204}
              height={190}
              priority
              aria-hidden="true"
              className="absolute top-[37.574%] left-[77.519%] h-auto w-[16.911%] tablet:hidden"
            />

            {/* ---------- copy ---------- */}
            <div
              data-hero="copy"
              className="absolute top-[92px] right-0 left-0 flex flex-col items-center gap-[12px] px-5 desktop-sm:top-[68px] desktop-sm:gap-[9px]"
            >
              <h1 className="max-w-[355px] text-center text-[40px] leading-[43px] font-bold text-white tablet:max-w-[440px] tablet:text-[48px] tablet:leading-[52px] desktop-sm:max-w-[527px] desktop-sm:text-[60px] desktop-sm:leading-[62px]">
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

              <p className="overflow-hidden pb-[0.14em] -mb-[0.14em] text-center text-[16px] leading-[20px] text-white tablet:text-[20px] tablet:leading-[24px] desktop-sm:text-[24px] desktop-sm:leading-[26px]">
                <span data-hero-line className="block">
                  Through apps that people love
                </span>
              </p>
            </div>

            {/* ---------- phone mockup ---------- */}
            {/*
             * The screen overlay has to track the device photographed in the
             * background plate, and above ~1399px that device grows with the
             * viewport: the plate box is 114.1% wide by a fixed 912px tall, and
             * past that width `object-cover` switches from height- to
             * width-constrained, so the image scales by viewport width. A fixed
             * 312px overlay therefore drifted — by 1920 the device was a third
             * larger than the black screen sitting on it, and at 2560 the
             * overlay covered barely half of it.
             *
             * The three values below are the plate's own geometry solved for the
             * screen aperture, so they scale exactly with it (derived against
             * the 1344x768 asset, not Figma's 1643x912 layer):
             *
             *   width  312px at 1440  ->  21.6667vw
             *   left   plate left (-6.81vw) + aperture offset  ->  39.73vw
             *   top    plate top + half the vertical crop      ->  412px - 7.921vw
             *
             * Each is paired with the pre-crossover constant via min()/max(),
             * which switches over at ~1440 on its own. Explicit `left` rather
             * than a centring translate: GSAP owns this element's transform for
             * the entrance and parallax, and a Tailwind translate on the same
             * property gets folded into that on init and then never updates on
             * resize.
             */}
            <div
              data-hero="phone"
              className="absolute top-[min(287px,calc(390.5px-26.182vw))] left-[min(calc(49.76%-90.65px),26.828vw)] w-[max(186px,47.052vw)] tablet:top-[37.7%] tablet:left-[calc(50%-119px)] tablet:w-[250px] desktop-sm:top-[min(298px,calc(412px-7.921vw))] desktop-sm:left-[min(calc(50%-148px),39.73vw)] desktop-sm:w-[max(312px,21.6667vw)]"
            >
              <HeroPhone />
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
            className="pointer-events-none absolute inset-x-0 top-[58.033%] h-[66.721%] tablet:hidden"
            style={{
              backgroundImage: "linear-gradient(to top, #000000 0%, rgba(0,0,0,0) 81.7%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden tablet:block"
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
