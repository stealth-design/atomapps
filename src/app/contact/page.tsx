import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FooterParallax } from "@/components/layout/FooterParallax";
import { Container } from "@/components/ui/Container";
import { Sky } from "@/components/ui/Sky";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { TESTIMONIALS } from "@/components/folds/fold07/testimonials";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.name}`,
  description: "Get in touch with our team for any questions.",
};

/**
 * /contact — the reference's two-column booking page: copy and a quote on the
 * left, the form on the right, over a sky.
 *
 * Built from the pieces the site already has — `Header`, `Footer`,
 * `Container`, `Reveal` and a quote from Fold 07's own set — so it inherits the
 * type scale, the 1440 content width and the nav's gutters rather than
 * restating them.
 *
 * The sky is `Sky`, shared with the CCPA request page — CSS rather than a
 * photograph, so the page stays on assets we own.
 */

/** The quote reads as a partner speaking, which is what this page is for. */
const QUOTE = TESTIMONIALS.agencies;

export default function ContactPage() {
  return (
    <>
      <Header />

      <main>
        {/* `min-h-[100dvh]` past 1920 so the sky reaches the foot of the
             window rather than stopping under the content. `min-`, not a fixed
             height, so a taller form still grows the section instead of
             spilling out of it. */}
        <section className="relative overflow-hidden bg-[#2774c1] desktop-xl:min-h-[100dvh]">
          <Sky />

          {/* `pt` clears the fixed 50px header, which the folds do not need to
              do because the hero sits under it on purpose. */}
          <Container className="relative flex min-h-inherit flex-col justify-center pt-[calc(var(--header-height)+40px)] pb-[80px] tablet:pt-[calc(var(--header-height)+72px)] tablet:pb-[120px] desktop-xl:min-h-[100dvh]">
            <div className="flex flex-col gap-[40px] desktop-md:flex-row desktop-md:items-start desktop-md:gap-[80px]">
              {/* ---------- left column ---------- */}
              <Reveal
                variant="stagger"
                start="top bottom"
                className="min-w-0 flex-1"
              >
                {/* One weight, no italic. The reference sets its last line in a
                    script face and we have no equivalent to reach for, so this
                    stays in DM Sans at the same weight as every other heading
                    on the site. */}
                <h1 className="max-w-[620px] text-[40px] leading-[46px] font-bold text-white tablet:text-[56px] tablet:leading-[62px] desktop-sm:text-[64px] desktop-sm:leading-[70px]">
                  Get in touch with our team for any questions
                </h1>

                {/* Quote card. The frosted treatment is the one Fold 05's card
                    uses — a translucent white over the background with a blur
                    behind it — so it reads as the same family. */}
                <figure className="mt-[40px] max-w-[520px] rounded-[16px] border border-white/25 bg-white/12 p-[24px] backdrop-blur-[6px] tablet:p-[28px]">
                  <blockquote className="text-[16px] leading-[26px] text-white tablet:text-[17px] tablet:leading-[28px]">
                    &ldquo;{QUOTE.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-[20px] flex items-center gap-[12px]">
                    <Image
                      src={QUOTE.icon}
                      alt=""
                      width={80}
                      height={80}
                      aria-hidden="true"
                      sizes="40px"
                      className="size-[40px] shrink-0 rounded-[10px] object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block text-[15px] leading-[20px] font-semibold text-white">
                        {QUOTE.app}
                      </span>
                      <span className="block text-[14px] leading-[19px] text-white/75">
                        Verified review · {siteConfig.name}
                      </span>
                    </span>
                  </figcaption>
                </figure>

                {/* Partner strip, straight from Fold 08's data so the two
                    cannot drift apart. */}
              </Reveal>

              {/* ---------- form ---------- */}
              <Reveal
                variant="fade-up"
                start="top bottom"
                className="w-full desktop-md:w-[560px] desktop-md:shrink-0"
              >
                <ContactForm />
              </Reveal>
            </div>
          </Container>
        </section>
      </main>

      <FooterParallax>
        <Footer />
      </FooterParallax>
    </>
  );
}
