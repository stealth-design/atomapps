import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PlayStoreButton } from "@/components/apps/PlayStoreButton";
import { HeroFan, type FanScreen } from "@/components/apps/HeroFan";
import { ICON_RADIUS } from "@/components/folds/fold03/appIcons";
import { APP_INDEX, appIconSrc, getApp, getComingSoon, type AppPage } from "@/data/apps";
import { siteConfig } from "@/data/site";
import { AppTemplate } from "@/app/test-template/AppTemplate";
import { ComingSoonTemplate } from "@/app/test-template/ComingSoonTemplate";
import { HeroStrip } from "@/app/test-template/HeroStrip";
import { getTemplate } from "@/data/appTemplates";

/**
 * /apps/[slug] — one page per Play Store listing, all from `@/data/apps`.
 *
 * The hero is this page's own: the headline written from the summary over a
 * fan of three screens. Every band below it is the master template's — see
 * AppTemplate — so a change there lands on all the app pages at once. An app
 * whose template entry (`@/data/appTemplates`) has a hero demo, demo buttons
 * or a phone screen shows the template's hero instead; a strip alone sits
 * under the fan here.
 * `--accent`, which the hero's tint reads, is set by AppTemplate's <main>.
 *
 * Statically generated: the slugs are known at build time, and an unknown one
 * is a 404. The unreleased apps get the template's coming-soon version
 * (ComingSoonTemplate) instead.
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

const LINK = "underline underline-offset-2 hover:no-underline";

export default async function AppDetailPage({ params }: PageProps<"/apps/[slug]">) {
  const { slug } = await params;
  const app = getApp(slug);

  // An app with no listing gets the coming-soon page — see ComingSoonTemplate
  // for what it leaves out and why.
  if (!app) {
    const soon = getComingSoon(slug);
    if (!soon) notFound();
    return <ComingSoonTemplate app={soon} />;
  }

  const headlineLines = app.headline.split("\n");
  const fan = fanScreens(app);
  const hero = getTemplate(app.slug).hero;

  // Everything below the hero is the master template's — see AppTemplate.
  return (
    <AppTemplate
      app={app}
      // Centred, with the fan of screens under the pitch. The tint is the
      // accent at a tenth, fading to the page's white by the foot of the band.
      // `pt` clears the fixed 50px header.
      hero={
        hero?.demo || hero?.actions || hero?.screen ? undefined : (
          <section
            className="relative overflow-hidden"
            style={{
              backgroundImage: [
                "radial-gradient(70% 55% at 50% 0%, color-mix(in srgb, var(--accent) 20%, transparent) 0%, transparent 70%)",
                "linear-gradient(180deg, color-mix(in srgb, var(--accent) 10%, #fff) 0%, #fff 100%)",
              ].join(","),
            }}
          >
            <Container className="pt-[calc(var(--header-height)+32px)] pb-[48px] tablet:pt-[calc(var(--header-height)+48px)] tablet:pb-[72px]">
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

              <div className="mt-[32px] flex flex-col items-center text-center tablet:mt-[40px]">
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

                <h1 className="mt-[24px] text-[40px] leading-[44px] font-normal tracking-[-0.01em] text-[var(--foreground)] tablet:mt-[28px] tablet:text-[56px] tablet:leading-[60px] desktop-md:text-[68px] desktop-md:leading-[72px]">
                  {headlineLines.map((line, index) => (
                    <span key={index} className="block">
                      {line}
                    </span>
                  ))}
                </h1>

                <div className="mt-[28px] flex flex-wrap items-center justify-center gap-x-[24px] gap-y-[16px] tablet:mt-[36px]">
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

              <HeroFan
                screens={fan.screens}
                framed={fan.framed}
                className="mt-[48px] max-w-[360px] tablet:mt-[64px] tablet:max-w-[600px] desktop-md:max-w-[660px]"
              />
              {hero?.strip && <HeroStrip strip={hero.strip} className="mx-auto mt-[40px] max-w-full tablet:mt-[56px]" />}
            </Container>
          </section>
        )
      }
    />
  );
}

/* ------------------------------------------------------------------------ */

/**
 * The three screens for the hero fan, left to right.
 *
 * The app's own captures when it has all three. Otherwise its store posters:
 * the hero poster in the middle, flanked by the first two feature posters,
 * then any others, never the two launcher posters, which show the launcher
 * rather than the app and appear further down the page.
 */
function fanScreens(app: AppPage): { screens: FanScreen[]; framed: boolean } {
  if (app.screens && app.screens.length >= 3) {
    return {
      framed: true,
      screens: app.screens.slice(0, 3).map((screen) => ({ ...screen, alt: `${app.name} on Android` })),
    };
  }

  const order = [
    app.heroShot,
    ...app.features.flatMap((feature) => (feature.shot === undefined ? [] : [feature.shot])),
    ...app.screenshots.map((_, index) => index + 1),
  ].filter((shot, index, all) => all.indexOf(shot) === index && !app.launcherShots.includes(shot));
  const [centre, left, right] = order.map((shot) => ({
    ...app.screenshots[shot - 1],
    alt: `${app.name} on Android`,
  }));
  return { framed: false, screens: [left, centre, right] };
}
