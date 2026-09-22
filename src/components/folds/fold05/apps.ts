/**
 * Fold 05 — the four app panels in the scroll stack.
 *
 * Each background is a pre-composed scene exported from Figma at 4x the
 * 1440x886 artboard (the room/park/lounge/bedside shot plus the phone and its
 * floating UI panels, all baked in), so a panel is just its scene plus the
 * frosted card.
 *
 * The four cards are deliberately not the same shape — Steppy swaps the CTA for
 * a "Coming soon" badge and adds a feature list, Volume Control carries a
 * pull-quote, White Noise has both a CTA and features. Each block below is
 * optional, and the card renders whatever is present.
 *
 * Figma sources: 1136:3208 (Find My Phone), 1136:3261 (Steppy),
 * 1136:3064 (Volume Control), 1136:2679 (White Noise).
 */

export interface Feature {
  /** SVG basename in `public/images/fold05/icons/`. */
  icon: string;
  text: string;
}

export interface AppPanel {
  id: string;
  /** Pre-composed scene behind the card. */
  background: string;
  /**
   * The scene's own average colour, painted on the card underneath it.
   *
   * The card used to have no ground of its own, so until a scene decoded the
   * section's white showed through — full-panel white rectangles tearing over
   * the stack as it scrolled. These are sampled from each scene (a 1x1
   * resample), so the gap now reads as the photo dimming rather than as a
   * hole in the page.
   */
  ground: string;
  /**
   * Horizontal focal point of the scene, as a percentage of its width.
   *
   * The scenes are landscape (1.625) and the mobile panel is portrait (~0.46),
   * so `object-cover` only ever shows a ~28%-wide window of the source. Where
   * that window sits has to follow each scene's device, which is composed in a
   * different place every time (measured off the source art):
   *
   *   image-1  phone 57–79%    image-2  phone 58–78%
   *   image-3  phone 57–79%    image-4  phone 57–78%
   *
   * A single shared value sliced the White Noise phone clean in half.
   * Desktop is unaffected — there the scene is centred and barely cropped.
   */
  mobileFocal: string;
  /** App icon shown on the frosted card. */
  icon: string;
  title: string;
  /** Lead-in line. Volume Control doesn't have one. */
  question?: string;
  description: string;
  /** Steppy is unreleased, so it shows a badge instead of a CTA. */
  cta?: { label: string; href: string };
  badge?: string;
  /** Volume Control carries a review quote above its stats. */
  quote?: string;
  features?: Feature[];
  stats?: { downloads: string; rating: string };
}

export const APP_PANELS: AppPanel[] = [
  {
    id: "find-my-phone",
    background: "/images/image-1.webp",
    ground: "#897b6a",
    mobileFocal: "68%",
    icon: "/images/fold03/icon-05.jpg",
    title: "Find My Phone",
    question: "Can't find your phone when you need it most?",
    description:
      "Find My Phone helps you quickly find your phone by clapping or whistling.",
    cta: { label: "Learn More", href: "#fold-05" },
    stats: { downloads: "1M+", rating: "4.5" },
  },
  {
    id: "steppy",
    background: "/images/image-2.webp",
    ground: "#5c5839",
    // Re-composed like image-4: the phone moved right, 55–72% to 58–78%, so
    // the window centres at 68% rather than 64%.
    mobileFocal: "68%",
    icon: "/images/apps/steppy.png",
    title: "Steppy",
    question: "Need a push to start walking more?\nWalk with Steppy.",
    description:
      "Turn your steps into real rewards, the more you walk, the more you can earn.",
    badge: "Coming soon",
    features: [
      { icon: "ic-footprints", text: "Track your daily steps" },
      { icon: "ic-coins", text: "Earn coins for hitting achievable milestones" },
      { icon: "ic-gift", text: "Redeem your coins for gift cards from your favorite brands" },
    ],
  },
  {
    id: "volume-control",
    background: "/images/image-3.webp",
    ground: "#2f2015",
    mobileFocal: "66%",
    icon: "/images/fold03/icon-02.jpg",
    title: "Volume Control",
    question: "Tired of not knowing how to set ringtone, alarm, or text volumes?",
    description:
      "Easily control all your volume settings in one place with Volume Control Launcher.",
    cta: { label: "Learn More", href: "#fold-05" },
    quote:
      "“Great app! I can control all my app volumes separately and the boost is incredible!”",
    stats: { downloads: "1M+", rating: "4.5" },
  },
  {
    id: "white-noise",
    background: "/images/image-4.webp",
    ground: "#3e302f",
    // 67%, not the 80% the old art wanted: this scene was re-composed and the
    // phone sits left of where it used to. Centred on the phone rather than on
    // the panels beside it, which is what the ~28% mobile window has room for.
    mobileFocal: "67%",
    icon: "/images/fold03/icon-15.jpg",
    title: "White Noise",
    question: "Your Sound. Your Calm.",
    description:
      "Find your calm with soothing sounds designed to help you sleep, focus, and unwind.",
    cta: { label: "Learn More", href: "#fold-05" },
    features: [
      { icon: "ic-headphones", text: "Relax with soothing white noise and calming audio." },
      { icon: "ic-sliders", text: "Choose from white noise, nature sounds, ambient audio, and more." },
      { icon: "ic-clock", text: "Set sounds to automatically stop after you fall asleep." },
    ],
  },
];
