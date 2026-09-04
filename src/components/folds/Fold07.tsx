import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
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
/** Softens the top and bottom of the vertical columns. */
const EDGE_FADE =
  "linear-gradient(to bottom, transparent 0%, #000 7%, #000 88%, transparent 100%)";

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
      <div className="px-5 pb-[var(--fold-gap-y)] tablet:px-16">
        <div className="mx-auto flex max-w-[var(--content-max-width)] flex-col desktop-md:flex-row desktop-md:gap-[64px]">
          {/* ---------- heading ---------- */}
          <Reveal variant="stagger" className="desktop-md:w-[460px] desktop-md:shrink-0">
            <h2 className="text-[26px] leading-[27px] font-extrabold text-[#111116] tablet:text-[44px] tablet:leading-[51px]">
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

            <p className="mt-[29px] max-w-[275px] text-[15px] leading-[23px] text-[#61616a] tablet:text-[16px] tablet:leading-[24px]">
              Real feedback from teams and users who ship faster with Atom.
            </p>
          </Reveal>

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
                          <TestimonialCard testimonial={testimonial} />
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
                        <TestimonialCard testimonial={testimonial} />
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
