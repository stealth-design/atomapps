import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Fold 04 — App Directory Heading
 *
 * Figma (canvas `----> v7`):
 *   desktop  1136:2627  1374 x 170, centred in the 1440 artboard
 *   mobile   1136:1124   393 x 176
 *
 * A plain type band that introduces the four app folds below. The artboard
 * leaves 169px above and 92px below it on desktop; on mobile that whitespace
 * is baked into the band itself (48px above the title, 24px below the
 * subtitle), so the padding differs per breakpoint rather than scaling.
 *
 * The two artboards diverge on the title's case and on the subtitle's wording
 * and colour, so both are kept — `display: none` keeps the unused subtitle out
 * of the accessibility tree.
 */
export default function Fold04() {
  return (
    <Section
      fold="04"
      className="bg-white py-[var(--fold-gap-y)]"
    >
      {/* Small numbers on purpose: this band is only ~120px tall, so the
          offset comes to a few pixels either way — enough to keep it from
          sitting dead still between two folds that move. */}
      <div data-parallax="trigger" data-parallax-start="8" data-parallax-end="-8">
        <Reveal
          variant="stagger"
          className="mx-auto max-w-[var(--content-max-width)] px-5 text-center tablet:px-10"
        >
          <h2 className="text-[28px] leading-[36px] font-bold text-[#111111] tablet:text-[clamp(38px,5vw,72px)] tablet:leading-[1.3] tablet:text-black tablet:capitalize">
            {/* Mobile breaks after "apps" so the second line reads "for
                different needs" instead of orphaning "needs" on its own. The
                spans go inline again on desktop, where it sets as one line. */}
            <span className="block tablet:inline">Different apps </span>
            <span className="block tablet:inline">for different needs</span>
          </h2>

          <p className="mt-3 text-[15px] leading-[20px] text-[#61616a] tablet:mt-[38px] tablet:text-[clamp(16px,2.01vw,29px)] tablet:leading-[1.31] tablet:font-semibold tablet:text-black">
            <span className="tablet:hidden">Thoughtful designs built for real needs</span>
            <span className="hidden tablet:inline">
              Thoughtful designs create better experiences
            </span>
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
