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
  // Dropped below the heading instead of Figma's y=-16. At 143px tall it
  // cannot clear the text upwards (the edge clamp floors it at 34px, and it
  // would need to sit at -11), and both horizontal gaps either side of the
  // text are under 90px — so down is the only direction that frees the type.
  { icon: "icon-13", x: 551, y: 370, size: 143, blur: 16, opacity: 0.64 },
  { icon: "icon-14", x: 1009, y: 262, size: 158, opacity: 0.83 },
  { icon: "icon-15", x: 114, y: -22, size: 94, blur: 4 },
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
];

/**
 * END — the final grid, read left→right / top→bottom from the end-frame
 * reference. Row lengths differ per breakpoint but this reading order is
 * preserved, so the grid is always the same sequence of apps.
 *
 *   row 1  clap · moon · volume · steps · weather · calculator · clock
 *   row 2  zodiac · torch · scanner · AI · calendar · notes · news · bible
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
];

export interface GridConfig {
  /** Icons per row, in END_ORDER sequence. */
  rows: number[];
  /** Icon size, gap and row gap measured against `reference` width. */
  size: number;
  gap: number;
  rowGap: number;
  reference: number;
}

/** Desktop matches the end-frame reference: two rows of 7 and 8. */
export const END_GRID: { desktop: GridConfig; mobile: GridConfig } = {
  desktop: { rows: [7, 8], size: 96, gap: 20, rowGap: 34, reference: 1440 },
  mobile: { rows: [5, 5, 5], size: 58, gap: 12, rowGap: 16, reference: 393 },
};

/* PHONE_FACE / CLUSTER_FILL used to live here, aiming the icons at the phone
   screen mid-sequence. The icons now travel straight from the scatter to the
   grid, so nothing needs the face geometry. */

/** The white fade Figma lays over the phone plate (gradient stops preserved). */
export const PHONE_FADE =
  "linear-gradient(to bottom, #fff 41%, rgba(255,255,255,0.88) 51%, rgba(255,255,255,0) 87.9%)";
