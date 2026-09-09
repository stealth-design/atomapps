/**
 * Fold 03 — icon data for the scroll-driven scatter → converge → grid sequence.
 *
 * Values are the raw Figma pixel coordinates so they can be diffed against the
 * artboards directly; positions are converted to percentages of the stage at
 * render time.
 *
 * In Figma all of these icons are crops of two home-screen screenshots
 * (imageRefs c095509… and 59117b…). They've been extracted to individual
 * assets in `public/images/fold03/` so Next/Image can resize and re-encode
 * them — a shared CSS sprite would have meant shipping 3MB of raw PNG.
 *
 * Every icon is square and its Figma corner radius is a consistent 20.8% of
 * its width, so one percentage radius covers all sizes.
 */

export interface IconPlacement {
  /** Asset basename in `public/images/fold03/`. */
  icon: string;
  /** Figma x/y of the top-left corner, relative to the fold. */
  x: number;
  y: number;
  /** Figma width (icons are square). */
  size: number;
  /** Figma layer-blur radius in px (halved for CSS — see BLUR_SCALE). */
  blur?: number;
  /** Figma layer opacity. */
  opacity?: number;
}

/** Artboard dimensions the START placements below are measured against. */
export const DESKTOP_STAGE = { width: 1440, height: 886 };
export const MOBILE_STAGE = { width: 393, height: 626 };

/**
 * Source extension per icon. Everything came out of Figma as `.jpg`; anything
 * added since carries its own here rather than being re-encoded to match.
 * Next/Image re-encodes to webp/avif on the way out either way, so the source
 * format only decides what sits in `public/`.
 */
export const ICON_EXT: Record<string, string> = {
  "icon-16": "webp",
};

/** Corner radius as a share of icon width (Figma: 20.8% at every size). */
export const ICON_RADIUS = "20.8%";

/** Figma layer-blur radius ≈ 2x the equivalent CSS blur. */
export const BLUR_SCALE = 0.5;

/** START — desktop scatter, Figma 1136:2630 (1440x886). */
export const DESKTOP_ICONS: IconPlacement[] = [
  // Below the device. The plate box is 1030 wide but the phone visible
  // inside it only spans x 468-964, y 178-413 of the stage, leaving 147px
  // clear underneath — Figma had this sitting on the screen.
  { icon: "icon-09", x: 665, y: 677, size: 100, blur: 2 },
  { icon: "icon-12", x: 334, y: 522, size: 89, blur: 11, opacity: 0.54 },
  { icon: "icon-01", x: 161, y: 354, size: 132 },
  { icon: "icon-02", x: 266, y: 75, size: 135 },
  { icon: "icon-03", x: 1036, y: -145, size: 167, blur: 6 },
  // Moved below the device too, alongside icon-09. Its earlier home at
  // y=113 put it over the heading's first line.
  { icon: "icon-04", x: 812, y: 696, size: 75, blur: 3, opacity: 0.66 },
  { icon: "icon-05", x: -203, y: 279, size: 291, blur: 29 },
  { icon: "icon-06", x: 1204, y: 509, size: 123, blur: 4 },
  { icon: "icon-07", x: 351, y: 270, size: 80, blur: 4 },
  { icon: "icon-08", x: 62, y: 738, size: 78, blur: 4 },
  { icon: "icon-10", x: 1328, y: 48, size: 380, blur: 40 },
  { icon: "icon-11", x: 1063, y: 680, size: 242, blur: 34 },
  // Scanner. Figma had it at y=-16 over the heading's first line; dropping it
  // to x=551 y=370 freed the type but landed it on the device, which spans
  // x 468-964, y 178-413 (see icon-09 above). Now left of the device instead:
  // its right edge is 293 against the device's 468, and at y=520 it clears
  // icon-01 (ends y 486), icon-05 (ends x 88) and icon-12 (starts x 334) — the
  // one 143px gap on that side that touches nothing.
  { icon: "icon-13", x: 150, y: 520, size: 143, blur: 16, opacity: 0.64 },
  { icon: "icon-14", x: 1009, y: 262, size: 158, opacity: 0.83 },
  { icon: "icon-15", x: 114, y: -22, size: 94, blur: 4 },
  // The 16th, added after the artboard. It sits in the one clear pocket on
  // the right: below icon-14 (ends y 420), left of icon-06 (starts x 1204),
  // above icon-11 (starts y 680) and clear of the device, which spans
  // x 468-964, y 178-413.
  { icon: "icon-16", x: 900, y: 500, size: 90, blur: 5 },
];

