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
 */
export default function Fold05() {
  return (
    <Section fold="05" className="bg-white">
      <StackMotion>
        {APP_PANELS.map((panel, index) => (
          <div key={panel.id} className="sticky top-0 h-svh min-h-[640px] w-full">
            <AppCard panel={panel} index={index} />
          </div>
        ))}
      </StackMotion>
    </Section>
  );
}
