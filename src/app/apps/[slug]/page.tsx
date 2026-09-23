import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FooterParallax } from "@/components/layout/FooterParallax";
import { Container } from "@/components/ui/Container";
import { AppScreenshots } from "@/components/apps/AppScreenshots";
import { MoreApps } from "@/components/apps/MoreApps";
import { PlayStoreButton } from "@/components/apps/PlayStoreButton";
import { StarRating } from "@/components/apps/StarRating";
import { ICON_RADIUS } from "@/components/folds/fold03/appIcons";
import {
  APPS,
  APPS_SNAPSHOT,
  LAUNCHER_NOTE,
  appIconSrc,
  getApp,
  playStoreUrl,
  type AppFeature,
} from "@/data/apps";
import { siteConfig } from "@/data/site";

/**
 * /apps/[slug] — one page per Play Store listing, all from `@/data/apps`.
 *
 * Every page is the same run of sections, in this order, and a section an app
 * has nothing for is simply left out:
 *
 *   hero          icon, name, one-liner, the store's header stats, the CTA
 *   screenshots   the listing's own strip
 *   about         the "About this app" prose, its tick list, its features
 *   launcher      the five things the launcher itself adds, and the notice
 *   details       the facts the store prints in its sidebar, plus every link
 *   more apps     the rest of the family
 *
 * Built from the pieces the site already has — `Header`, `Footer`,
 * `Container` — the way /contact and /privacy are, so it inherits the type
 * scale, the 1440 content width and the gutters rather than restating them.
 * `pt` clears the fixed 50px header.
 *
 * Statically generated: the slugs are known at build time, and an unknown
 * one is a 404 rather than an empty page.
 */

export function generateStaticParams() {
  return APPS.map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apps/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) return {};
  return {
    title: `${app.name} | ${siteConfig.name}`,
    description: app.summary,
    openGraph: {
      title: app.name,
      description: app.summary,
      images: app.screenshots.slice(0, 1).map((shot) => ({ url: shot.src, width: shot.width, height: shot.height })),
    },
  };
}

/** The store's header stats, formatted the way it prints them. */
const formatCount = (count: number) =>
  count >= 1000 ? `${Math.round(count / 1000)}K` : String(count);

const H2 = "text-[24px] leading-[30px] font-extrabold text-[var(--foreground)] tablet:text-[30px] tablet:leading-[38px]";
const BODY = "text-[15px] leading-[25px] text-[#3f3f46] tablet:text-[16px] tablet:leading-[27px]";
const LINK = "underline underline-offset-2 hover:no-underline";

