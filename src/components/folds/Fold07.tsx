import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCard } from "@/components/folds/fold07/TestimonialCard";
import { MarqueeMotion } from "@/components/folds/fold07/MarqueeMotion";
import { DESKTOP_COLUMNS, MOBILE_COLUMN } from "@/components/folds/fold07/testimonials";

/**
 * Fold 07 — Testimonials
 *
 * Figma (canvas `----> v7`):
 *   desktop  1136:2631  1440 x 757
 *   mobile   1136:2451   393 x 729
 *
 * Heading on the left, quotes on the right. Desktop runs two columns that
 * drift in opposite directions — Figma names them "masonry-track-1/2" and
 * fades their last card, which is how a mockup shows a moving list. Mobile
 * shows a different three in one static column, clipped at 411px with a white
 * gradient over the foot, exactly as the mobile artboard has it.
 */
/** Softens the top and bottom of the drifting columns. */
const EDGE_FADE =
  "linear-gradient(to bottom, transparent 0%, #000 7%, #000 88%, transparent 100%)";

export default function Fold07() {
  return (
    <Section fold="07" className="bg-white">
      <div className="px-5 py-[var(--fold-gap-y)] tablet:px-16">
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
            {/* mobile: one clipped column with a fade at its foot */}
            <div className="relative h-[411px] overflow-hidden tablet:hidden">
              <div className="flex flex-col gap-[8px]">
                {MOBILE_COLUMN.map((testimonial, index) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    faded={index === MOBILE_COLUMN.length - 1}
                  />
                ))}
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[108px]"
                style={{
                  backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0), #ffffff)",
                }}
              />
            </div>

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
