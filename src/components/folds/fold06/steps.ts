/**
 * Fold 06 — Our Approach.
 *
 * Figma: desktop 1153:8675 (1440x1009), mobile 1136:1991 (393x906).
 * Cards rebuilt from 1792:53548 — 364x488, an illustration across the top and
 * the copy beneath. Desktop lays them in a row, mobile scrolls them.
 */

export interface ApproachStep {
  id: string;
  title: string;
  body: string;
  /** Figma's body text width — each card wraps its copy at its own measure. */
  bodyWidth: number;
  /**
   * Card illustration in `public/images/fold06/`, exported from Figma at 2x.
   * Each is the card's top 364x356, already faded to the card's white.
   */
  image: string;
}

export const APPROACH_STEPS: ApproachStep[] = [
  {
    id: "find-the-need",
    title: "Find the Need",
    body: "We start by identifying a real problem, frustration, or task that technology can make easier.",
    bodyWidth: 333,
    image: "/images/fold06/find-the-need.png",
  },
  {
    id: "design-around-it",
    title: "Design Around It",
    body: "We focus on the features that matter most and build an experience that feels intuitive and easy to use.",
    bodyWidth: 293,
    image: "/images/fold06/design-around-it.png",
  },
  {
    id: "keep-making-it-better",
    title: "Keep Making It Better",
    body: "We learn from how people use our apps and continue refining the experience over time.",
    bodyWidth: 345,
    image: "/images/fold06/keep-making-it-better-lg-phone.png",
  },
];
