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
  legal: NavItem[];
  /** The notices on the foot of the footer, one line each. */
  disclaimers: string[];
  email: string;
  copyright: string;
  social: SocialLink[];
}

/**
 * Site-level content taken from the Figma header/footer (canvas `----> v7`,
 * header 1136:3519, footer 1144:2746). Anchor targets are best-guess mappings
 * onto the fold ids — adjust as the folds get built out.
 */
export const siteConfig: SiteConfig = {
  name: "Atom Apps",
  description: "Everyday tasks made easy through apps people love.",
  // Order matches the design's header: Our Apps · Our Approach · About Us.
  nav: [
    { label: "Our Apps", href: "#fold-04" },
    { label: "Our Approach", href: "#fold-06" },
    { label: "About Us", href: "#fold-03" },
  ],
  // Points at the /contact page rather than the footer anchor. The footer
  // keeps its own `id="contact"`, so existing anchors still resolve.
  cta: { label: "Contact Us", href: "/contact" },
  legal: [
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    // Third, and last, so `legal[0]` and `legal[1]` still mean what the
    // contact form's small print expects them to.
    {
      label: "Do Not Sell or Share my Personal Information",
      href: "/do-not-sell",
    },
  ],
  /** The address the legal documents name. The footer no longer prints it. */
  email: "contact@atomapplications.com",
  /** Trademark attribution, on the foot of the footer under the legal row. */
  disclaimers: [
    "Google Play is a trademark of Google LLC. Our company and apps are not affiliated with or endorsed by Google.",
    "All third-party names, trademarks, and logos are the property of their respective owners. Their use does not imply endorsement or sponsorship of Atom Apps LLC.",
  ],
  copyright: "© 2026 Atom Apps LLC. All rights reserved.",
  social: [],
};
