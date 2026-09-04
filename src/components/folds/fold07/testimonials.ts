/**
 * Fold 07 — Testimonials.
 *
 * Figma: desktop 1136:2631 (1440x757), mobile 1136:2451 (393x729).
 *
 * Desktop lays six quotes across two masonry columns that drift vertically;
 * mobile runs the same six across two rows that drift sideways.
 *
 * The app chips reuse the Fold 03 sprite crops, so no new artwork is needed.
 */

export interface Testimonial {
  id: string;
  app: string;
  /** App icon asset — all are existing Fold 03 sprite crops. */
  icon: string;
  quote: string;
}

const CLAP = "/images/fold03/icon-05.jpg";
const MOON = "/images/fold03/icon-15.jpg";
const NOTES = "/images/fold03/icon-09.jpg";

export const TESTIMONIALS: Record<string, Testimonial> = {
  findMyPhone: {
    id: "findMyPhone",
    app: "Find My Phone",
    icon: CLAP,
    quote:
      '"Left my phone in a cab last week and Find My Phone had it ringing within seconds. The loud alarm feature works even on silent mode - genuinely saved me."',
  },
  notes: {
    id: "notes",
    app: "Notes by Atom Apps",
    icon: NOTES,
    quote:
      '"Notes by Atom Apps quickly organizes my thoughts. I can jot ideas anywhere, and tags keep everything neat-no more clutter."',
  },
  agencies: {
    id: "agencies",
    app: "White Noise",
    icon: MOON,
    quote:
      "We've worked with several dev agencies before, but Atom is on another level. They didn't just build what we asked - they improved our architecture and saved us months of tech debt.",
  },
  seriesA: {
    id: "seriesA",
    app: "White Noise",
    icon: MOON,
    quote:
      "Finally, a development partner that understands both the technical and business side. They helped us secure our Series A with a polished MVP.",
  },
  concept: {
    id: "concept",
    app: "White Noise",
    icon: MOON,
    quote:
      "From concept to App Store in record time. Atom's iterative approach meant we could validate with real users early and pivot quickly.",
  },
  legacy: {
    id: "legacy",
    app: "White Noise",
    icon: MOON,
    quote:
      "Atom rebuilt our legacy system into a modern React Native app. The migration was seamless and our user engagement jumped 3x.",
  },
};

/** Desktop: two masonry columns. The trailing card of each fades to 40%. */
export const DESKTOP_COLUMNS: Testimonial[][] = [
  [TESTIMONIALS.findMyPhone, TESTIMONIALS.agencies, TESTIMONIALS.concept],
  [TESTIMONIALS.notes, TESTIMONIALS.seriesA, TESTIMONIALS.legacy],
];

/**
 * Mobile runs the same six across two rows that drift sideways in opposite
 * directions — three each, so both rows carry the same amount of track and
 * therefore travel at the same apparent speed.
 */
export const MOBILE_ROWS: Testimonial[][] = [
  [TESTIMONIALS.notes, TESTIMONIALS.agencies, TESTIMONIALS.concept],
  [TESTIMONIALS.findMyPhone, TESTIMONIALS.seriesA, TESTIMONIALS.legacy],
];
