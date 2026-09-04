/**
 * Fold 08 — Leadership & Partners.
 *
 * Figma: desktop 1136:2559 (1440x1137), mobile 1136:2479 (393x685).
 *
 * The partner strip is one row of five at every breakpoint. The mobile
 * artboard wrapped it to 3 + 2 at smaller sizes and in a different order
 * (Google fourth rather than first), but it now runs as a single row that
 * scroll drives sideways, so there is one order — this array's — and one set
 * of widths.
 */

export interface PartnerLogo {
  name: string;
  /** Asset in `public/images/fold08/`. */
  src: string;
  /** Figma width — the logos are optically sized, not uniform. */
  width: number;
}

export const PARTNERS: PartnerLogo[] = [
  {
    name: "Google",
    src: "logo-google.svg",
    width: 142,
  },
  {
    name: "Meta",
    src: "logo-meta.svg",
    width: 141,
  },
  {
    name: "Sensor Tower",
    src: "logo-sensortower.png",
    width: 209,
  },
  {
    name: "RevenueCat",
    src: "logo-revenuecat.png",
    width: 162,
  },
  {
    name: "Adjust",
    src: "logo-adjust.png",
    width: 151,
  },
];

export interface TeamMember {
  name: string;
  /** Desktop role; mobile shortens Tarika's. */
  role: string;
  roleMobile?: string;
  photo: string;
}

export const TEAM: TeamMember[] = [
  { name: "Dan Rabin", role: "CEO", photo: "team-dan.jpg" },
  { name: "Ektarina", role: "CMO", photo: "team-ektarina.jpg" },
  {
    name: "Tarika",
    role: "Director of Strategic Initiatives",
    roleMobile: "Strategic Initiatives",
    photo: "team-tarika.jpg",
  },
];
