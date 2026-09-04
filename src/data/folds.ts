/**
 * Fold registry — the single source of truth mapping each numbered fold to its
 * section in the Figma design ("Atom apps Website", canvas `----> v7`).
 *
 * Reference frames:
 *   Desktop v7 — 1440 x 9772  (node 1136:2539)
 *   Mweb v7    —  393 x 8303  (node 1136:1086)
 *
 * Filenames never change: Fold05 stays `Fold05.tsx` even though it renders the
 * Find My Phone section. Update `name` here if a section is renamed in Figma.
 */

export const FIGMA_FILE_KEY = "Rdsz3LP5Uncoe956oXMrJR";

/** Builds a deep link to a node in the Figma file. */
export function figmaNodeUrl(nodeId: string): string {
  return `https://www.figma.com/design/${FIGMA_FILE_KEY}/Atom-apps-Website?node-id=${nodeId.replace(":", "-")}`;
}

export interface FoldMeta {
  /** Two-digit id — drives `FoldXX.tsx`, `id="fold-XX"` and `data-fold="XX"`. */
  id: string;
  /** Section name as it reads in the design. */
  name: string;
  /** Figma node ids for the desktop and mobile artboards. */
  figma: { desktop: string; mobile: string };
  /** Design heights in px, for reference while building each fold. */
  height: { desktop: number; mobile: number };
}

export const FOLDS: FoldMeta[] = [
  {
    id: "01",
    name: "Hero",
    figma: { desktop: "1136:2593", mobile: "1136:1088" },
    height: { desktop: 800, mobile: 761 },
  },
  {
    id: "02",
    name: "Impact Numbers",
    figma: { desktop: "1136:2543", mobile: "1136:1109" },
    height: { desktop: 268, mobile: 326 },
  },
  {
    id: "03",
    name: "App Family",
    figma: { desktop: "1136:2630", mobile: "1136:1122" },
    height: { desktop: 886, mobile: 626 },
  },
  {
    id: "04",
    name: "App Directory Heading",
    figma: { desktop: "1136:2627", mobile: "1136:1124" },
    height: { desktop: 170, mobile: 176 },
  },
  {
    id: "05",
    name: "App Showcase Stack",
    // The four app scenes are one stacked-scroll fold now; these are the first
    // panel's artboards. Steppy 1136:3261, Volume Control 1136:3064 and
    // White Noise 1136:2679 are the other three.
    figma: { desktop: "1136:3208", mobile: "1136:1127" },
    height: { desktop: 886, mobile: 846 },
  },
  {
    id: "06",
    name: "Our Approach",
    figma: { desktop: "1153:8675", mobile: "1136:1991" },
    height: { desktop: 1009, mobile: 906 },
  },
  {
    id: "07",
    name: "Testimonials",
    figma: { desktop: "1136:2631", mobile: "1136:2451" },
    height: { desktop: 757, mobile: 729 },
  },
  {
    id: "08",
    name: "Leadership & Partners",
    figma: { desktop: "1136:2559", mobile: "1136:2479" },
    height: { desktop: 1137, mobile: 685 },
  },
];

/** Header and footer sit outside the fold sequence. */
export const LAYOUT_NODES = {
  header: { desktop: "1136:3519", mobile: "1136:2529", height: { desktop: 50, mobile: 50 } },
  footer: { desktop: "1144:2746", mobile: "1136:2513", height: { desktop: 800, mobile: 657 } },
} as const;

export function getFold(id: string): FoldMeta | undefined {
  return FOLDS.find((fold) => fold.id === id);
}