/**
 * START — the two icons that bleed off the stage's sides, pulled inside for
 * screens wider than the artboard.
 *
 * Sitting inside the stage is not enough on its own: `blur` puts a halo around
 * each one that the stage's `overflow-clip` cuts just as visibly as the icon.
 * icon-05 carries blur 29 and icon-10 blur 40 — 14.5px and 20px once halved
 * for CSS — so both are inset well clear of the edge rather than up against
 * it, and shrunk again to pay for the inset. Their haloes now land at 35 and
 * 1410 against a stage running 0 to 1440.
 *
 * `icon-05` sits at x=-203 and `icon-10` runs to x=1708 against a 1440-wide
 * artboard, so each is about 70% off-stage and shows as a sliver — 88px of 291
 * on the left, 112px of 380 on the right. That is correct while the stage is
 * the window: the cut lands on the screen's own edge and reads as a bleed,
 * which is why the stage runs end to end up to 1920. Past that it centres
 * inside gutters and both cuts fall in the middle of the screen against white,
 * which reads as clipping instead.
 *
 * Each is shrunk to fit inside with that clearance and kept near its original
 * centre, so the eye still finds it where it was. Both spots were checked
 * against every other placement: icon-05 runs x 50-160 against icon-01's 161,
 * and icon-10 runs x 1210-1390 against icon-03's 1203, clear of icon-14's x
 * (ends 1167) and icon-06's y (starts 509).
 *
 * Coordinates stay in the artboard's 1440 space like every other placement —
 * `startRules` turns them into percentages of whatever the stage measures, so
 * they scale with it and stay inside at any capped width.
 */
export const DESKTOP_ICONS_WIDE: IconPlacement[] = [
  { icon: "icon-05", x: 50, y: 370, size: 110, blur: 29 },
  { icon: "icon-10", x: 1210, y: 148, size: 180, blur: 40 },
];

/**
 * START — mobile scatter, Figma 1136:1122 (393x626).
 *
 * icon-03 is absent from the mobile artboard, but the sequence needs all 15
 * icons present as one element each, so it gets a placement consistent with
 * the surrounding scatter (top-right, blurred, partly outside the stage).
 */
export const MOBILE_ICONS: IconPlacement[] = [
  { icon: "icon-12", x: 51, y: 476, size: 57, blur: 7, opacity: 0.54 },
  { icon: "icon-09", x: 167, y: 515, size: 60, blur: 1 },   // below the device (see desktop)
  { icon: "icon-01", x: -34, y: 279, size: 85 },
  { icon: "icon-02", x: 59, y: 29, size: 70 },
  { icon: "icon-07", x: 33, y: 150, size: 51, blur: 3 },
  { icon: "icon-08", x: -34, y: 451, size: 50, blur: 3 },
  { icon: "icon-15", x: -44, y: 78, size: 61, blur: 3 },
  { icon: "icon-05", x: -47, y: 583, size: 99, blur: 10 },
  { icon: "icon-06", x: 367, y: 172, size: 48, blur: 2 },
  { icon: "icon-11", x: 352, y: 489, size: 95, blur: 13 },
  { icon: "icon-14", x: 246, y: 126, size: 62, opacity: 0.83 },
  { icon: "icon-04", x: 308, y: 521, size: 26, blur: 1, opacity: 0.66 },  // below the device
  { icon: "icon-13", x: 223, y: 29, size: 79, blur: 9, opacity: 0.64 },
  { icon: "icon-10", x: 354, y: 267, size: 73, blur: 8 },
  { icon: "icon-03", x: 296, y: -18, size: 88, blur: 6 },
  // Bottom-left, in the gap under icon-12 (ends y 533) and right of icon-05
  // (ends x 52), well left of icon-09 (starts x 167).
  { icon: "icon-16", x: 95, y: 560, size: 44, blur: 5 },
];

