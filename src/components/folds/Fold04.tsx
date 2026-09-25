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
  // Past 1920 the whole section — its background included — is held to the
  // nav's own edges, rather than only the copy inside it.
  // `--content-max-width` less the 40px gutters is exactly the header's
  // content row, so the two share a left and right edge.
  //
  // The band is `bg-white` on a white page, so today this moves an edge you
  // cannot see; it matters the moment the fold takes a colour of its own.
  return (
    <Section
      fold="04"
      className="mx-auto bg-white py-[var(--fold-gap-y)] desktop-xl:max-w-[calc(var(--content-max-width)-80px)]"
    >
      {/* No parallax on this band, deliberately.
          *
          * It used to be a `data-parallax` trigger drifting +-14%. That put a
          * permanently promoted layer — GlobalParallax sets `will-change:
          * transform` once and never clears it — directly above Fold 05, whose
          * four sticky panels are full-viewport composited layers of their own.
          * The result was white tiles tearing across the app stack while
          * scrolling: visible on production, never on localhost.
          *
          * Bisected on a preview build with GlobalParallax unmounted entirely,
          * which was clean. This band is the one trigger adjacent to the stack,
          * so it is the one that comes out; every other fold keeps its drift.
          *
          * If the tearing ever comes back, Fold 06's trigger is the next
          * suspect — it activates while the last panel is still on screen. */}
      <Reveal
        variant="stagger"
        // `px-0` past 1920: the section itself is already on the nav's edges
        // by then, so the gutter here would inset the copy a second time.
        className="mx-auto max-w-[var(--content-max-width)] px-5 text-center tablet:px-10 desktop-xl:px-0"
      >
        <h2 className="text-[28px] leading-[34px] font-normal text-[#111111] tablet:text-[50px] tablet:leading-[60px] tablet:text-black tablet:capitalize">
          {/* Mobile breaks after "apps" so the second line reads "for
              different needs" instead of orphaning "needs" on its own. The
              spans go inline again on desktop, where it sets as one line. */}
          <span className="block tablet:inline">Different apps </span>
          <span className="block tablet:inline">for different needs</span>
        </h2>

        <p className="mt-3 text-[15px] leading-[20px] text-[#61616a] tablet:mt-[38px] tablet:text-[clamp(16px,calc(var(--locked-vw)*0.0201),29px)] tablet:leading-[1.31] tablet:font-normal tablet:text-black">
          <span className="tablet:hidden">Thoughtful designs built for real needs</span>
          <span className="hidden tablet:inline">
            Thoughtful designs create better experiences
          </span>
        </p>
      </Reveal>
    </Section>
  );
}
