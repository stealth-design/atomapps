import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { ShaderBackground } from "./ShaderBackground";
import { HeroPhone } from "./HeroPhone";
import { HeroCalculator } from "./HeroCalculator";
import { HeroVolume } from "./HeroVolume";
import { HeroSteps } from "./HeroSteps";
import { HeroStrip } from "./HeroStrip";
import { HeroFlashlight } from "./HeroFlashlight";
import { HeroAlarm } from "./HeroAlarm";
import { HeroQR } from "./HeroQR";
import { HeroCalendar } from "./HeroCalendar";
import { HeroNotes } from "./HeroNotes";
import { HeroNews } from "./HeroNews";
import { HeroHoroscope } from "./HeroHoroscope";
import { HeroBible } from "./HeroBible";
import { NIGHT_FRAG } from "./NightSky";
import { HeroWeather, WeatherMap, MAP_CREDIT, RADAR_FRAG } from "./WeatherScene";
import { HeroAI, AI_FRAG } from "./HeroAI";
import { HeroParallax } from "./HeroParallax";
import { RingCta } from "./RingCta";
import { StepSlider } from "./StepSlider";
import { Marquee } from "./Marquee";
import { LauncherExplorer } from "./LauncherExplorer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FooterParallax } from "@/components/layout/FooterParallax";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MoreApps } from "@/components/apps/MoreApps";
import { PlayStoreButton } from "@/components/apps/PlayStoreButton";
import { Poster } from "@/components/apps/Poster";
import { StarRating } from "@/components/apps/StarRating";
import { ICON_RADIUS } from "@/components/folds/fold03/appIcons";
import { REVIEWS } from "@/components/folds/fold07/testimonials";
import { LAUNCHER_NOTE, appIconSrc, playStoreUrl, type AppFeature, type AppPage } from "@/data/apps";
import { getTemplate } from "@/data/appTemplates";

/**
 * The master app template — one app's page, band by band, laid out the way
 * bevel.health is. Content comes from the listing (`@/data/apps`) and the
 * app's template entry (`@/data/appTemplates`); anything the template entry
 * leaves out falls back to a default drawn from the listing, and a band with
 * nothing to show (no steps, no reviews, no widget) is left out.
 *
 * Screenshots are chosen by rule rather than by number: the strip and the
 * closing row cycle through the app's portrait posters (a few listings
 * open with a landscape banner), so an app with fewer posters repeats them
 * instead of reaching for one it doesn't have.
 *
 * `hero` swaps out the template's own hero — /apps/[slug] keeps its fan of
 * screens and takes every band below it from here.
 */

export const CARD_BGS = [
  "linear-gradient(180deg,#eef0f8 40%,#f8dce2)",
  "linear-gradient(180deg,#eef0f8 40%,#c9d3ff)",
  "linear-gradient(180deg,#eef0f8 40%,#cdeccf)",
];
// Static strings so Tailwind sees them; picked by how many cards there are.
const CARD_COLS = ["", "", "desktop-sm:grid-cols-2", "desktop-sm:grid-cols-3"];

export const H2 = "text-[36px] leading-[1.05] font-semibold tracking-tight tablet:text-[52px]";
export const SUB = "text-[16px] leading-[1.5] text-black/55 tablet:text-[18px]";
export const CARD_H3 = "text-[26px] leading-[1.1] font-semibold tracking-tight tablet:text-[32px]";
const CARD_TEXT = "text-[15px] leading-[1.45] text-black/55";
const LINK = "underline underline-offset-2 can-hover:hover:no-underline";
const PHONE = "mx-auto -mt-2 h-[60vh] min-h-[420px] w-[min(100vw,60vh)] [mask-image:linear-gradient(180deg,#000_60%,transparent_95%)]";