export default async function AppDetailPage({ params }: PageProps<"/apps/[slug]">) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();

  const storeUrl = playStoreUrl(app);

  return (
    <>
      <Header />

      <main>
        <Container className="pt-[calc(var(--header-height)+40px)] pb-[80px] tablet:pt-[calc(var(--header-height)+64px)] tablet:pb-[120px]">
          {/* ---------- hero ---------- */}
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
            <span aria-hidden="true" className="mx-[8px]">
              /
            </span>
            <span className="text-[var(--foreground)]">{app.title}</span>
          </nav>

          <header className="mt-[28px] flex flex-col gap-[24px] tablet:mt-[40px] tablet:flex-row tablet:items-start tablet:gap-[36px]">
            <span
              className="block size-[96px] shrink-0 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] tablet:size-[128px] desktop-sm:size-[152px]"
              style={{ borderRadius: ICON_RADIUS }}
            >
              <Image
                src={appIconSrc(app)}
                alt=""
                width={279}
                height={280}
                priority
                sizes="(max-width: 767px) 96px, 152px"
                className="aspect-square w-full object-cover"
              />
            </span>

            <div className="min-w-0 flex-1">
              <h1 className="text-[32px] leading-[38px] font-extrabold text-[var(--foreground)] tablet:text-[44px] tablet:leading-[50px] desktop-sm:text-[52px] desktop-sm:leading-[58px]">
                {app.name}
              </h1>
              <p className="mt-[12px] max-w-[62ch] text-[16px] leading-[24px] text-[#3f3f46] tablet:mt-[16px] tablet:text-[18px] tablet:leading-[28px]">
                {app.summary}
              </p>

              {/* The store's own header row: rating, reviews, downloads, age. */}
              <dl className="mt-[24px] flex flex-wrap items-stretch gap-y-[16px] tablet:mt-[32px]">
                <Stat label={`${formatCount(app.ratingCount)} reviews`}>
                  <span className="flex items-center gap-[8px]">
                    {app.rating.toFixed(1)}
                    <StarRating rating={app.rating} className="block h-[16px] tablet:h-[18px]" />
                  </span>
                </Stat>
                <Stat label="Downloads">{app.downloads}</Stat>
                <Stat label="Content rating">{app.contentRating}</Stat>
                <Stat label="Category" last>
                  {app.category}
                </Stat>
              </dl>

              <div className="mt-[28px] flex flex-wrap items-center gap-x-[24px] gap-y-[16px] tablet:mt-[36px]">
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
          </header>

          {/* ---------- screenshots ---------- */}
          <div className="mt-[48px] tablet:mt-[64px]">
            <AppScreenshots app={app} />
          </div>

          {/* ---------- body: prose left, facts right ---------- */}
          <div className="mt-[56px] grid gap-[56px] tablet:mt-[72px] desktop-sm:grid-cols-[minmax(0,1fr)_340px] desktop-sm:gap-[80px]">
            <div className="min-w-0">
              {/* ---- about ---- */}
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className={H2}>
                  About this app
                </h2>
                <div className="mt-[20px] flex max-w-[72ch] flex-col gap-[16px] tablet:mt-[24px]">
                  {app.intro.map((paragraph) => (
                    <p key={paragraph} className={BODY}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {app.highlights && app.highlights.length > 0 && (
                  <ul className="mt-[28px] grid gap-[12px] tablet:grid-cols-2 tablet:gap-x-[24px]">
                    {app.highlights.map((item) => (
                      <li key={item} className="flex gap-[12px] text-[15px] leading-[24px] text-[var(--foreground)]">
                        <Check />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* ---- features ---- */}
              {app.features.length > 0 && (
                <section aria-labelledby="features-heading" className="mt-[56px] tablet:mt-[72px]">
                  <h2 id="features-heading" className={H2}>
                    Features
                  </h2>
                  <ul className="mt-[24px] grid gap-[16px] tablet:mt-[32px] tablet:grid-cols-2 tablet:gap-[20px]">
                    {app.features.map((feature) => (
                      <FeatureCard key={feature.title} feature={feature} />
                    ))}
                  </ul>
                </section>
              )}

              {/* ---- any other lists the listing carries ---- */}
              {app.lists?.map((list) => (
                <section key={list.heading || list.items[0]} className="mt-[48px] tablet:mt-[64px]">
                  {list.heading && (
                    <h2 className="text-[20px] leading-[28px] font-bold text-[var(--foreground)] tablet:text-[24px] tablet:leading-[32px]">
                      {list.heading}
                    </h2>
                  )}
                  <ul className="mt-[16px] grid gap-[12px] tablet:grid-cols-2 tablet:gap-x-[24px]">
                    {list.items.map((item) => (
                      <li key={item} className="flex gap-[12px] text-[15px] leading-[24px] text-[var(--foreground)]">
                        <Check />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              {/* ---- the launcher ---- */}
              <section aria-labelledby="launcher-heading" className="mt-[56px] tablet:mt-[72px]">
                <h2 id="launcher-heading" className={H2}>
                  What the launcher adds
                </h2>
                <p className={`mt-[16px] max-w-[72ch] ${BODY}`}>
                  {app.title} is a launcher: it lives on your home screen, so everything above is one
                  swipe away. With it you also get:
                </p>
                <ul className="mt-[24px] flex flex-col divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  {app.launcherBenefits.map((benefit) => (
                    <li key={benefit.title} className="flex gap-[16px] py-[16px] tablet:gap-[20px] tablet:py-[18px]">
                      <Glyph emoji={benefit.emoji} />
                      <div className="min-w-0">
                        <h3 className="text-[16px] leading-[22px] font-bold text-[var(--foreground)] tablet:text-[17px] tablet:leading-[24px]">
                          {benefit.title}
                        </h3>
                        <p className="mt-[4px] text-[15px] leading-[24px] text-[#3f3f46]">{benefit.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-[24px] max-w-[72ch] rounded-[14px] bg-[var(--surface)] p-[20px] text-[14px] leading-[22px] text-[#3f3f46] tablet:p-[24px] tablet:text-[15px] tablet:leading-[24px]">
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
              </section>
            </div>

            {/* ---- details card ---- */}
            <aside className="desktop-sm:sticky desktop-sm:top-[calc(var(--header-height)+32px)] desktop-sm:self-start">
              <div className="rounded-[18px] border border-[var(--border)] bg-white p-[24px] tablet:p-[28px]">
                <h2 className="text-[18px] leading-[24px] font-bold text-[var(--foreground)]">App details</h2>
                <dl className="mt-[20px] flex flex-col divide-y divide-[var(--border)]">
                  <Row label="Rating">
                    <span className="flex items-center gap-[8px]">
                      {app.rating.toFixed(1)}
                      <StarRating rating={app.rating} className="block h-[14px]" />
                    </span>
                  </Row>
                  <Row label="Reviews">{app.ratingCount.toLocaleString("en-US")}</Row>
                  <Row label="Downloads">{app.downloads}</Row>
                  <Row label="Category">{app.category}</Row>
                  <Row label="Content rating">{app.contentRating}</Row>
                  <Row label="Updated on">{app.updated}</Row>
                  <Row label="Developer">AtomApplications</Row>
                  <Row label="Price">Free</Row>
                </dl>

                <PlayStoreButton app={app} className="mt-[24px] w-full justify-center" />

                <ul className="mt-[24px] flex flex-col gap-[10px] text-[14px] leading-[20px] text-[#3f3f46]">
                  <li>
                    <a href={storeUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
                      View on Google Play
                    </a>
                  </li>
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
                        Contact form
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

                <p className="mt-[20px] text-[12px] leading-[18px] text-[#8a8a92]">
                  Rating, reviews and downloads as shown on Google Play on {APPS_SNAPSHOT}.
                </p>
              </div>
            </aside>
          </div>

          {/* ---------- the rest of the family ---------- */}
          <div className="mt-[80px] border-t border-[var(--border)] pt-[56px] tablet:mt-[104px] tablet:pt-[72px]">
            <MoreApps current={app} />
          </div>
        </Container>
      </main>

      <FooterParallax>
        <Footer />
      </FooterParallax>
    </>
  );
}

/* ------------------------------------------------------------------------ */

/** One figure in the hero's stat row, divided from the next by a hairline. */
function Stat({ label, last = false, children }: { label: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-[4px] pr-[20px] tablet:pr-[28px] ${last ? "" : "mr-[20px] border-r border-[var(--border)] tablet:mr-[28px]"}`}>
      <dd className="order-1 text-[18px] leading-[24px] font-bold text-[var(--foreground)] tablet:text-[20px] tablet:leading-[26px]">
        {children}
      </dd>
      <dt className="order-2 text-[13px] leading-[18px] text-[#61616a]">{label}</dt>
    </div>
  );
}

/** One line of the details card. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-[16px] py-[10px] text-[14px] leading-[20px]">
      <dt className="text-[#61616a]">{label}</dt>
      <dd className="text-right font-medium text-[var(--foreground)]">{children}</dd>
    </div>
  );
}

function FeatureCard({ feature }: { feature: AppFeature }) {
  return (
    <li className="flex flex-col gap-[14px] rounded-[16px] bg-[var(--surface)] p-[20px] tablet:p-[24px]">
      <div className="flex items-center gap-[14px]">
        <Glyph emoji={feature.emoji} />
        <h3 className="text-[16px] leading-[22px] font-bold text-[var(--foreground)] tablet:text-[17px] tablet:leading-[24px]">
          {feature.title}
        </h3>
      </div>
      {feature.text && <p className="text-[15px] leading-[24px] text-[#3f3f46]">{feature.text}</p>}
      {feature.bullets && (
        <ul className="flex flex-col gap-[6px] text-[14px] leading-[22px] text-[#3f3f46]">
          {feature.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-[10px]">
              <span aria-hidden="true" className="mt-[10px] size-[4px] shrink-0 rounded-full bg-[#61616a]" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** The listing's emoji, held in a white tile so it sits square in a row. */
function Glyph({ emoji }: { emoji: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-[40px] shrink-0 place-items-center rounded-[12px] bg-white text-[20px] leading-none shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
    >
      {emoji}
    </span>
  );
}

function Check() {
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" aria-hidden="true" fill="none" className="shrink-0">
      <circle cx="10" cy="12" r="9" fill="#111116" />
      <path d="m6.2 12.2 2.5 2.5 5.1-5.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
