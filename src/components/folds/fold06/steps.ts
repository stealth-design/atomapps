/**
 * Fold 06 — Our Approach.
 *
 * Figma: desktop 1153:8675 (1440x1009), mobile 1136:1991 (393x906).
 * The three cards are identical between artboards (331x535 with the same inner
 * layout) — desktop lays them in a row, mobile scrolls them horizontally.
 */

export interface ApproachStep {
  id: string;
  /** Icon SVG basename in `public/images/fold06/`. */
  icon: string;
  title: string;
  body: string;
  /** Figma's body text width — card 1 is narrower than the other two. */
  bodyWidth: number;
  /** Illustration basename and its Figma box, drawn at the foot of the card. */
  illustration: { src: string; width: number; height: number };
}

export const APPROACH_STEPS: ApproachStep[] = [
  {
    id: "find-the-need",
    icon: "ic-heart",
    title: "Find the Need",
    body: "We start by identifying a real problem, frustration, or task that technology can make easier.",
    bodyWidth: 217,
    illustration: { src: "illus-need", width: 274, height: 280 },
  },
  {
    id: "design-around-it",
    icon: "ic-target",
    title: "Design Around It",
    body: "We focus on the features that matter most and build an experience that feels intuitive and easy to use.",
    bodyWidth: 253,
    illustration: { src: "illus-design", width: 274, height: 299 },
  },
  {
    id: "keep-making-it-better",
    icon: "ic-check",
    title: "Keep Making It Better",
    body: "We learn from how people use our apps and continue refining the experience over time.",
    bodyWidth: 253,
    illustration: { src: "illus-refine", width: 279, height: 272 },
  },
];