/**
 * END — the final grid, read left→right / top→bottom from the end-frame
 * reference. Row lengths differ per breakpoint but this reading order is
 * preserved, so the grid is always the same sequence of apps.
 *
 *   row 1  clap · moon · volume · steps · weather · calculator · clock
 *   row 2  zodiac · torch · scanner · AI · calendar · notes · news · bible
 *
 * icon-16 is appended rather than slotted in: it postdates the reference
 * frame, so there is no position in that reading order it belongs to.
 */
export const END_ORDER = [
  "icon-05",
  "icon-15",
  "icon-02",
  "icon-03",
  "icon-10",
  "icon-11",
  "icon-01",
  "icon-08",
  "icon-12",
  "icon-13",
  "icon-06",
  "icon-07",
  "icon-09",
  "icon-04",
  "icon-14",
  "icon-16",
];

export interface GridConfig {
  /** Icons per row, in END_ORDER sequence. */
  rows: number[];
  /** Icon size, gap and row gap measured against `reference` width. */
  size: number;
  gap: number;
  rowGap: number;
  /**
   * Clearance kept between the heading's last line and the grid's first row,
   * measured against `reference` width.
   *
   * Both breakpoints used to share 34px — the mobile artboard's value — which
   * left the type sitting almost on the first row of icons. Desktop's artboard
   * actually has ~58px, and mobile reads better with more than its own 34.
   */
  headingGap: number;
  reference: number;
}

/**
 * Desktop was the end-frame reference's 7 and 8; the 16th icon makes it an even
 * two rows of 8, which is the same 226px block as before.
 *
 * Mobile cannot take a sixth icon at 58px — six of those plus their gaps come
 * to 408 against a 393 stage — so the row that gains it is paid for by 58->54
 * and 12->10, which lands a row of six at 374 and leaves 9px either side. The
 * block ends up 194px tall against the 206 it was, so the grid does not grow
 * into the stage it has to fit inside.
 */
export const END_GRID: { desktop: GridConfig; mobile: GridConfig } = {
  desktop: { rows: [8, 8], size: 96, gap: 20, rowGap: 34, headingGap: 58, reference: 1440 },
  mobile: { rows: [6, 5, 5], size: 54, gap: 10, rowGap: 16, headingGap: 52, reference: 393 },
};

/* PHONE_FACE / CLUSTER_FILL used to live here, aiming the icons at the phone
   screen mid-sequence. The icons now travel straight from the scatter to the
   grid, so nothing needs the face geometry. */

/**
 * Where each icon goes when clicked — a Play Store listing, its own page, or
 * the app's site. Keyed by the same icon id as everything else here.
 *
 * Empty on purpose: an icon with no entry renders exactly as it always has,
 * decorative and unclickable, so adding a link is a one-line change here and
 * nothing else. `label` is the accessible name, since the artwork itself
 * carries no text.
 *
 * Order below follows END_ORDER's row 2 naming, for whoever fills them in:
 *   icon-05 · icon-15 · icon-02 · icon-03 · icon-10 · icon-11 · icon-01
 *   icon-08 · icon-12 · icon-13 · icon-06 · icon-07 · icon-09 · icon-04
 *   icon-14 (the bible)
 */
export const ICON_LINKS: Partial<Record<string, { label: string; href: string }>> = {
  // "icon-14": { label: "Holy Bible", href: "https://play.google.com/store/apps/details?id=..." },
};

/** The white fade Figma lays over the phone plate (gradient stops preserved). */
export const PHONE_FADE =
  "linear-gradient(to bottom, #fff 41%, rgba(255,255,255,0.88) 51%, rgba(255,255,255,0) 87.9%)";