export function AppTemplate({ app, hero }: { app: AppPage; hero?: ReactNode }) {
  const t = getTemplate(app.slug);
  const demo = t.hero?.demo;
  // A night-sky hero: no foot fade into the page's white, rounded at the foot instead.
  const dark = demo === "horoscope" || demo === "ai";
  // The flat widgets grow the hero to fit and scroll with the page.
  const flat = demo === "calculator" || demo === "qr" || demo === "calendar" || demo === "bible" || demo === "ai";
  const f = app.features;
  const reviews = REVIEWS.filter((r) => r.slug === app.slug);
  const count = app.ratingCount < 1000 ? String(app.ratingCount) : `${Math.round(app.ratingCount / 1000)}K`;

  // Portrait posters, 1-based; `pick(k)` wraps so short lists repeat.
  const portraits = app.screenshots.flatMap((s, i) => (s.height > s.width ? [i + 1] : []));
  const pick = (k: number) => portraits[k % portraits.length];
  const shotOf = (n: number) => app.screenshots[n - 1];

  const strip = Array.from({ length: Math.max(5, portraits.length) }, (_, i) => pick(i));

  const cards: [number, number][] =
    t.features?.cards ?? f.flatMap((x, i): [number, number][] => (x.shot ? [[i, x.shot]] : [])).slice(0, 3);
  const used = new Set([...cards.map(([i]) => i), ...(t.widget ? [t.widget.feature] : [])]);
  const spotlightIndex = t.spotlight ?? f.findIndex((_, i) => !used.has(i));
  const spotlight: AppFeature | undefined = f[spotlightIndex];

  const others = portraits.filter((n) => n !== app.heroShot);
  const closingRow = [...others.slice(0, 2), app.heroShot, ...others.slice(2, 4)];

  const links = [
    ["FAQ", app.links.faq],
    ["Contact", app.links.contact],
    ["Terms", app.links.terms],
    ["Privacy", app.links.privacy],
  ].filter((l): l is [string, string] => !!l[1]);

  return (
    <>
      <Header />

      <main
        // overflow-x-clip, not overflow-hidden: `hidden` would make main a scroll
        // container, which breaks `position: sticky` for anything inside it.
        // `clip` trims the marquees' overhang without that.
        className="overflow-x-clip bg-white text-[var(--foreground)]"
        style={{ "--accent": app.accent } as CSSProperties}
      >
        <style>{`@keyframes tt-marquee{to{transform:translateX(-50%)}}@keyframes tt-spin{to{transform:rotate(1turn)}}`}</style>

        {/* ================= hero ================= */}
        {/* Parallax depths: sky lags (0.35), phone lags a little (0.15), copy runs ahead. */}
        {hero ?? (
        // A screen tall — except the calculator's, QR scanner's, calendar's and Bible's, which
        // grow to fit, so the widget never sits under the strip on a short window.
        <HeroParallax
          className={`group/hero relative mx-2 mt-[calc(var(--header-height)+8px)] overflow-hidden ${dark ? "rounded-[24px]" : "rounded-t-[24px]"} ${
            flat
              ? "min-h-[max(720px,calc(100svh-var(--header-height)-8px))]"
              : "h-[calc(100svh-var(--header-height)-8px)] min-h-[720px]"
          }`}
        >
          {/* Fades the sky, the shader and the phone's foot into the page's white,
              so the hero has no bottom edge. Above the phone (z-10), under the copy (z-20).
              The weather map's is shorter, so the map fills the hero, but still ends
              on solid white: its own cloud banks scroll away with the parallax. The
              dark skies (horoscope, AI) have none: they end in a rounded edge instead. */}
          {!dark && (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 z-[15] ${
              demo === "weather"
                ? "h-[24%] bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.7)_55%,#fff_100%)]"
                : "h-[35%] bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.6)_45%,#fff_100%)]"
            }`}
          />
          )}
          <div data-depth="0.35" className="absolute inset-0">
            {/* The weather hero's sky is a map with rain clouds over it. */}
            {demo === "weather" ? (
              <>
                <WeatherMap className="absolute inset-0" />
                <ShaderBackground frag={RADAR_FRAG} className="absolute inset-0 h-full w-full" />
              </>
            ) : demo === "horoscope" ? (
              <ShaderBackground frag={NIGHT_FRAG} className="absolute inset-0 h-full w-full bg-[#07061a]" />
            ) : demo === "ai" ? (
              <ShaderBackground frag={AI_FRAG} className="absolute inset-0 h-full w-full bg-[#03060a]" />
            ) : (
              <>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#dfeaf7_0%,#eef2f7_35%,#f5f4f1_70%,#faf6ec_100%)]" />
                {/* The volume demo sends its own rings, from behind the phone. */}
                <ShaderBackground clicks={demo !== "volume"} className="absolute inset-0 h-full w-full" />
              </>
            )}
          </div>
          {/* The flashlight hero's dark: over the sky and the foot fade, under
              the copy and the phone, shown while HeroFlashlight sets data-dark. */}
          {demo === "flashlight" && (
            <div className="pointer-events-none absolute inset-0 z-[16] bg-[#050608] opacity-0 transition-opacity duration-[600ms] group-data-[dark=true]/hero:opacity-100 motion-reduce:transition-none" />
          )}

          {/* Tighter on phones and short windows (short:), so the demo below starts higher. */}
          <div data-depth="-0.2" className="relative z-20 mx-auto max-w-[900px] px-4 pt-6 text-center desktop-sm:max-w-[1240px] tablet:pt-10 short:pt-5">
            {/* Each authored line is its own block and may wrap inside itself,
                so a long line (some headlines run to ~30 characters) can't
                push past the screen. */}
            <h1 className="text-[clamp(30px,9vw,40px)] leading-[1.02] font-semibold tracking-tight text-balance transition-colors duration-[600ms] group-data-[dark=true]/hero:text-white tablet:text-[64px] desktop-sm:text-[min(76px,6vw)] short:text-[52px]">
              {app.headline.split("\n").map((line) => (
                <span key={line} className="block desktop-sm:whitespace-nowrap">{line}</span>
              ))}
            </h1>
            <p className={`mx-auto mt-3 max-w-[480px] ${SUB} transition-colors tablet:mt-4 short:mt-2 short:text-[16px] duration-[600ms] group-data-[dark=true]/hero:text-white/70`}>{app.summary}</p>
            {/* The hero's store button as a RingCta rather than
                PlayStoreButton, whose black fill the live pages keep. */}
            <div className="mt-5 flex justify-center short:mt-4">
              <RingCta
                href={playStoreUrl(app)}
                external
                eyebrow="Get it on"
                label="Google Play"
                icon={
                  <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden fill="currentColor">
                    <path d="M0 0.8v10.4c0 .6.66.98 1.18.68l8.34-5.2a.8.8 0 0 0 0-1.36L1.18.12A.8.8 0 0 0 0 .8Z" />
                  </svg>
                }
              />
            </div>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-black/50 transition-colors duration-[600ms] group-data-[dark=true]/hero:text-white/60">
              <StarRating rating={app.rating} className="block h-[12px] transition-colors duration-[600ms] group-data-[dark=true]/hero:text-white" />
              {app.rating} / {count} ratings
            </p>
          </div>

          {/* Centred under the rating: the phone, fading out toward the hero's
              foot with the app's demo buttons either side (see HeroPhone), or
              the app's demo in its place. The step widget is fixed to the
              viewport, so it sits outside the parallax layers. */}
          {demo === "steps" ? (
            <HeroSteps />
          ) : (
            <div
              // The flat widgets (calculator, weather, QR, calendar, Bible) scroll with the page:
              // lagging like the phone, they'd slide down over the strip.
              data-depth={flat || demo === "weather" ? "0" : "0.15"} className={`relative ${demo ? "z-20" : "z-10"}`}>
              {demo === "calculator" ? (
                <HeroCalculator />
              ) : demo === "ai" ? (
                <HeroAI />
              ) : demo === "weather" ? (
                <HeroWeather />
              ) : demo === "volume" ? (
                <HeroVolume accent={app.accent} className={PHONE} />
              ) : demo === "flashlight" ? (
                <HeroFlashlight accent={app.accent} className={PHONE} />
              ) : demo === "alarm" ? (
                <HeroAlarm accent={app.accent} className={PHONE} />
              ) : demo === "qr" ? (
                <HeroQR />
              ) : demo === "calendar" ? (
                <HeroCalendar />
              ) : demo === "notes" ? (
                <HeroNotes />
              ) : demo === "news" ? (
                <HeroNews />
              ) : demo === "horoscope" ? (
                <HeroHoroscope className={PHONE} />
              ) : demo === "bible" ? (
                <HeroBible />
              ) : (
                <HeroPhone screen={t.hero?.screen} face={t.hero?.face && { ...t.hero.face, name: app.title, icon: appIconSrc(app), accent: app.accent }} actions={t.hero?.actions} className={PHONE} />
              )}
            </div>
          )}

          {/* Bottom centre, above the foot fade (z-15). */}
          {t.hero?.strip && <HeroStrip strip={t.hero.strip} className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 tablet:bottom-12" />}

          {demo === "weather" && <p className="absolute bottom-3 left-3 z-20 text-[11px] text-black/55">{MAP_CREDIT}</p>}

          <a
            href={playStoreUrl(app)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 bottom-3 z-20 hidden items-center gap-3 rounded-xl bg-[#1d1d1f] p-2 pr-4 text-white desktop-sm:flex"
          >
            <Image src={appIconSrc(app)} alt="" width={48} height={48} className="size-12" style={{ borderRadius: ICON_RADIUS }} />
            <span className="text-sm leading-tight font-semibold">
              {app.title}
              <span className="block text-[11px] font-normal text-white/60">Free on Google Play</span>
            </span>
          </a>
        </HeroParallax>
        )}

        {/* ================= badges + poster strip ================= */}
        <section className="pt-16 pb-24 text-center tablet:pt-24">
          {/* The store's figures as one pill, in the shape of the app pages' highlight chips. */}
          <p className="mx-auto inline-flex items-center gap-4 rounded-full border border-[var(--border)] bg-white py-2 pr-5 pl-4 text-[14px] leading-[20px] text-[var(--foreground)] tablet:text-[15px]">
            <span className="flex items-center gap-2">
              <StarRating rating={app.rating} className="block h-[14px]" />
              <span className="font-semibold">{app.rating}</span>
              <span className="text-[#61616a]">{app.ratingCount.toLocaleString("en-US")} ratings</span>
            </span>
            <span aria-hidden className="h-4 w-px bg-[var(--border)]" />
            <span>
              <span className="font-semibold">{app.downloads}</span> <span className="text-[#61616a]">downloads</span>
            </span>
          </p>
          <h2 className="mx-auto mt-8 max-w-[20ch] px-4 text-[36px] leading-[1.08] font-semibold tracking-[-0.02em] tablet:mt-10 tablet:text-[64px]">
            Join {app.downloads} people {t.socialLine ?? `using ${app.title}`}
          </h2>
          <Marquee
            label="App screenshots"
            duration={45}
            // The edges fade over a quarter of the width each, eased (slow out
            // of transparent, slow into solid) so there's no visible line.
            className="mx-auto mt-14 max-w-[1440px] overflow-hidden [mask-image:linear-gradient(90deg,transparent,rgba(0,0,0,0.06)_5%,rgba(0,0,0,0.25)_11%,rgba(0,0,0,0.6)_18%,rgba(0,0,0,0.9)_24%,#000_28%,#000_72%,rgba(0,0,0,0.9)_76%,rgba(0,0,0,0.6)_82%,rgba(0,0,0,0.25)_89%,rgba(0,0,0,0.06)_95%,transparent)] tablet:mt-20"
          >
            {[...strip, ...strip].map((n, i) => {
              const img = shotOf(n);
              return (
                <li key={i} className="mr-5 w-[180px] shrink-0 overflow-hidden rounded-[14px] tablet:mr-8 tablet:w-[228px]">
                  <Image src={img.src} alt="" width={img.width} height={img.height} sizes="228px" className="aspect-[9/16] w-full object-cover" />
                </li>
              );
            })}
          </Marquee>
        </section>

        {/* ================= feature cards ================= */}
        {cards.length > 0 && (
          <Container as="section" className="pt-28 text-center">
            <h2 className={`mx-auto max-w-[16ch] ${H2}`}>{t.features?.heading ?? `Inside ${app.title}`}</h2>
            <p className={`mx-auto mt-4 max-w-[52ch] ${SUB}`}>{t.features?.sub ?? app.oneLiner}</p>
            <Reveal variant="stagger" className={`mx-auto mt-12 grid max-w-[1100px] gap-4 text-left ${CARD_COLS[cards.length]}`}>
              {cards.map(([i, shot], c) => (
                <FeatureCard key={i} app={app} feature={f[i]} shot={shot} bg={CARD_BGS[c % CARD_BGS.length]} />
              ))}
            </Reveal>
          </Container>
        )}

        {/* ================= wide widget card ================= */}
        {t.widget && f[t.widget.feature] && (
          <Container as="section" className="pt-4">
            <Reveal>
            <div className="mx-auto grid max-w-[1100px] items-center gap-10 overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#eef0f8,#d9d6fb)] p-8 tablet:p-12 desktop-sm:grid-cols-2">
              <div>
                <h3 className={`${CARD_H3} tablet:text-[44px]`}>{f[t.widget.feature].title}</h3>
                <p className={`mt-3 max-w-[40ch] ${SUB}`}>{f[t.widget.feature].text}</p>
              </div>
              <div className="grid gap-3 tablet:grid-cols-2">
                <ul className="flex flex-col gap-2">
                  {t.widget.bars.map(({ label, value }) => (
                    <li key={label} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium">
                      <span className="w-20">{label}</span>
                      <span className="h-1.5 flex-1 rounded-full bg-black/10">
                        <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${(value / t.widget!.max) * 100}%` }} />
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="grid grid-cols-2 gap-2">
                  {t.widget.tiles.map((s) => (
                    <li key={s} className="rounded-2xl bg-white/80 p-4 text-sm font-medium">{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            </Reveal>
          </Container>
        )}

        {/* ================= launcher card ================= */}
        <Container as="section" className="pt-4">
          <Reveal>
          <div className="relative mx-auto grid max-w-[1100px] items-center gap-10 overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#eef0f8,#cdeef0)] p-8 tablet:p-12 desktop-sm:grid-cols-[1fr_1fr]">
            {/* orbit rings */}
            <div className="pointer-events-none absolute top-1/2 left-[38%] size-[900px] -translate-1/2 rounded-full border border-white/70" />
            <div className="pointer-events-none absolute top-1/2 left-[38%] size-[600px] -translate-1/2 rounded-full border border-white/70" />
            <div className="relative flex h-[420px] items-start justify-center">
              <Poster app={app} shot={app.launcherShots[0]} alt="" sizes="260px" className="w-[220px] tablet:w-[260px]" />
              {app.launcherBenefits.slice(0, 5).map((b, i) => (
                <span
                  key={b.title}
                  className="absolute grid size-14 place-items-center rounded-2xl bg-white text-2xl shadow-[0_6px_16px_-10px_rgba(0,0,0,0.2)]"
                  style={{ left: `${[2, 72, 84, 66, 8][i]}%`, top: `${[10, 6, 44, 80, 70][i]}%`, rotate: `${[-8, 6, -4, 10, 8][i]}deg` }}
                >
                  {b.emoji}
                </span>
              ))}
            </div>
            <div className="relative">
              <h3 className={`${CARD_H3} tablet:text-[44px]`}>One swipe from your home screen</h3>
              <p className={`mt-3 max-w-[40ch] ${SUB}`}>{app.launcherBenefits[0]?.text}</p>
            </div>
          </div>
          </Reveal>
        </Container>

        {/* ================= how it works band ================= */}
        {/* Stacked step cards wiping one still image to the next — see
            StepSlider. Only for apps with steps written. */}
        {t.steps && (
          <StepSlider
            steps={t.steps.items}
            className="mt-28 bg-[linear-gradient(180deg,#fff_0%,#f4f5f9_22%,#f4f5f9_78%,#fff_100%)] text-[var(--foreground)]"
            intro={
              <div className="text-center">
                {/* Glossy orbs: a white highlight top-left running through the
                    orb's colour to a deeper edge, an inner shine, and — on the
                    active one — a soft halo of its own colour. */}
                {t.steps.orbs && (
                  <div className="mb-4 flex items-end justify-center gap-4 tablet:mb-6 tablet:gap-6">
                    {t.steps.orbs.map(({ emoji, label, light, mid, deep, on }) => (
                      <div key={label} className="flex flex-col items-center gap-2.5">
                        <span className={`relative grid place-items-center ${on ? "size-[52px] tablet:size-[72px] short:size-14" : "size-10 opacity-75 tablet:size-14 short:size-11"}`}>
                          {on && (
                            <span
                              aria-hidden
                              className="absolute -inset-4 rounded-full blur-xl"
                              style={{ background: `radial-gradient(circle, ${mid}aa 0%, transparent 70%)` }}
                            />
                          )}
                          <span
                            className="relative grid size-full place-items-center rounded-full text-xl tablet:text-2xl"
                            style={{
                              background: `radial-gradient(circle at 32% 26%, #fff 0%, ${light} 28%, ${mid} 62%, ${deep} 100%)`,
                              boxShadow: `inset 0 3px 6px rgba(255,255,255,0.7), inset 0 -6px 12px ${deep}55, 0 10px 24px -10px ${deep}`,
                            }}
                          >
                            {emoji}
                          </span>
                        </span>
                        <span
                          className={`rounded-full px-3 py-0.5 text-[11px] font-medium ${on ? "text-white" : "bg-black/[0.04] text-black/45"}`}
                          style={on ? { background: `linear-gradient(90deg, ${mid}, ${deep})` } : undefined}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <h2 className="text-[30px] leading-[1.05] font-semibold tracking-tight tablet:text-[44px] desktop-sm:text-[48px] short:text-[40px]">
                  <span className="block text-black/40">{t.steps.heading[0]}</span>
                  {t.steps.heading[1]}
                </h2>
              </div>
            }
          />
        )}

        {/* ================= and more ================= */}
        {/* An explorer of the launcher's extras beside a phone acting each
            one out — see LauncherExplorer. */}
        <Container as="section" className="py-28">
          <div className="text-center">
            <h2 className={H2}>It&rsquo;s a launcher, too</h2>
            <p className={`mx-auto mt-4 max-w-[52ch] ${SUB}`}>{app.title} also has the following features:</p>
          </div>
          <Reveal>
          <LauncherExplorer
            items={app.launcherBenefits}
            app={{ name: app.title, icon: appIconSrc(app), features: f.map(({ title }) => ({ title })) }}
          />
          </Reveal>
          {/* The launcher disclosure every app page carries. */}
          <p className="mx-auto mt-8 max-w-[70ch] text-center text-[13px] leading-[20px] text-[#61616a]">
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
        </Container>

        {/* ================= spotlight card ================= */}
        {spotlight && (
          <Container as="section">
            <Reveal>
            <div className="relative mx-auto flex h-[440px] max-w-[1100px] items-start justify-center overflow-hidden rounded-[28px] bg-[radial-gradient(80%_100%_at_0%_100%,#2f8a63_0%,transparent_50%),radial-gradient(80%_100%_at_100%_100%,#2f8a63_0%,transparent_50%),linear-gradient(90deg,#1f3b33,#1f2026_40%,#1f2026_60%,#1f3b33)] pt-16 text-center text-white">
              <Image
                src={appIconSrc(app)}
                alt=""
                width={279}
                height={280}
                className="absolute top-1/2 left-1/2 w-[340px] -translate-1/2 opacity-15 grayscale"
                style={{ borderRadius: ICON_RADIUS }}
              />
              <div className="relative max-w-[46ch] px-6">
                <h2 className={H2}>{spotlight.title}</h2>
                <p className="mt-3 text-white/60">{spotlight.text}</p>
              </div>
            </div>
            </Reveal>
          </Container>
        )}

        {/* ================= reviews ================= */}
        {/* The heading, then a marquee of review cards. Only for apps with reviews. */}
        {reviews.length > 0 && (
          <section className="pt-32 text-center">
            <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding)]">
              <h2 className="relative mx-auto max-w-[560px] px-4 text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] tablet:text-[48px] desktop-sm:text-[52px]">
                {t.reviewsHeading ?? "Loved on Google Play"}
              </h2>
              <p className={`mx-auto mt-5 max-w-[46ch] px-4 ${SUB}`}>
                Don&rsquo;t take our word for it. {app.title} holds a {app.rating} average from{" "}
                {app.ratingCount.toLocaleString("en-US")} ratings on Google Play.
              </p>
            </div>
            <Marquee label="Google Play reviews" duration={50} className="mt-14 overflow-hidden pb-4 tablet:mt-20">
              {[...reviews, ...reviews, ...reviews, ...reviews].map((r, i) => (
                <li key={i} className="mr-4 flex min-h-[220px] w-[280px] shrink-0 flex-col rounded-[24px] bg-[#eef0f8] p-6 text-left tablet:mr-6 tablet:w-[320px] tablet:p-7">
                  <span aria-label="Rated 5 out of 5" className="text-[20px] tracking-[2px] text-[#ff9f0a]">★★★★★</span>
                  <p className="mt-3 text-[15px] font-semibold">Google Play review</p>
                  <p className="mt-1 text-[14px] text-[#61616a]">{app.title}</p>
                  <p className="mt-5 text-[15px] leading-[1.5]">&ldquo;{r.quote}&rdquo;</p>
                </li>
              ))}
            </Marquee>
          </section>
        )}

        {/* ================= closing ================= */}
        <section className="pt-32 pb-24 text-center">
          <Container>
            <h2 className={H2}>{t.closing ?? `Get ${app.title}`}</h2>
            {app.highlights && <p className={`mx-auto mt-4 max-w-[50ch] ${SUB}`}>{app.highlights.join(" · ")}</p>}
            <div className="mt-6 flex justify-center">
              <PlayStoreButton app={app} />
            </div>
            <p className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[14px] text-[#61616a]">
              <a href={app.website} target="_blank" rel="noopener noreferrer" className={LINK}>
                Website
              </a>
              {links.map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {label}
                </a>
              ))}
            </p>
          </Container>
          <div className="mt-16 flex items-center justify-center gap-4 tablet:gap-8">
            {closingRow.map((shot) => (
              <Poster
                key={shot}
                app={app}
                shot={shot}
                alt=""
                sizes="260px"
                className={shot === app.heroShot ? "w-[200px] shrink-0 tablet:w-[260px]" : "w-[140px] shrink-0 opacity-90 tablet:w-[190px]"}
              />
            ))}
          </div>
        </section>

        {/* ================= the rest of the family ================= */}
        {/* Same frame as on /apps/[slug]: MoreApps has no padding of its own. */}
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

/**
 * Every card holds the same text block — a title of up to two lines over up
 * to three of text, the space reserved even when shorter — and the poster is
 * pinned at one offset, so a row of cards lines up whatever the copy.
 */
function FeatureCard({ app, feature, shot, bg }: { app: AppPage; feature: AppFeature; shot: number; bg: string }) {
  return (
    <div className="relative h-[560px] overflow-hidden rounded-[28px] p-7" style={{ background: bg }}>
      <h3 className={`${CARD_H3} line-clamp-2 min-h-[2.2em]`}>{feature.title}</h3>
      <p className={`mt-2 line-clamp-3 min-h-[4.35em] ${CARD_TEXT}`}>{feature.text}</p>
      <div className="absolute inset-x-0 top-[220px] flex justify-center">
        <Poster app={app} shot={shot} alt={feature.title} sizes="280px" className="w-[64%]" />
      </div>
    </div>
  );
}
