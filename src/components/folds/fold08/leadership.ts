/**
 * Fold 08 — Leadership & Partners.
 *
 * Figma: desktop 1136:2559 (1440x1137), mobile 1136:2479 (393x685).
 *
 * The partner strip is one row of five on desktop and wraps to 3 + 2 on
 * mobile — and the artboards order it differently, with Google leading on
 * desktop but sitting fourth on mobile. Hence an explicit order per logo.
 */

export interface PartnerLogo {
  name: string;
  /** Asset in `public/images/fold08/`. */
  src: string;
  /** Figma widths — the logos are optically sized, not uniform. */
  width: { mobile: number; desktop: number };
  /** 1-based position in the strip at each breakpoint. */
  order: { mobile: number; desktop: number };
}

export const PARTNERS: PartnerLogo[] = [
  {
    name: "Google",
    src: "logo-google.svg",
    width: { mobile: 64, desktop: 142 },
    order: { mobile: 4, desktop: 1 },
  },
  {
    name: "Meta",
    src: "logo-meta.svg",
    width: { mobile: 63, desktop: 141 },
    order: { mobile: 1, desktop: 2 },
  },
  {
    name: "Sensor Tower",
    src: "logo-sensortower.png",
    width: { mobile: 94, desktop: 209 },
    order: { mobile: 2, desktop: 3 },
  },
  {
    name: "RevenueCat",
    src: "logo-revenuecat.png",
    width: { mobile: 73, desktop: 162 },
    order: { mobile: 3, desktop: 4 },
  },
  {
    name: "Adjust",
    src: "logo-adjust.png",
    width: { mobile: 68, desktop: 151 },
    order: { mobile: 5, desktop: 5 },
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
