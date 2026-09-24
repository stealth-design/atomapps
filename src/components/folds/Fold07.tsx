import Image from "next/image";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { OverlayVideo } from "@/components/ui/OverlayVideo";
import { TestimonialCard } from "@/components/folds/fold07/TestimonialCard";
import { MarqueeMotion } from "@/components/folds/fold07/MarqueeMotion";
import { DESKTOP_COLUMNS, MOBILE_ROWS } from "@/components/folds/fold07/testimonials";

/**
 * Fold 07 — Testimonials
 *
 * Figma (canvas `----> v7`):
 *   desktop  1136:2631  1440 x 757
 *   mobile   1136:2451   393 x 729
 *
 * Heading on the left, quotes on the right. Desktop runs two columns that
 * drift vertically in opposite directions — Figma names them
 * "masonry-track-1/2" and fades their last card, which is how a mockup shows a
 * moving list. Mobile runs the same six quotes as two rows drifting sideways,
 * also in opposite directions, rather than the artboard's single static
 * column.
 */
/**
 * Softens the top and bottom of the vertical columns.
 *
 * The bottom stop is 98% rather than 100% so the fade finishes just clear of
 * the container's edge: at 100% half-faded card text ran right up to Fold
 * 08's gap, which is what made that boundary read as tight. It cannot go much
 * further than this, though — the white band a viewer actually sees was
 * measured against the fade stop, and because the cards are drifting it
 * varies with them:
 *
 *    100% -> 67px    98% -> 78px    96% -> 91px    93% -> 120px
 *
 * against ~62px at every other boundary after Fold 04. 98% keeps this one in
 * that company while still ending cleanly; 93% made it the widest gap on the
 * page by a factor of two.
 */
const EDGE_FADE =
  "linear-gradient(to bottom, transparent 0%, #000 7%, #000 92%, transparent 98%)";

/** Softens the left and right ends of the horizontal rows. */
const ROW_FADE =
  "linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%)";

