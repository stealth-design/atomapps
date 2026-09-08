import { Section } from "@/components/ui/Section";
import { AppCard } from "@/components/folds/fold05/AppCard";
import { StackMotion } from "@/components/folds/fold05/StackMotion";
import { APP_PANELS } from "@/components/folds/fold05/apps";

/**
 * Fold 05 — App showcase stack
 *
 * Figma (canvas `----> v7`):
 *   desktop  1136:3208  1440 x 886   (the single Find My Phone panel)
 *   mobile   1136:1127   393 x 846
 *
 * Four panels — one per app scene — stacked as a scroll interaction: each is
 * sticky at the top of a tall section, so scrolling brings the next panel up
 * over the one before it while that one recedes. The section is therefore
 * `panels x 100svh` tall.
 *
 * Card geometry still comes from the Figma artboard; only the container is now
 * a viewport-height panel rather than a fixed 886px band.
 *
 * The stack carried no bottom space, so the gap into Fold 06 was only that
 * fold's own top padding — one --fold-gap-y, 60px on desktop, where every
 * other boundary on the page gets two. The `pb` below adds the missing half,
 * which puts this boundary on the same 2x as the rest.
 */
export default function Fold05() {
  return (
    <Section fold="05" className="bg-white pb-[calc(var(--fold-gap-y)*2)]">
      <StackMotion>
        {APP_PANELS.map((panel, index) => (
          <div
            key={panel.id}
            // Past 1920 the panel — photo and all — is held to the nav's own
            // edges, which is also what finally reveals the card's own corner
            // radius: full-bleed, those corners sat off screen.
            //
            // `h-auto` there too, so the panel is the card plus one --fold-gap-y
            // top and bottom rather than a full 100dvh. Once the card took the
            // reference's 1.623 it no longer filled a viewport-height panel, and
            // centring it left 281px of blank panel above the card at 2560 —
            // read as a gap between this fold and the heading above it. Sizing
            // the panel to its contents removes the slack rather than moving it
            // below the card.
            className="sticky top-0 mx-auto h-svh min-h-[640px] w-full desktop-xl:flex desktop-xl:h-auto desktop-xl:max-w-[calc(var(--content-max-width)-80px)] desktop-xl:items-center desktop-xl:py-[var(--fold-gap-y)]"
          >
            <AppCard panel={panel} index={index} />
          </div>
        ))}
      </StackMotion>
    </Section>
  );
}
