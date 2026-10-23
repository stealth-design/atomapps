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
  | "screen"
  /** Turns to the front and stays there — for a scene that draws the screen itself. */
  | "front";

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
    /** Or the app's main screen drawn live on the phone: its icon and name, a big round `button` and a `status` line under it. */
    face?: { button: string; status: string };
    /** One or two buttons beside the phone (left, then right). */
    actions?: HeroAction[];
    /** A labelled strip of icons at the hero's foot — under the fan on the fan heroes (see /apps/[slug]). `icon` is an SVG path `d` on a 24-unit grid. */
    strip?: { label: string; items: { label: string; icon: string }[] };
    /**
     * Swaps the 3D phone for an interactive demo: a working calculator, the
     * phone with a volume knob that sets how hard clicks pulse the background,
     * a step widget that docks bottom-left and counts the scroll, a map with
     * rain clouds the cursor blows about, or screen-colour swatches and a
     * torch that darkens the hero, or the phone's alarms list with Ring alarm
     * and Timer buttons, an illustrated QR / barcode scan with stage buttons,
     * a desk calendar that breaks into blocks, a flat phone's to-do list
     * filled by voice, a flat phone's news feed, a night sky of zodiac
     * constellations, a Bible whose pages turn, or a working AI prompt bar
     * over a dark shader sky it ripples. See docs/app-hero-specs.md.
     */
    demo?: "calculator" | "volume" | "steps" | "weather" | "flashlight" | "alarm" | "qr" | "calendar" | "notes" | "news" | "horoscope" | "bible" | "ai";
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
  "breaking-news": {
    hero: {
      demo: "news",
      strip: {
        label: "Categories",
        items: [
          { label: "Business", icon: "M3 3v18h18M7 15l4-4 3 3 5-6" },
          { label: "Sports", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM5.6 5.6c3 3 3 9.8 0 12.8M18.4 5.6c-3 3-3 9.8 0 12.8" },
          { label: "Tech", icon: "M7 7h10v10H7ZM10 10h4v4h-4ZM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" },
        ],
      },
    },
    features: {
      heading: "The news, without the noise",
      sub: "Top stories, every category and your local forecast, a swipe from your home screen.",
    },
    closing: "Never miss a headline",
  },
  "ai-chat": {
    hero: {
      demo: "ai",
      strip: {
        label: "Ask it to help you",
        items: [
          { label: "Chat", icon: "M4 5h16v11H9l-5 4V5Z" },
          { label: "Write", icon: "M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" },
          { label: "Translate", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z" },
        ],
      },
    },
  },
  calendar: {
    hero: {
      demo: "calendar",
      strip: {
        label: "Plan it all",
        items: [
          { label: "Month view", icon: "M4 6h16v14H4ZM4 10h16M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" },
          { label: "Events", icon: "M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" },
          { label: "Reminders", icon: "M18 16V11a6 6 0 0 0-12 0v5l-2 2h16ZM10 21h4" },
        ],
      },
    },
  },
  "daily-horoscope": {
    hero: {
      demo: "horoscope",
      strip: {
        label: "Readings for",
        items: [
          { label: "Love", icon: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" },
          { label: "Career", icon: "M4 8h16v12H4ZM9 8V5h6v3M4 13h16" },
          { label: "Health", icon: "M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l7-7" },
        ],
      },
    },
  },
  notes: {
    hero: {
      demo: "notes",
      strip: {
        label: "Keep it tidy",
        items: [
          { label: "Colour", icon: "M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3.5 3H16a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 21ZM7.5 11h.01M10 7h.01M14.5 7h.01M17 11h.01" },
          { label: "Lock", icon: "M6 11h12v10H6ZM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11" },
          { label: "Checklist", icon: "M4 4h16v16H4ZM8 12l3 3 5-6" },
        ],
      },
    },
  },
  "weather-radar": {
    hero: {
      demo: "weather",
      strip: {
        label: "Map layers",
        items: [
          { label: "Rain", icon: "M7 14a3 3 0 0 0 6 0c0-2-3-5.5-3-5.5S7 12 7 14ZM15 8.5a2.5 2.5 0 0 0 5 0c0-1.7-2.5-4.5-2.5-4.5S15 6.8 15 8.5ZM14 18.5a2 2 0 0 0 4 0c0-1.3-2-3.5-2-3.5s-2 2.2-2 3.5Z" },
          { label: "Wind", icon: "M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8" },
          { label: "Temperature", icon: "M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0ZM12 9v6.5" },
        ],
      },
    },
  },
  flashlight: {
    hero: {
      demo: "flashlight",
      strip: {
        label: "Also in the app",
        items: [
          { label: "Magnifier", icon: "M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM21 21l-5.2-5.2M10.5 7.5v6M7.5 10.5h6" },
          { label: "Compass", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5Z" },
          { label: "Screen light", icon: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" },
        ],
      },
    },
  },
  "qr-scanner": {
    hero: {
      demo: "qr",
      strip: {
        label: "After every scan",
        items: [
          { label: "History", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2" },
          { label: "Auto-copy", icon: "M9 9h11v11H9ZM5 15H4V4h11v1" },
          { label: "Beep or buzz", icon: "M4 9v6h4l5 4V5L8 9H4ZM16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11" },
        ],
      },
    },
  },
  "holy-bible": {
    hero: {
      demo: "bible",
      strip: {
        label: "Read your way",
        items: [
          { label: "Read", icon: "M4 5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2V5ZM4 20a2 2 0 0 0 2 2h14v-4" },
          { label: "Listen", icon: "M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H5a1 1 0 0 1-1-1v-4ZM20 15h-3v5h2a1 1 0 0 0 1-1v-4Z" },
          { label: "Devotionals", icon: "M3 13c3 0 5-2 6-5 1 3 4 4 7 3l5-3-2 5c-2 4-6 6-11 6l-3 3v-4c-1-1-2-3-2-5Z" },
        ],
      },
    },
  },
  "alarm-clock": {
    hero: {
      demo: "alarm",
      strip: {
        label: "Also",
        items: [
          { label: "World clock", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z" },
          { label: "Timer", icon: "M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" },
          { label: "Stopwatch", icon: "M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 9v4M10 2h4M18.5 6.5 20 5" },
        ],
      },
    },
  },
  "step-tracker": {
    hero: {
      demo: "steps",
      strip: {
        label: "Counts every walk in",
        items: [
          { label: "Steps", icon: "M8 3c1.7 0 2.5 1.8 2.5 4S9.5 12 8 12 5.5 10.2 5.5 8 6.3 3 8 3ZM6 15h4v1.5a2 2 0 0 1-4 0ZM16 7c1.7 0 2.5 1.8 2.5 4s-1 5-2.5 5-2.5-1.8-2.5-4 .8-5 2.5-5ZM14 19h4v.5a2 2 0 0 1-4 0Z" },
          { label: "Distance", icon: "M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16" },
          { label: "Calories", icon: "M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 .8 1.5 1.5 2 2.5 2 0-2.5-.5-4.5.5-7Z" },
        ],
      },
    },
  },
  calculator: {
    hero: {
      demo: "calculator",
      strip: {
        label: "Every calculator in one app",
        items: [
          { label: "Calculator", icon: "M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM8 7h8v3H8ZM8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01M16 17.5h.01" },
          { label: "Converters", icon: "M4 8h15l-3-3M20 16H5l3 3" },
          { label: "Tip & BMI", icon: "M19 5 5 19M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" },
        ],
      },
    },
  },
  "volume-control": {
    hero: {
      demo: "volume",
      strip: {
        label: "Turn up every sound",
        items: [
          { label: "Music", icon: "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" },
          { label: "Calls", icon: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" },
          { label: "Alarms", icon: "M18 16V11a6 6 0 0 0-12 0v5l-2 2h16ZM10 21h4" },
        ],
      },
    },
  },
  "find-my-phone": {
    hero: {
      face: { button: "Clap to find", status: "Detection on" },
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
