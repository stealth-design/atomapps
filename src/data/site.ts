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
  tagline: string;
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
  name: "Atom",
  description: "Everyday tasks made easy through apps people love.",
  // Order matches the design's header: Our Apps · Our Approach · About Us.
  nav: [
    { label: "Our Apps", href: "#fold-04" },
    { label: "Our Approach", href: "#fold-06" },
    { label: "About Us", href: "#fold-03" },
  ],
  // Both point at the /contact page rather than the footer anchor. The
  // footer keeps its own `id="contact"`, so existing anchors still resolve.
  cta: { label: "Contact Us", href: "/contact" },
  footerCta: { label: "Get in touch", href: "/contact" },
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
  /** Sits under the footer wordmark. Distinct from `description`, which is
      the page's meta description. */
  tagline:
    "A full-service company that specializes in mobile development, distribution, and monetization for brands across verticles.",
  /** Shown under the footer wordmark, and the address the documents name. */
  email: "contact@atomapplications.com",
  copyright: "@ATOM All Rights Reserved 2026",
  social: [],
};
