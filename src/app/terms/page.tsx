import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FooterParallax } from "@/components/layout/FooterParallax";
import { Container } from "@/components/ui/Container";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { TERMS } from "@/data/legal/terms";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: `Terms of Service — ${siteConfig.name}`,
  description: "The terms governing your use of Atom Apps' services.",
};

/**
 * /terms — the published Terms of Service, rendered from `@/data/legal/terms`.
 *
 * Built from the pieces the site already has, the way /contact is, so it
 * inherits the header, the footer and the 1440 content width rather than
 * restating them. `pt` clears the fixed 50px header.
 */
export default function TermsPage() {
  return (
    <>
      <Header />

      <main>
        <Container className="pt-[calc(var(--header-height)+48px)] pb-[80px] tablet:pt-[calc(var(--header-height)+80px)] tablet:pb-[120px]">
          <LegalDocument doc={TERMS} />
        </Container>
      </main>

      <FooterParallax>
        <Footer />
      </FooterParallax>
    </>
  );
}