export default function Fold07() {
  return (
    <Section fold="07" className="bg-white">
      {/* Bottom gap only. Every fold after 04 carries the inter-fold space on
          its bottom edge alone, so each boundary is exactly one
          --fold-gap-y: two folds each contributing the token would double it,
          which is what made the run of boundaries here uneven (60/60/120/120/60
          on desktop). The space above this fold comes from Fold 06's bottom. */}
      <div className="px-5 pt-[60px] pb-[var(--fold-gap-y)] tablet:px-16 desktop-sm:pt-[160px]">
        <div className="mx-auto flex max-w-[var(--content-max-width)] flex-col desktop-md:flex-row desktop-md:gap-[64px]">
          {/* ---------- heading ---------- */}
          {/* The quote tracks beside this are already drifting, so the heading
              drifts against them — the column sizing moves to the trigger so
              the wrapper is a layout no-op. Off below `tablet`, where the
              heading sits above the quotes rather than beside them and the
              two would just move together.

              The percentage is small because this box is not the size it
              looks: as a flex child it stretches to the row's full 645px, not
              the ~300px the type occupies, so 5% here is the ~32px it reads
              as. Anything near the 20% default slid the heading clean out of
              line with the quotes. */}
          {/* The heading used to drift +-5% here on a `data-parallax`
              trigger. Parallax is the hero's alone now — see Fold 04 and
              Fold 06, both dropped for the tearing they caused over Fold
              05's sticky stack. */}
          <div className="desktop-md:w-[460px] desktop-md:shrink-0">
            <Reveal variant="stagger">
              {/* Mobile runs it as one sentence that simply wraps, with no
                  forced breaks and no subtext under it. The two colours are the
                  artboard's: near-black lead-ins, #2774c1 on the two nouns. */}
              <h2 className="text-[26px] leading-[34px] font-normal text-[#111116] tablet:hidden">
                Millions of <span className="text-[#2774c1]">Downloads.</span> Millions of{" "}
                <span className="text-[#2774c1]">Experiences.</span>
              </h2>

              {/* tablet up keeps the artboard's two stacked blocks */}
              <h2 className="hidden text-[26px] leading-[27px] font-normal text-[#111116] tablet:block tablet:text-[44px] tablet:leading-[51px]">
                <span className="block">
                  Millions of
                  <br />
                  <span className="text-[#2774c1]">Downloads.</span>
                </span>
                <span className="mt-[16px] block tablet:mt-[18px]">
                  Millions of
                  <br />
                  <span className="text-[#2774c1]">Experiences.</span>
                </span>
              </h2>

              <p className="mt-[29px] hidden max-w-[275px] text-[15px] leading-[23px] text-[#61616a] tablet:block tablet:text-[16px] tablet:leading-[24px]">
                Real reviews from users who use our apps everyday.
              </p>

              {/* The rabbit, filling the column under the subtext.
                *
                * `desktop-md` only, which is the one breakpoint where this
                * column stands beside the quotes and therefore has height to
                * spare — below it the heading sits above the quotes and there
                * is no empty column to fill, so the mascot would only push the
                * cards down.
                *
                * 310px against the column's 460, set well in from the type's
                * left edge. The column has the room either way, and the inset
                * keeps the mascot from crowding the quotes beside it. */}
              {/*
               * The still is the poster and the video lays over it — see
               * OverlayVideo. Until the file is decoded and genuinely playing,
               * the fold looks exactly as it did with the still alone.
               *
               * The geometry is the awkward part, because the two assets frame
               * the rabbit differently. Both were measured rather than guessed:
               *
               *   still  drawn 310 wide; the rabbit reads 304 x 392 in that box,
               *          its feet on 409
               *   video  1112x834. The rabbit is a squash-and-stretch idle, so
               *          it has no one size — sampled across the 8.1s loop it
               *          runs 424-503 wide and 697-736 tall. What does not move
               *          is the floor: its feet sit on y=783 in every frame.
               *
               * So the two are matched on the things that hold still. The
               * resting height, ~700, is scaled to the still's 392 (k = 0.56),
               * which puts the video at 623x467, and the offsets below drop its
               * y=783 onto the still's 409 and centre the two horizontally. At
               * rest the rabbit lands 280 x 392 against the still's 304 x 392:
               * the same height and feet, 8% narrower. Every frame of the loop
               * stays inside the box, the widest at 11-293 and the tallest
               * reaching y=0 with 43 to spare at the foot.
               *
               * The wrapper keeps the still's own 310x455 box and clips: the
               * white frame around the rabbit never reaches the paragraph above
               * or the quotes beside.
               *
               * `max-w-none` because the base stylesheet caps every video at
               * `max-width: 100%`, which would clamp the box back to the
               * wrapper and shrink the rabbit.
               *
               * `brightness-[1.03]` because the video's ground is not the
               * fold's white: sampled off a decoded frame it is (250, 251,
               * 253), a blue-tinted off-white that reads as a pale rectangle
               * against the #fff behind it. 1.03 lifts 250 past 255, so the
               * ground clips to pure white and the edge disappears. It is the
               * smallest factor that does it, and the rabbit's own mid-tones
               * move by 3%, which is not perceptible.
               *
               * `preload="none"` because the file is 6MB and this only renders
               * from 1280px up: nothing is fetched until the observer asks to
               * play, so no phone, and no reader who stops short of this fold,
               * pays for it.
               */}
              <div className="relative mt-[32px] ml-[64px] hidden h-[455px] w-[310px] overflow-hidden desktop-md:block">
                <Image
                  src="/images/rabbit.webp"
                  alt=""
                  width={2934}
                  height={4305}
                  aria-hidden="true"
                  sizes="310px"
                  className="h-full w-full"
                />
                <OverlayVideo
                  src="/videos/rabbit.mp4"
                  loop
                  preload="none"
                  className="absolute top-[-26px] left-[-122px] h-[467px] w-[623px] max-w-none brightness-[1.03]"
                />
              </div>
            </Reveal>
          </div>

          {/* ---------- quotes ---------- */}
          <div className="mt-[24px] min-w-0 flex-1 tablet:mt-[40px] desktop-md:mt-0">
            {/* mobile: two rows drifting sideways in opposite directions.
                Each row bleeds past the page gutter so cards run to both
                screen edges, with the edges masked so they arrive and leave
                softly rather than popping at a hard cut. */}
            <MarqueeMotion>
              <div className="-mx-5 flex flex-col gap-[10px] tablet:hidden">
                {MOBILE_ROWS.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="overflow-hidden"
                    style={{ maskImage: ROW_FADE, WebkitMaskImage: ROW_FADE }}
                  >
                    <div
                      data-f07-track={rowIndex === 0 ? "left" : "right"}
                      className="flex w-max will-change-transform"
                    >
                      {/* Doubled so a -50% shift lands copy two exactly where
                          copy one began. Spacing is a right margin per card,
                          not a flex gap — a gap would make the track two
                          copies PLUS one gap wide and the loop would slip. */}
                      {[...row, ...row].map((testimonial, index) => (
                        <div
                          key={`${testimonial.id}-${index}`}
                          className="w-[262px] shrink-0 pr-[10px]"
                          aria-hidden={index >= row.length || undefined}
                        >
                          <TestimonialCard testimonial={testimonial} clone={index >= row.length} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </MarqueeMotion>

            {/* desktop: two columns drifting in opposite directions.
                Each track holds its cards twice so a -50% shift loops
                seamlessly; the edges are masked rather than fading a single
                card, since with motion a fixed faded card would scroll past. */}
            <MarqueeMotion>
              <div
                className="hidden h-[645px] items-start gap-[24px] overflow-hidden tablet:flex"
                style={{
                  maskImage: EDGE_FADE,
                  WebkitMaskImage: EDGE_FADE,
                }}
              >
                {DESKTOP_COLUMNS.map((column, columnIndex) => (
                  <div
                    key={columnIndex}
                    data-f07-track={columnIndex === 0 ? "up" : "down"}
                    className="flex-1 will-change-transform"
                  >
                    {/* Spacing is a bottom margin on every card, not a flex gap:
                        a gap would make the track 2 copies PLUS one gap tall, so
                        a -50% shift would slip by half a gap each cycle. */}
                    {[...column, ...column].map((testimonial, index) => (
                      <div
                        key={`${testimonial.id}-${index}`}
                        className="pb-[16px]"
                        aria-hidden={index >= column.length || undefined}
                      >
                        <TestimonialCard testimonial={testimonial} clone={index >= column.length} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </MarqueeMotion>
          </div>
        </div>
      </div>
    </Section>
  );
}
