import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FooterParallax } from "@/components/layout/FooterParallax";
import { Container } from "@/components/ui/Container";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { PRIVACY } from "@/data/legal/privacy";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description: "How Atom Apps collects, uses and protects your information.",
};

/**
 * /privacy — the published Privacy Policy, rendered from `@/data/legal/privacy`.
 *
 * Built from the pieces the site already has, the way /contact is, so it
 * inherits the header, the footer and the 1440 content width rather than
 * restating them. `pt` clears the fixed 50px header.
 */
export default function PrivacyPage() {
  return (
    <>
      <Header />

      <main>
        <Container className="pt-[calc(var(--header-height)+48px)] pb-[80px] tablet:pt-[calc(var(--header-height)+80px)] tablet:pb-[120px]">
          <LegalDocument doc={PRIVACY} />
        </Container>
      </main>

      <FooterParallax>
        <Footer />
      </FooterParallax>
    </>
  );
}
