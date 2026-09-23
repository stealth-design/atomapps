import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FooterParallax } from "@/components/layout/FooterParallax";
import { Container } from "@/components/ui/Container";
import { ComingSoonPage } from "@/components/apps/ComingSoonPage";
import { MoreApps } from "@/components/apps/MoreApps";
import { PlayStoreButton } from "@/components/apps/PlayStoreButton";
import { Poster } from "@/components/apps/Poster";
import { StarRating } from "@/components/apps/StarRating";
import { ICON_RADIUS } from "@/components/folds/fold03/appIcons";
import { REVIEWS } from "@/components/folds/fold07/testimonials";
import {
  APP_INDEX,
  APPS_SNAPSHOT,
  LAUNCHER_NOTE,
  appIconSrc,
  getApp,
  getComingSoon,
  type AppFeature,
} from "@/data/apps";
import { siteConfig } from "@/data/site";

/**
 * /apps/[slug] — one page per Play Store listing, all from `@/data/apps`.
 *
 * Laid out the way the apps' own sites are, not the way the store is. Every
 * page is the same run of bands, and a band an app has nothing for is left
 * out:
 *
 *   hero        headline written from the summary, the store poster beside it
 *   stats       the store's header figures as one strip
 *   lead        the listing's opening paragraph and its tick list
 *   features    one row per feature that has a poster, text and image
 *               alternating sides; the rest in a compact grid after them
 *   launcher    what the launcher itself adds, with its two posters
 *   about       the rest of the listing's prose
 *   reviews     the app's own Google Play reviews, from Fold 07's set
 *   closing     a dark band with the store button and every link
 *   more apps   the rest of the family
 *
 * `--accent` is the app's colour from the data. It tints the hero and
 * numbers the features, and that is all — the type stays the site's
 * near-black so fourteen pages in fourteen colours still read as one site.
 *
 * Built from the pieces the site already has — `Header`, `Footer`,
 * `Container` — the way /contact is, so it inherits the type scale and the
 * 1440 content width rather than restating them. Statically generated: the
 * slugs are known at build time, and an unknown one is a 404.
 */

export function generateStaticParams() {
  return APP_INDEX.map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apps/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) {
    // The unreleased apps have no listing to describe, so the metadata says
    // what the page says.
    const soon = getComingSoon(slug);
    return soon
      ? { title: `${soon.name} | ${siteConfig.name}`, description: `${soon.summary} Coming soon.` }
      : {};
  }
  const hero = app.screenshots[app.heroShot - 1];
  return {
    title: `${app.name} | ${siteConfig.name}`,
    description: app.summary,
    openGraph: {
      title: app.name,
      description: app.summary,
      images: hero ? [{ url: hero.src, width: hero.width, height: hero.height }] : [],
    },
  };
}

/** The store's header figures, formatted the way it prints them. */
const formatCount = (count: number) =>
  count >= 1000 ? `${Math.round(count / 1000)}K` : String(count);

const two = (index: number) => String(index + 1).padStart(2, "0");

const H2 =
  "text-[28px] leading-[34px] font-extrabold text-[var(--foreground)] tablet:text-[36px] tablet:leading-[42px] desktop-sm:text-[42px] desktop-sm:leading-[48px]";
const BODY = "text-[16px] leading-[26px] text-[#3f3f46] tablet:text-[17px] tablet:leading-[28px]";
const EYEBROW = "text-[13px] leading-[18px] font-semibold tracking-[0.08em] uppercase text-[var(--accent)]";
const LINK = "underline underline-offset-2 hover:no-underline";

