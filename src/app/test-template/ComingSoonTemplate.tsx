import type { CSSProperties } from "react";
import Image from "next/image";
import { CARD_BGS, CARD_H3, H2, SUB } from "./AppTemplate";
import { ComingSoonHero } from "./ComingSoonHero";
import { RingCta } from "./RingCta";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FooterParallax } from "@/components/layout/FooterParallax";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MoreApps } from "@/components/apps/MoreApps";
import { ICON_RADIUS } from "@/components/folds/fold03/appIcons";
import { appIconSrc, type ComingSoonApp } from "@/data/apps";

/**
 * The master app template's page for an app that isn't on Google Play yet:
 * AppTemplate's bands, in its type and card styles, with only what an
 * unreleased app can honestly show. No rating, installs, posters or reviews;
 * the feature cards show each planned feature's icon where the released
 * pages show a poster, the dark spotlight card becomes the closing ask, and
 * every button goes to the contact page rather than a store.
 */
export function ComingSoonTemplate({ app }: { app: ComingSoonApp }) {
  return (
    <>
      <Header />

      <main className="overflow-x-clip bg-white text-[var(--foreground)]" style={{ "--accent": app.accent } as CSSProperties}>
        <style>{`@keyframes tt-spin{to{transform:rotate(1turn)}}`}</style>

        <ComingSoonHero app={app} />

        {/* ================= about ================= */}
        {/* In the place of the released pages' store badges and "Join …" line. */}
        <section className="pt-16 text-center tablet:pt-24">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white py-2 pr-5 pl-4 text-[14px] leading-[20px] font-medium tablet:text-[15px]">
            <span className="size-2 rounded-full bg-[var(--accent)]" />
            In development · Android
          </p>
          <Container>
            <h2 className="mx-auto mt-8 max-w-[20ch] text-[36px] leading-[1.08] font-semibold tracking-[-0.02em] tablet:mt-10 tablet:text-[64px]">
              Meet {app.title}
            </h2>
            <div className={`mx-auto mt-6 flex max-w-[60ch] flex-col gap-4 ${SUB}`}>
              {app.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Container>
        </section>

        {/* ================= feature cards ================= */}
        <Container as="section" className="pt-28 text-center">
          <h2 className={`mx-auto max-w-[16ch] ${H2}`}>What it will do</h2>
          <p className={`mx-auto mt-4 max-w-[52ch] ${SUB}`}>{app.summary}</p>
          <Reveal variant="stagger" className="mx-auto mt-12 grid max-w-[1100px] gap-4 text-left desktop-sm:grid-cols-3">
            {app.features.map(({ icon, text }, i) => (
              <div key={icon} className="relative h-[440px] overflow-hidden rounded-[28px] p-7" style={{ background: CARD_BGS[i % CARD_BGS.length] }}>
                <p className="text-[13px] font-semibold tracking-[0.08em] text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</p>
                <h3 className={`mt-2 ${CARD_H3}`}>{text}</h3>
                {/* The feature's icon on the launcher card's orbit rings, where a poster would be. */}
                <div className="absolute inset-x-0 bottom-0 grid h-[220px] place-items-center">
                  <span aria-hidden className="absolute size-[300px] rounded-full border border-white/80" />
                  <span aria-hidden className="absolute size-[190px] rounded-full border border-white/80" />
                  <span aria-hidden className="absolute size-24 rounded-full bg-[var(--accent)] opacity-25 blur-2xl" />
                  <span className="relative grid size-24 place-items-center rounded-[28px] bg-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]">
                    <Image src={`/images/fold05/icons/${icon}.svg`} alt="" width={48} height={48} className="size-12" />
                  </span>
                </div>
              </div>
            ))}
          </Reveal>
        </Container>

        {/* ================= closing ================= */}
        {/* The spotlight card's dark band, in the app's accent, as the ask. */}
        <Container as="section" className="pt-4">
          <Reveal>
            <div
              className="relative mx-auto flex min-h-[440px] max-w-[1100px] flex-col items-center justify-center overflow-hidden rounded-[28px] px-6 py-16 text-center text-white"
              style={{
                background: [
                  "radial-gradient(80% 100% at 0% 100%, color-mix(in srgb, var(--accent) 70%, transparent) 0%, transparent 50%)",
                  "radial-gradient(80% 100% at 100% 100%, color-mix(in srgb, var(--accent) 70%, transparent) 0%, transparent 50%)",
                  "linear-gradient(90deg, color-mix(in srgb, var(--accent) 25%, #1f2026), #1f2026 40%, #1f2026 60%, color-mix(in srgb, var(--accent) 25%, #1f2026))",
                ].join(","),
              }}
            >
              <Image
                src={appIconSrc(app)}
                alt=""
                width={374}
                height={376}
                className="absolute top-1/2 left-1/2 w-[340px] -translate-1/2 opacity-15 grayscale"
                style={{ borderRadius: ICON_RADIUS }}
              />
              <div className="relative max-w-[46ch]">
                <h2 className={H2}>{app.title} is on the way</h2>
                <p className="mt-3 text-white/60">It&rsquo;s in development now. In the meantime, the rest of the family is on Google Play today.</p>
                <div className="mt-8 flex justify-center">
                  <RingCta
                    href="/contact"
                    eyebrow="Want to know more?"
                    label="Get in touch"
                    icon={
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" />
                      </svg>
                    }
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </Container>

        {/* ================= the rest of the family ================= */}
        <Container className="pt-[72px] pb-[80px] tablet:pt-[112px] tablet:pb-[120px]">
          <MoreApps currentSlug={app.slug} />
        </Container>
      </main>

      <FooterParallax>
        <Footer />
      </FooterParallax>
    </>
  );
}
