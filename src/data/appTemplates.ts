/**
 * Per-app content for the master app template (`src/app/test-template`).
 *
 * `@/data/apps` holds what the Play Store listing says; this holds what the
 * template needs on top of it — the hero's interactive demo, section headings
 * written for the app, and content the listing doesn't carry (the "How it
 * works" steps). Every field is optional: an app with no entry still renders,
 * with defaults derived from its listing, and any section whose content is
 * missing is left out rather than shown empty.
 */

/** What the 3D phone does when a hero action button is pressed. */
export type HeroDoes =
  /** Turns to its back, buzzes and blinks the flash — Find My Phone, alarms. */
  | "ring"
  /** Turns to its back and holds the flash on — Flashlight. */
  | "torch"
  /** Stays facing front and presses its side buttons — Volume Control. */
  | "volume"
  /** Stays facing front and swaps its screen to `screen` — any app with a result to show. */
  | "screen";

export interface HeroAction {
  label: string;
  emoji: string;
  does: HeroDoes;
  /** The status line shown while it plays, e.g. "Clap detected · Ringing". */
  note: string;
  /** For `does: "screen"`: the 1260×2800 image the phone's screen shows. */
  screen?: string;
}

export interface Orb {
  emoji: string;
  label: string;
  /** Gradient stops, light to deep. */
  light: string;
  mid: string;
  deep: string;
  on?: boolean;
}

export interface AppTemplate {
  hero?: {
    /** 1260×2800 image for the 3D phone's screen; the model's own if unset. */
    screen?: string;
    /** One or two buttons beside the phone (left, then right). */
    actions?: HeroAction[];
    /** A labelled strip of icons pinned to the hero's foot. `icon` is an SVG path `d` on a 24-unit grid. */
    strip?: { label: string; items: { label: string; icon: string }[] };
  };
  /** Ends "Join {downloads} people …". Default: "using {title}". */
  socialLine?: string;
  features?: {
    heading?: string;
    sub?: string;
    /** Hand-picked cards as [feature index, screenshot number]. Default: the features that have a `shot`, up to three. */
    cards?: [feature: number, shot: number][];
  };
  /** A wide card of one feature beside a little UI mock: bars (value out of `max`) and tiles. */
  widget?: { feature: number; max: number; bars: { label: string; value: number }[]; tiles: string[] };
  /** Feature index for the dark spotlight card. Default: the first feature not already shown. */
  spotlight?: number;
  /** The pinned, scroll-driven "How it works" band. Left out when unset. */
  steps?: {
    heading: [muted: string, strong: string];
    orbs?: Orb[];
    items: { title: string; text: string; image: string }[];
  };
  reviewsHeading?: string;
  closing?: string;
}

export const APP_TEMPLATES: Record<string, AppTemplate> = {
  "find-my-phone": {
    hero: {
      actions: [
        { label: "Clap", emoji: "👏", does: "ring", note: "Clap detected · Ringing" },
        { label: "Whistle", emoji: "😗", does: "ring", note: "Whistle detected · Ringing" },
      ],
      strip: {
        label: "Works whether your phone is on",
        items: [
          { label: "Silent", icon: "M18 16V11a6 6 0 0 0-9.5-4.9M6 9.5V16l-2 2h12M10 21h4M3 3l18 18" },
          { label: "Vibrate", icon: "M9 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM3 9v6M21 9v6" },
          { label: "Full volume", icon: "M4 9v6h4l5 4V5L8 9H4ZM16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11" },
        ],
      },
    },
    socialLine: "who never lose their phone",
    features: {
      heading: "Find it in seconds",
      sub: "When you clap or whistle, your phone will make a sound, vibrate, and flash.",
      cards: [
        [0, 2],
        [1, 4],
        [3, 3],
      ],
    },
    widget: {
      feature: 4,
      max: 120,
      bars: [10, 30, 60, 120].map((s) => ({ label: `${s} seconds`, value: s })),
      tiles: ["🎶 Melodies", "😗 Whistles", "🐶 Animal sounds", "🎛️ Electronic"],
    },
    spotlight: 5,
    steps: {
      heading: ["Clap or whistle,", "your phone answers back"],
      orbs: [
        { emoji: "👏", label: "Clap", light: "#ffe3ea", mid: "#ffb3c6", deep: "#f27a9a" },
        { emoji: "😗", label: "Whistle", light: "#ece8ff", mid: "#b3a6ff", deep: "#7b66f5", on: true },
        { emoji: "🔦", label: "Flash", light: "#fff4d6", mid: "#ffd98a", deep: "#f5b53d" },
      ],
      // From findmyphonelauncher.com.
      items: [
        { title: "Find Your Phone Instantly with a Clap or Whistle", text: "Activate detection so your phone hears your clap or whistle.", image: "/images/apps/find-my-phone/steps/step-1.webp" },
        { title: "Enable Permissions for Seamless Phone Detection", text: "Grant microphone & notification permissions for effective tracking.", image: "/images/apps/find-my-phone/steps/step-2.webp" },
        { title: "Your Phone is Just a Clap Away!", text: "Lost your phone? Simply clap or whistle to find it instantly!", image: "/images/apps/find-my-phone/steps/step-3.webp" },
        { title: "Never Search for Your Phone Again – Let It Call You!", text: "Your phone will respond with a preselected sound, flash, or vibration.", image: "/images/apps/find-my-phone/steps/step-4.webp" },
        { title: "Customize Your Alerts for a Smarter Phone Finder", text: "Voila! Find your phone easily and customize alert settings just the way you want.", image: "/images/apps/find-my-phone/steps/step-5.webp" },
      ],
    },
    reviewsHeading: "Loved by people who lose their phone",
    closing: "Never lose your phone again",
  },
};

export function getTemplate(slug: string): AppTemplate {
  return APP_TEMPLATES[slug] ?? {};
}
