import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FooterParallax } from "@/components/layout/FooterParallax";
import { Container } from "@/components/ui/Container";
import { Sky } from "@/components/ui/Sky";
import { Reveal } from "@/components/ui/Reveal";
import { CcpaForm } from "@/components/legal/CcpaForm";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: `Do Not Sell or Share my Personal Information — ${siteConfig.name}`,
  description:
    "Submit a request to access, delete, correct or opt out of the sharing of your personal information.",
};

/**
 * /do-not-sell — the published CCPA request form at
 * atomapplications.com/atom/terms/ccpa-form.html.
 *
 * Built as the contact page is, and from the same pieces: the shared `Sky`, a
 * copy column on the left and the form's white card on the right. The wording
 * is the source form's.
 *
 * The route is `/do-not-sell` rather than `/ccpa-form` because that is the
 * link text the CCPA asks to be carried, and it is what the privacy policy
 * points people at.
 */
export default function DoNotSellPage() {
  return (
    <>
      <Header />

      <main>
        <section className="relative overflow-hidden bg-[#2774c1] desktop-xl:min-h-[100dvh]">
          <Sky />

          {/* `pt` clears the fixed 50px header, which the folds do not need to
              do because the hero sits under it on purpose. */}
          <Container className="relative flex min-h-inherit flex-col justify-center pt-[calc(var(--header-height)+40px)] pb-[80px] tablet:pt-[calc(var(--header-height)+72px)] tablet:pb-[120px] desktop-xl:min-h-[100dvh]">
            <div className="flex flex-col gap-[40px] desktop-md:flex-row desktop-md:items-start desktop-md:gap-[80px]">
              {/* ---------- left column ---------- */}
              <Reveal variant="stagger" start="top bottom" className="min-w-0 flex-1">
                <h1 className="max-w-[620px] text-[40px] leading-[46px] font-bold text-white tablet:text-[52px] tablet:leading-[58px] desktop-sm:text-[58px] desktop-sm:leading-[64px]">
                  Do Not Sell or Share my Personal Information
                </h1>

                <p className="mt-[28px] max-w-[520px] text-[17px] leading-[28px] text-white/90">
                  If you are a U.S. resident, you have certain rights regarding
                  your personal information.
                </p>

                <p className="mt-[16px] max-w-[520px] text-[17px] leading-[28px] text-white/90">
                  If you wish to exercise these rights, submit your request
                  using this form or write to us at{" "}
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="underline underline-offset-2 hover:no-underline"
                  >
                    {siteConfig.email}
                  </a>
                  .
                </p>

                {/* The postal route the published form also offers. */}
                <div className="mt-[40px] max-w-[520px] rounded-[16px] border border-white/25 bg-white/12 p-[24px] backdrop-blur-[6px] tablet:p-[28px]">
                  <p className="text-[14px] leading-[20px] font-medium text-white">
                    You can reach us at:
                  </p>
                  <address className="mt-[10px] text-[15px] leading-[24px] text-white/90 not-italic">
                    584 Castro St #2235
                    <br />
                    San Francisco, CA 94114-2512
                  </address>
                </div>
              </Reveal>

              {/* ---------- form ---------- */}
              <Reveal
                variant="fade-up"
                start="top bottom"
                className="w-full desktop-md:w-[560px] desktop-md:shrink-0"
              >
                <CcpaForm />
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