export default async function AppDetailPage({ params }: PageProps<"/apps/[slug]">) {
  const { slug } = await params;
  const app = getApp(slug);

  // An app with no listing gets the lander instead of the full layout — see
  // ComingSoonPage for what it leaves out and why.
  if (!app) {
    const soon = getComingSoon(slug);
    if (!soon) notFound();
    return (
      <>
        <Header />
        <ComingSoonPage app={soon} />
        <FooterParallax>
          <Footer />
        </FooterParallax>
      </>
    );
  }

  const featured = app.features.filter((feature) => feature.shot !== undefined);
  const others = app.features.filter((feature) => feature.shot === undefined);
  const reviews = REVIEWS.filter((review) => review.slug === app.slug).slice(0, 3);
  const [lead, ...rest] = app.intro;
  const headlineLines = app.headline.split("\n");

  return (
    <>
      <Header />

      <main style={{ "--accent": app.accent } as CSSProperties}>
        {/* ================= hero ================= */}
        {/* The tint is the accent at a tenth, fading to the page's white by
            the foot of the band, so the stats strip under it sits on plain
            white. `pt` clears the fixed 50px header. */}
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
              <Link href="/" className={LINK}>
                Home
              </Link>
              <span aria-hidden="true" className="mx-[8px]">
                /
              </span>
              <Link href="/#fold-03" className={LINK}>
                Our apps
              </Link>
            </nav>

            <div className="mt-[32px] grid items-center gap-[48px] tablet:mt-[48px] desktop-sm:grid-cols-[minmax(0,1fr)_400px] desktop-sm:gap-[80px] desktop-md:grid-cols-[minmax(0,1fr)_440px]">
              <div className="min-w-0">
                {/* The store name is the byline here, not the headline. */}
                <p className="flex items-center gap-[12px]">
                  <span className="block size-[40px] shrink-0 overflow-hidden tablet:size-[44px]" style={{ borderRadius: ICON_RADIUS }}>
                    <Image
                      src={appIconSrc(app)}
                      alt=""
                      width={279}
                      height={280}
                      priority
                      sizes="44px"
                      className="aspect-square w-full object-cover"
                    />
                  </span>
                  <span className="text-[15px] leading-[20px] font-semibold text-[var(--foreground)] tablet:text-[16px]">
                    {app.name}
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
                  <PlayStoreButton app={app} />
                  <a
                    href={app.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-underline-link
                    className="text-[15px] leading-[20px] font-medium text-[var(--foreground)]"
                  >
                    Visit the app&rsquo;s website
                  </a>
                </div>
              </div>

              {/* The poster leans a touch, the way a phone does in someone's
                  hand. Straight on a phone, where it fills the width. */}
              <Poster
                app={app}
                shot={app.heroShot}
                alt={`${app.name} on Android`}
                priority
                sizes="(max-width: 767px) 80vw, 440px"
                className="mx-auto w-full max-w-[360px] desktop-sm:max-w-none desktop-sm:rotate-[-2deg]"
              />
            </div>
          </Container>
        </section>

        {/* ================= stats strip ================= */}
        <Container>
          <dl className="grid grid-cols-2 gap-y-[24px] border-y border-[var(--border)] py-[24px] tablet:grid-cols-5 tablet:gap-y-0 tablet:py-[28px]">
            <Stat label={`${formatCount(app.ratingCount)} reviews`}>
              <span className="flex items-center gap-[8px]">
                {app.rating.toFixed(1)}
                <StarRating rating={app.rating} className="block h-[16px]" />
              </span>
            </Stat>
            <Stat label="Downloads">{app.downloads}</Stat>
            <Stat label="Content rating">{app.contentRating}</Stat>
            <Stat label="Category">{app.category}</Stat>
            <Stat label="Updated">{app.updated}</Stat>
          </dl>
        </Container>

        {/* ================= lead ================= */}
        {lead && (
          <Container className="pt-[64px] tablet:pt-[96px]">
            <div className="max-w-[760px]">
              <p className="text-[20px] leading-[32px] font-medium text-[var(--foreground)] tablet:text-[24px] tablet:leading-[36px]">
                {lead}
              </p>
              {app.highlights && app.highlights.length > 0 && (
                <ul className="mt-[28px] flex flex-wrap gap-[10px]">
                  {app.highlights.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-[var(--border)] bg-white px-[14px] py-[7px] text-[14px] leading-[20px] text-[var(--foreground)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Container>
        )}

        {/* ================= features ================= */}
        {featured.length > 0 && (
          <Container as="section" aria-label="Features" className="pt-[72px] tablet:pt-[112px]">
            <div className="flex flex-col gap-[72px] tablet:gap-[120px]">
              {featured.map((feature, index) => (
                <FeatureRow key={feature.title} feature={feature} index={index} flip={index % 2 === 1} app={app} />
              ))}
            </div>
          </Container>
        )}

        {others.length > 0 && (
          <Container as="section" aria-labelledby="more-features" className="pt-[72px] tablet:pt-[112px]">
            <h2 id="more-features" className={H2}>
              {featured.length > 0 ? `Also in ${app.title}` : "Features"}
            </h2>
            <ul className="mt-[32px] grid gap-[16px] tablet:mt-[40px] tablet:grid-cols-2 desktop-sm:grid-cols-3">
              {others.map((feature, index) => (
                <li
                  key={feature.title}
                  className="flex flex-col gap-[12px] rounded-[18px] border border-[var(--border)] p-[24px] tablet:p-[28px]"
                >
                  <span className={EYEBROW}>{two(featured.length + index)}</span>
                  <h3 className="text-[19px] leading-[26px] font-bold text-[var(--foreground)]">{feature.title}</h3>
                  {feature.text && <p className="text-[15px] leading-[24px] text-[#3f3f46]">{feature.text}</p>}
                  {feature.bullets && <Bullets items={feature.bullets} />}
                </li>
              ))}
            </ul>
          </Container>
        )}

        {/* ================= the launcher ================= */}
        <section className="mt-[80px] bg-[var(--surface)] py-[72px] tablet:mt-[120px] tablet:py-[112px]">
          <Container>
            <div className="grid items-center gap-[48px] desktop-sm:grid-cols-[minmax(0,1fr)_480px] desktop-sm:gap-[80px]">
              <div className="min-w-0">
                <p className={EYEBROW}>It&rsquo;s a launcher</p>
                <h2 className={`mt-[12px] ${H2}`}>One swipe from your home screen.</h2>
                <p className={`mt-[20px] max-w-[52ch] ${BODY}`}>
                  {app.title} lives on your home screen rather than in your app drawer, so everything
                  above is a swipe to the right away. It brings a few things of its own with it:
                </p>
                <ul className="mt-[32px] flex flex-col gap-[20px]">
                  {app.launcherBenefits.map((benefit, index) => (
                    <li key={benefit.title} className="flex gap-[16px]">
                      <span className={`${EYEBROW} mt-[4px] w-[28px] shrink-0`}>{two(index)}</span>
                      <div className="min-w-0">
                        <h3 className="text-[17px] leading-[24px] font-bold text-[var(--foreground)]">{benefit.title}</h3>
                        <p className="mt-[4px] text-[15px] leading-[24px] text-[#3f3f46]">{benefit.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-[32px] max-w-[52ch] text-[14px] leading-[22px] text-[#61616a]">
                  <strong className="font-semibold text-[var(--foreground)]">Please note: </strong>
                  {LAUNCHER_NOTE}
                  {app.links.faq && (
                    <>
                      {" "}
                      <a href={app.links.faq} target="_blank" rel="noopener noreferrer" className={LINK}>
                        Read the FAQ
                      </a>
                      .
                    </>
                  )}
                </p>
              </div>

              {/* The two launcher posters every listing carries, one a little
                  behind the other so the pair reads as a stack rather than a
                  strip. */}
              <div className="relative mx-auto grid w-full max-w-[480px] grid-cols-2 items-end gap-[16px] tablet:gap-[24px]">
                <Poster
                  app={app}
                  shot={app.launcherShots[0]}
                  alt={`${app.name}: one-swipe access from the home screen`}
                  sizes="(max-width: 767px) 40vw, 230px"
                  className="desktop-sm:-translate-y-[24px]"
                />
                <Poster
                  app={app}
                  shot={app.launcherShots[1]}
                  alt={`${app.name}: the home screen search widget`}
                  sizes="(max-width: 767px) 40vw, 230px"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* ================= about ================= */}
        {rest.length > 0 && (
          <Container as="section" aria-labelledby="about-heading" className="pt-[72px] tablet:pt-[112px]">
            <div className="grid gap-[24px] desktop-sm:grid-cols-[280px_minmax(0,1fr)] desktop-sm:gap-[80px]">
              <h2 id="about-heading" className={H2}>
                About {app.title}
              </h2>
              <div className="flex max-w-[72ch] flex-col gap-[18px]">
                {rest.map((paragraph) => (
                  <p key={paragraph} className={BODY}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Container>
        )}

        {/* ================= reviews ================= */}
        {reviews.length > 0 && (
          <Container as="section" aria-labelledby="reviews-heading" className="pt-[72px] tablet:pt-[112px]">
            <div className="flex flex-wrap items-end justify-between gap-[16px]">
              <h2 id="reviews-heading" className={H2}>
                From Google Play reviews
              </h2>
              <p className="text-[15px] leading-[22px] text-[#61616a]">
                {app.rating.toFixed(1)} average from {app.ratingCount.toLocaleString("en-US")} ratings
              </p>
            </div>
            <ul className="mt-[32px] grid gap-[16px] tablet:mt-[40px] tablet:grid-cols-3 tablet:gap-[20px]">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="flex flex-col gap-[16px] rounded-[20px] bg-white p-[24px] shadow-[0_10px_28px_rgba(0,0,0,0.05)] ring-1 ring-black/5 tablet:p-[28px]"
                >
                  <span
                    aria-label="Rated 5 out of 5"
                    className="text-[14px] leading-[16px] tracking-[0.5px] text-[#ffbf00]"
                  >
                    ★★★★★
                  </span>
                  <blockquote className="text-[16px] leading-[26px] text-[var(--foreground)]">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                </li>
              ))}
            </ul>
          </Container>
        )}

        {/* ================= closing band ================= */}
        <section className="mt-[80px] bg-[#171717] py-[72px] text-white tablet:mt-[120px] tablet:py-[112px]">
          <Container className="flex flex-col items-center text-center">
            <span className="block size-[72px] overflow-hidden tablet:size-[88px]" style={{ borderRadius: ICON_RADIUS }}>
              <Image
                src={appIconSrc(app)}
                alt=""
                width={279}
                height={280}
                sizes="88px"
                className="aspect-square w-full object-cover"
              />
            </span>
            <h2 className="mt-[28px] max-w-[18ch] text-[32px] leading-[38px] font-extrabold tablet:text-[48px] tablet:leading-[54px]">
              Get {app.title} on Google Play
            </h2>
            <p className="mt-[16px] text-[16px] leading-[24px] text-white/70 tablet:text-[17px] tablet:leading-[26px]">
              Free · {app.category} · {app.contentRating}
            </p>
            <PlayStoreButton app={app} tone="light" className="mt-[32px]" />

            <ul className="mt-[40px] flex flex-wrap justify-center gap-x-[24px] gap-y-[10px] text-[14px] leading-[20px] text-white/70 tablet:mt-[48px]">
              <li>
                <a href={app.website} target="_blank" rel="noopener noreferrer" className={LINK}>
                  Website
                </a>
              </li>
              {app.links.faq && (
                <li>
                  <a href={app.links.faq} target="_blank" rel="noopener noreferrer" className={LINK}>
                    FAQ
                  </a>
                </li>
              )}
              {app.links.contact && (
                <li>
                  <a href={app.links.contact} target="_blank" rel="noopener noreferrer" className={LINK}>
                    Contact
                  </a>
                </li>
              )}
              {app.links.terms && (
                <li>
                  <a href={app.links.terms} target="_blank" rel="noopener noreferrer" className={LINK}>
                    Terms of Service
                  </a>
                </li>
              )}
              {app.links.privacy && (
                <li>
                  <a href={app.links.privacy} target="_blank" rel="noopener noreferrer" className={LINK}>
                    Privacy Policy
                  </a>
                </li>
              )}
            </ul>
            <p className="mt-[20px] text-[12px] leading-[18px] text-white/40">
              Rating, reviews and downloads as shown on Google Play on {APPS_SNAPSHOT}.
            </p>
          </Container>
        </section>

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

/* ------------------------------------------------------------------------ */

/** One figure in the stats strip. */
function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[4px] tablet:border-l tablet:border-[var(--border)] tablet:pl-[24px] tablet:first:border-l-0 tablet:first:pl-0">
      <dd className="order-1 text-[20px] leading-[26px] font-bold text-[var(--foreground)] tablet:text-[22px] tablet:leading-[28px]">
        {children}
      </dd>
      <dt className="order-2 text-[13px] leading-[18px] text-[#61616a]">{label}</dt>
    </div>
  );
}

/**
 * One feature with its poster: copy on one side, the store's frame on the
 * other, sides swapping row by row. The number is the feature's place in the
 * page's sequence, and continues into the compact grid after these rows.
 */
function FeatureRow({
  feature,
  index,
  flip,
  app,
}: {
  feature: AppFeature;
  index: number;
  flip: boolean;
  app: Parameters<typeof Poster>[0]["app"];
}) {
  return (
    <div className="grid items-center gap-[32px] desktop-sm:grid-cols-2 desktop-sm:gap-[80px]">
      <div className={`min-w-0 ${flip ? "desktop-sm:order-2" : ""}`}>
        <span className={EYEBROW}>{two(index)}</span>
        <h2 className={`mt-[12px] ${H2}`}>{feature.title}</h2>
        {feature.text && <p className={`mt-[20px] max-w-[52ch] ${BODY}`}>{feature.text}</p>}
        {feature.bullets && <Bullets items={feature.bullets} className="mt-[20px]" />}
      </div>
      <Poster
        app={app}
        shot={feature.shot ?? 0}
        alt={`${app.name}: ${feature.title}`}
        className={`mx-auto w-full max-w-[340px] tablet:max-w-[380px] ${flip ? "desktop-sm:order-1" : ""}`}
      />
    </div>
  );
}

function Bullets({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`grid gap-[8px] text-[15px] leading-[24px] text-[#3f3f46] tablet:grid-cols-2 tablet:gap-x-[24px] ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-[10px]">
          <span aria-hidden="true" className="mt-[10px] size-[5px] shrink-0 rounded-full bg-[var(--accent)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
