import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MoreApps } from "@/components/apps/MoreApps";
import { ICON_RADIUS } from "@/components/folds/fold03/appIcons";
import { appIconSrc, type ComingSoonApp } from "@/data/apps";

/**
 * The lander for an app with no Play Store listing yet.
 *
 * Deliberately the released pages' hero and nothing after it: the same tinted
 * band, the same headline treatment, the same numbered features. What it does
 * not have is what an unreleased app cannot honestly show — a rating, an
 * install count, store posters, or a button that claims to take you to a
 * listing. The icon stands in for the poster, because it is the only artwork
 * that exists.
 *
 * The one thing asked of the reader is to get in touch, which is a real page
 * on this site rather than a mailing-list field that goes nowhere.
 */

const H2 =
  "text-[28px] leading-[34px] font-extrabold text-[var(--foreground)] tablet:text-[36px] tablet:leading-[42px] desktop-sm:text-[42px] desktop-sm:leading-[48px]";
const EYEBROW = "text-[13px] leading-[18px] font-semibold tracking-[0.08em] uppercase text-[var(--accent)]";

export function ComingSoonPage({ app }: { app: ComingSoonApp }) {
  const headlineLines = app.headline.split("\n");

  return (
    <main style={{ "--accent": app.accent } as CSSProperties}>
      {/* ================= hero ================= */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: [
            "radial-gradient(60% 70% at 85% 10%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 70%)",
            "linear-gradient(180deg, color-mix(in srgb, var(--accent) 10%, #fff) 0%, #fff 100%)",
          ].join(","),
        }}
      >
        <Container className="pt-[calc(var(--header-height)+32px)] pb-[56px] tablet:pt-[calc(var(--header-height)+56px)] tablet:pb-[80px]">
          <nav aria-label="Breadcrumb" className="text-[14px] leading-[20px] text-[#61616a]">
            <Link href="/" className="underline underline-offset-2 hover:no-underline">
              Home
            </Link>
            <span aria-hidden="true" className="mx-[8px]">
              /
            </span>
            <Link href="/#fold-03" className="underline underline-offset-2 hover:no-underline">
              Our apps
            </Link>
          </nav>

          <div className="mt-[32px] grid items-center gap-[48px] tablet:mt-[48px] desktop-sm:grid-cols-[minmax(0,1fr)_400px] desktop-sm:gap-[80px]">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-[12px]">
                <span className="text-[15px] leading-[20px] font-semibold text-[var(--foreground)] tablet:text-[16px]">
                  {app.name}
                </span>
                <span className="rounded-full bg-[var(--foreground)] px-[12px] py-[5px] text-[12px] leading-[16px] font-semibold tracking-[0.04em] text-white uppercase">
                  Coming soon
                </span>
              </p>

              <h1 className="mt-[24px] text-[40px] leading-[44px] font-extrabold tracking-[-0.01em] text-[var(--foreground)] tablet:mt-[28px] tablet:text-[56px] tablet:leading-[60px] desktop-md:text-[68px] desktop-md:leading-[72px]">
                {headlineLines.map((line, index) => (
                  <span key={index} className="block">
                    {line}
                  </span>
                ))}
              </h1>

              <p className="mt-[20px] max-w-[52ch] text-[17px] leading-[27px] text-[#3f3f46] tablet:mt-[24px] tablet:text-[19px] tablet:leading-[30px]">
                {app.summary}
              </p>

              <div className="mt-[32px] flex flex-wrap items-center gap-x-[24px] gap-y-[16px] tablet:mt-[40px]">
                {/* Not a store button: there is nothing to link to yet, and a
                    dead one would be worse than none. */}
                <span className="inline-flex h-[44px] items-center rounded-full border border-[var(--border)] bg-white px-[20px] text-[15px] leading-[20px] font-medium text-[#3f3f46]">
                  Not on Google Play yet
                </span>
                <Link
                  href="/contact"
                  data-underline-link
                  className="text-[15px] leading-[20px] font-medium text-[var(--foreground)]"
                >
                  Ask us about it
                </Link>
              </div>
            </div>

            {/* The icon is the only art this app has, so it is the hero image
                rather than a poster. Sized against the released pages' poster
                so the two heroes have the same weight. */}
            <div className="mx-auto w-full max-w-[280px] desktop-sm:max-w-none">
              <span
                className="relative block overflow-hidden shadow-[0_30px_70px_-24px_color-mix(in_srgb,var(--accent)_65%,transparent)]"
                style={{ borderRadius: "22.5%" }}
              >
                <Image
                  src={appIconSrc(app)}
                  alt=""
                  width={374}
                  height={376}
                  priority
                  sizes="(max-width: 767px) 70vw, 340px"
                  className="aspect-square w-full object-cover"
                />
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ================= what it is ================= */}
      <Container as="section" aria-labelledby="about-heading" className="pt-[64px] tablet:pt-[96px]">
        <div className="grid gap-[24px] desktop-sm:grid-cols-[280px_minmax(0,1fr)] desktop-sm:gap-[80px]">
          <h2 id="about-heading" className={H2}>
            About {app.title}
          </h2>
          <div className="flex max-w-[72ch] flex-col gap-[18px]">
            {app.intro.map((paragraph) => (
              <p key={paragraph} className="text-[16px] leading-[26px] text-[#3f3f46] tablet:text-[17px] tablet:leading-[28px]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>

      {/* ================= what it will do ================= */}
      <Container as="section" aria-labelledby="features-heading" className="pt-[72px] tablet:pt-[112px]">
        <h2 id="features-heading" className={H2}>
          What it will do
        </h2>
        <ul className="mt-[32px] grid gap-[16px] tablet:mt-[40px] tablet:grid-cols-3 tablet:gap-[20px]">
          {app.features.map((feature, index) => (
            <li
              key={feature.icon}
              className="flex flex-col gap-[16px] rounded-[18px] border border-[var(--border)] p-[24px] tablet:p-[28px]"
            >
              <span className={EYEBROW}>{String(index + 1).padStart(2, "0")}</span>
              <Image
                src={`/images/fold05/icons/${feature.icon}.svg`}
                alt=""
                width={28}
                height={28}
                className="size-[28px]"
              />
              <p className="text-[16px] leading-[25px] text-[var(--foreground)]">{feature.text}</p>
            </li>
          ))}
        </ul>
      </Container>

      {/* ================= closing ================= */}
      <section className="mt-[80px] bg-[#171717] py-[72px] text-white tablet:mt-[120px] tablet:py-[112px]">
        <Container className="flex flex-col items-center text-center">
          <span className="block size-[72px] overflow-hidden tablet:size-[88px]" style={{ borderRadius: ICON_RADIUS }}>
            <Image
              src={appIconSrc(app)}
              alt=""
              width={374}
              height={376}
              sizes="88px"
              className="aspect-square w-full object-cover"
            />
          </span>
          <h2 className="mt-[28px] max-w-[18ch] text-[32px] leading-[38px] font-extrabold tablet:text-[48px] tablet:leading-[54px]">
            {app.title} is on the way
          </h2>
          <p className="mt-[16px] max-w-[46ch] text-[16px] leading-[26px] text-white/70 tablet:text-[17px]">
            It is in development now. In the meantime, the rest of the family is on Google Play
            today.
          </p>
          <Link
            href="/contact"
            className="mt-[32px] inline-flex h-[44px] items-center rounded-full bg-white px-[24px] text-[15px] leading-[20px] font-semibold text-[#171717] transition-colors duration-300 can-hover:hover:bg-white/85 motion-reduce:transition-none"
          >
            Get in touch
          </Link>
        </Container>
      </section>

      {/* ================= the rest of the family ================= */}
      <Container className="pt-[72px] pb-[80px] tablet:pt-[112px] tablet:pb-[120px]">
        <MoreApps currentSlug={app.slug} />
      </Container>
    </main>
  );
}
