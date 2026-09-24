/**
 * Fold 05 — the four app panels in the scroll stack.
 *
 * Each background is a pre-composed scene exported from Figma at 4x the
 * 1440x886 artboard (the room/park/lounge/bedside shot plus the phone and its
 * floating UI panels, all baked in), so a panel is just its scene plus the
 * frosted card.
 *
 * All four were re-shot and carry a version suffix. That suffix is not
 * decoration: everything under `/images/` is served `immutable` for a year
 * (see next.config.ts), so art replaced under the same name would never reach
 * anyone who already had the old one. Volume Control is already on `-v3` for
 * exactly that reason — its `-v2` had shipped before the next cut arrived.
 * Every revision needs the next number. `ground` and `mobileFocal` below were
 * re-measured off the current art.
 *
 * The four cards are deliberately not the same shape — the two unreleased apps
 * swap the CTA for a "Coming soon" badge, Volume Control carries a pull-quote,
 * Find My Phone has a CTA, features and stats. Each block below is optional,
 * and the card renders whatever is present.
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
   * so `object-cover` only ever shows a ~28%-wide window of the source, and
   * where that window sits has to follow each scene's device. It used to
   * differ per scene, because the old art composed the phone in a different
   * place every time and a single shared value sliced the White Noise one
   * clean in half. The new set is consistent: measured off all four, the
   * phone centres within half a percent of 67% in every one.
   *
   * Desktop is unaffected — there the scene is centred and barely cropped.
   */
  mobileFocal: string;
  /** App icon shown on the frosted card. */
  icon: string;
  title: string;
  /** Lead-in line. Volume Control doesn't have one. */
  question?: string;
  description: string;
  /**
   * The panel's "Learn More", pointing at the app's own website.
   *
   * It used to point at the app's page on this site; those are unreleased (see
   * APP_PAGES_LINKED) so it goes to the product site instead. Only the two
   * released apps have a site to send anyone to; Steppy and White Noise carry
   * a "Coming soon" badge in place of a CTA.
   */
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
    background: "/images/image-1-v2.webp",
    ground: "#908272",
    mobileFocal: "67%",
    icon: "/images/fold03/icon-05.jpg",
    title: "Find My Phone",
    question: "Can't find your phone when you need it most?",
    description:
      "Find My Phone helps you quickly find your phone by clapping or whistling.",
    cta: { label: "Learn More", href: "https://findmyphonelauncher.com/" },
    features: [
      { icon: "ic-target", text: "Find your phone from anywhere!" },
      { icon: "ic-moon", text: "Works even when your phone is asleep" },
    ],
    stats: { downloads: "1M+", rating: "4.5" },
  },
  {
    id: "steppy",
    background: "/images/image-2-v2.webp",
    ground: "#5d5a3c",
    mobileFocal: "67%",
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
    background: "/images/image-3-v3.webp",
    ground: "#2f2117",
    mobileFocal: "67%",
    icon: "/images/fold03/icon-02.jpg",
    title: "Volume Control",
    question: "Tired of not knowing how to set ringtone, alarm, or text volumes?",
    description:
      "Easily control all your volume settings in one place with Volume Control Launcher.",
    cta: { label: "Learn More", href: "https://phonevolumecontrol.com/" },
    quote:
      "“Great app! I can control all my app volumes separately and the boost is incredible!”",
    stats: { downloads: "1M+", rating: "4.5" },
  },
  {
    id: "white-noise",
    background: "/images/image-4-v2.webp",
    ground: "#3c3030",
    mobileFocal: "67%",
    icon: "/images/fold03/icon-15.jpg",
    title: "White Noise",
    question: "Your Sound. Your Calm.",
    description:
      "Find your calm with soothing sounds designed to help you sleep, focus, and unwind.",
    badge: "Coming soon",
    features: [
      { icon: "ic-headphones", text: "Relax with soothing white noise and calming audio." },
      { icon: "ic-sliders", text: "Choose from white noise, nature sounds, ambient audio, and more." },
      { icon: "ic-clock", text: "Set sounds to automatically stop after you fall asleep." },
    ],
  },
];
