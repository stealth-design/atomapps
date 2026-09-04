export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  nav: NavItem[];
  cta: NavItem;
  /** The footer's own call to action. */
  footerCta: NavItem;
  legal: NavItem[];
  copyright: string;
  social: SocialLink[];
}

/**
 * Site-level content taken from the Figma header/footer (canvas `----> v7`,
 * header 1136:3519, footer 1144:2746). Anchor targets are best-guess mappings
 * onto the fold ids — adjust as the folds get built out.
 */
export const siteConfig: SiteConfig = {
  name: "Atom",
  description: "Everyday tasks made easy through apps that people love.",
  // Order matches the design's header: Our Apps · Our Approach · About Us.
  nav: [
    { label: "Our Apps", href: "#fold-04" },
    { label: "Our Approach", href: "#fold-06" },
    { label: "About Us", href: "#fold-03" },
  ],
  cta: { label: "Contact Us", href: "#contact" },
  footerCta: { label: "Get in touch", href: "#contact" },
  legal: [
    { label: "Terms & Conditions", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
  copyright: "@ATOM All Rights Reserved 2026",
  social: [],
};
