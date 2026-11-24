import type { CSSProperties, ReactNode } from "react";
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
import { HeroFindPhone } from "./HeroFindPhone";
import { NIGHT_FRAG } from "./NightSky";
import { SKIES } from "./HeroSkies";
import { WeatherMap, MAP_CREDIT, RADAR_FRAG } from "./WeatherScene";
import { HeroWeather } from "./HeroWeather";
import { HeroAI, AI_FRAG } from "./HeroAI";
import { HeroParallax } from "./HeroParallax";
import { RingCta } from "./RingCta";
import { SpotlightCarousel } from "./SpotlightCarousel";
import { StepSlider } from "./StepSlider";
import { Marquee } from "./Marquee";
import { ShotSlider } from "./ShotSlider";
import { LauncherExplorer } from "./LauncherExplorer";
import { GlowDebugger } from "./GlowDebugger";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FooterParallax } from "@/components/layout/FooterParallax";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { MoreApps } from "@/components/apps/MoreApps";
import { Poster } from "@/components/apps/Poster";
import { StarRating } from "@/components/apps/StarRating";
import { REVIEWS } from "@/components/folds/fold07/testimonials";
import { LAUNCHER_NOTE, appIconSrc, type AppFeature, type AppPage } from "@/data/apps";
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

// The hero headline's halo (the rating's text shadow, scaled up): white on light heroes, dark on dark ones.
export const HALO_LIGHT = "[text-shadow:0_0_12px_rgba(255,255,255,0.95),0_0_28px_rgba(255,255,255,0.75)]";
// Tunable live with ?glow (GlowDebugger); the fallbacks are the shipped values.
// One soft white glow behind each line of hero copy (headline, summary, rating) — black once the hero goes dark (the flashlight), so the lit print stays off the copy: same strength and blur; each sets its own spread.
export const GLOW = "before:pointer-events-none before:absolute before:-z-10 before:[filter:blur(var(--gblur,70px))] before:[scale:var(--gscale,1.5)] before:bg-[radial-gradient(closest-side,rgba(255,255,255,var(--g0,1))_0%,rgba(255,255,255,var(--g1,1))_var(--g1p,40%),rgba(255,255,255,var(--g2,0.45))_var(--g2p,70%),transparent)] group-data-[dark=true]/hero:before:bg-[radial-gradient(closest-side,rgba(5,6,8,var(--g0,1))_0%,rgba(5,6,8,var(--g1,1))_var(--g1p,40%),rgba(5,6,8,var(--g2,0.45))_var(--g2p,70%),transparent)]";
export const HALO_DARK = "[text-shadow:0_0_12px_rgba(5,6,16,0.7),0_0_28px_rgba(5,6,16,0.5)]";
// Phones: one scale for every heading, so none runs past two lines (h1 24–28px, h2 21–24px, h3 18–20px, a touch smaller on the narrowest phones).
export const H2 = "text-[clamp(21px,6.2vw,24px)] leading-[1.1] font-semibold tracking-tight tablet:text-[52px] compact:text-[40px]";
export const SUB = "text-[16px] leading-[1.5] text-black/55 tablet:text-[18px] compact:text-[16px]";
export const CARD_H3 = "text-[clamp(18px,5.2vw,20px)] leading-[1.15] font-semibold tracking-tight tablet:text-[32px] compact:text-[26px]";
const CARD_TEXT = "text-[15px] leading-[1.45] text-black/55";
// On phones it takes the screen less the header and copy (~400px), so the hero fits in one screen; the top margin keeps it clear of the rating.
const PHONE = "mx-auto mt-3 h-[calc(100svh-400px)] min-h-[260px] w-[min(100vw,60vh)] tablet:h-[60vh] tablet:min-h-[420px] tablet:mt-6 short:mt-4 compact:h-[70vh] compact:w-[min(100vw,70vh)] compact:min-h-[460px]";

export function AppTemplate({ app, hero }: { app: AppPage; hero?: ReactNode }) {
  const t = getTemplate(app.slug);
  const demo = t.hero?.demo;
  // A full-bleed hero (night skies, the alarm's photo): no foot fade into the page's white, rounded at the foot instead.
  const dark = demo === "horoscope" || demo === "ai" || demo === "alarm" || demo === "find";
  // The flat widgets grow the hero to fit and scroll with the page.
  const flat = demo === "calculator" || demo === "notes" || demo === "qr" || demo === "calendar" || demo === "bible" || demo === "ai" || demo === "flashlight";
  const f = app.features;
  const reviews = REVIEWS.filter((r) => r.slug === app.slug);
  // The marquee loops on -50%, so each half must outrun the widest screen (cards are 344px with their gap).
  const reviewLoop = reviews.length ? Array.from({ length: Math.ceil(2600 / (reviews.length * 344)) }, () => reviews).flat() : [];
  const count = app.ratingCount < 1000 ? String(app.ratingCount) : `${Math.round(app.ratingCount / 1000)}K`;

  // Portrait posters, 1-based.
  const portraits = app.screenshots.flatMap((s, i) => (s.height > s.width ? [i + 1] : []));
  const shotOf = (n: number) => app.screenshots[n - 1];


  const cards: [number, number][] =
    t.features?.cards ?? f.flatMap((x, i): [number, number][] => (x.shot ? [[i, x.shot]] : [])).slice(0, 3);
  const used = new Set([...cards.map(([i]) => i), ...(t.widget ? [t.widget.feature] : [])]);
  const spotlightIndex = t.spotlight ?? f.findIndex((_, i) => !used.has(i));
  // The spotlight carousel's USPs: the spotlight feature, then the ones the
  // page doesn't show yet, then the rest, six at most.
  const first = Math.max(0, spotlightIndex);
  const rest = f.map((_, i) => i).filter((i) => i !== first);
  const usps: Pick<AppFeature, "title" | "text">[] = [first, ...rest.filter((i) => !used.has(i)), ...rest.filter((i) => used.has(i))]
    .slice(0, 6)
    .flatMap((i) => (f[i] ? [{ title: f[i].title, text: f[i].card ?? f[i].text }] : [])); // the short wording, so a slide stays within four lines

  return (
    <>
      <Header />
      <GlowDebugger />

      {/* Every band opens with the same space (pt-24 / tablet:pt-32) and none adds its own below, so the gaps between them match. */}
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
        // A screen tall — except the calculator's, notes', QR scanner's, calendar's and Bible's, which
        // grow to fit, so the widget never sits under the strip on a short window.
        <HeroParallax
          className={`group/hero relative mx-2 mt-[calc(var(--header-height)+8px)] overflow-hidden ${dark ? "rounded-[24px]" : "rounded-t-[24px]"} ${
            flat
              ? "min-h-[max(720px,calc(100svh-var(--header-height)-8px))]"
              : demo === "steps"
              ? // A screen tall, growing on short phones so the strip stays clear of the step cards.
                "min-h-[calc(100svh-var(--header-height)-8px)] tablet:min-h-[720px]"
              : "h-[calc(100svh-var(--header-height)-8px)] min-h-[560px] tablet:min-h-[720px]"
          }`}
        >
          {/* Fades the sky and the shader into the page's white, so the hero has no
              bottom edge. Under the phone and the copy (z-20), so the phone stays solid.
              The weather map's is shorter, so the map fills the hero, but still ends
              on solid white: its own cloud banks scroll away with the parallax. The
              full-bleed ones (horoscope, AI, alarm) have none: they end in a rounded edge instead. */}
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
            ) : demo === "find" && t.hero?.face ? (
              // The room is the whole hero; the phone is in it, so there's no phone slot below.
              <HeroFindPhone face={{ ...t.hero.face, name: app.title, icon: appIconSrc(app), accent: app.accent }} className="absolute inset-0" />
            ) : demo === "ai" ? (
              <ShaderBackground frag={AI_FRAG} clicks={false} className="absolute inset-0 h-full w-full bg-[#03060a]" />
            ) : (
              <>
                {/* Shows above the copy on phones, where the sky fades out; the notes page keeps its paper's colour there. */}
                <div className={`absolute inset-0 ${demo === "notes" ? "bg-[#faf5e6]" : "bg-[linear-gradient(180deg,#dfeaf7_0%,#eef2f7_35%,#f5f4f1_70%,#faf6ec_100%)]"}`} />
                {/* Each app's own sky (HeroSkies); the notes and Bible skies stay behind the copy on phones too. The volume demo sends its own pulses, from behind the phone; the notes page has no click effect. */}
                <ShaderBackground frag={SKIES[app.slug]} clicks={demo !== "volume" && demo !== "notes"} className={`${demo === "notes" || demo === "bible" ? "" : "under-copy "}absolute inset-0 h-full w-full`} />
              </>
            )}
          </div>
          {/* The flashlight hero's dark: over the sky and the foot fade, under
              the copy and the phone, shown while HeroFlashlight sets data-dark. */}
          {demo === "flashlight" && (
            <div className="pointer-events-none absolute inset-0 z-[16] bg-[#050608] opacity-0 transition-opacity duration-[600ms] group-data-[dark=true]/hero:opacity-100 motion-reduce:transition-none" />
          )}

          {/* Tighter on phones and short windows (short:), so the demo below starts higher. */}
          <div data-depth="-0.2" data-copy className="relative z-20 mx-auto max-w-[900px] px-4 pt-6 text-center desktop-sm:max-w-[1240px] tablet:pt-10 short:pt-5">
            {/* Each authored line is its own block and may wrap inside itself,
                so a long line (some headlines run to ~30 characters) can't
                push past the screen. */}
            {/* A soft halo of the hero's ground round the letters, as on the rating; light heroes also get the rating's wide, blurred white glow behind it — on the headline only. */}
            <h1 className={`relative text-[clamp(24px,7vw,28px)] leading-[1.08] font-semibold tracking-tight text-balance transition-colors duration-[600ms] group-data-[dark=true]/hero:text-white tablet:text-[52px] desktop-sm:text-[min(72px,5vw)] compact:text-[44px] ${
              (!dark || demo === "find") && demo !== "notes"
                ? `${HALO_LIGHT} group-data-[dark=true]/hero:[text-shadow:0_0_12px_rgba(5,6,8,0.7),0_0_28px_rgba(5,6,8,0.5)] ${GLOW} before:-inset-x-24 before:-inset-y-10`
                : demo === "alarm" || demo === "notes"
                ? "" // a photo or the notes paper: no halo
                : HALO_DARK
            }`}>
              {app.headline.split("\n").map((line) => (
                <span key={line} className="tablet:block desktop-sm:whitespace-nowrap">{line} </span>
              ))}
            </h1>
            {/* The headline's treatment, lighter: a soft blurred glow behind it and a halo round the letters. */}
            <p className={`relative mx-auto mt-3 max-w-[480px] ${SUB} text-black/75 transition-colors tablet:mt-4 short:mt-2 short:text-[16px] duration-[600ms] group-data-[dark=true]/hero:text-white/80 ${
              (!dark || demo === "find") && demo !== "notes"
                ? `[text-shadow:0_0_8px_rgba(255,255,255,0.95),0_0_18px_rgba(255,255,255,0.8)] group-data-[dark=true]/hero:[text-shadow:0_0_8px_rgba(5,6,8,0.8)] ${GLOW} before:-inset-x-16 before:-inset-y-8`
                : demo === "alarm" || demo === "notes"
                ? ""
                : "[text-shadow:0_0_8px_rgba(5,6,16,0.8),0_0_18px_rgba(5,6,16,0.6)]"
            }`}>{app.summary}</p>
            {/* The hero's call to action: the app's own website. */}
            <div className="mt-5 flex justify-center short:mt-4">
              <RingCta
                href={app.website}
                external
                eyebrow="Visit the"
                label="Website"
                icon={
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9 9 3M4 3h5v5" />
                  </svg>
                }
              />
            </div>
            {/* Its own glow: it sits at the foot of the copy's, where that one has faded out. */}
            <p className={`relative mx-auto mt-3 flex w-max items-center justify-center gap-2 text-xs text-black/60 transition-colors duration-[600ms] group-data-[dark=true]/hero:text-white/70 ${
              (!dark || demo === "find") && demo !== "notes"
                ? `${GLOW} before:-inset-x-16 before:-inset-y-8 [text-shadow:0_0_8px_rgba(255,255,255,0.95),0_0_18px_rgba(255,255,255,0.8)] group-data-[dark=true]/hero:[text-shadow:0_0_8px_rgba(5,6,8,0.9)]`
                : demo === "alarm" || demo === "notes"
                ? ""
                : "before:pointer-events-none before:absolute before:-z-10 before:-inset-x-10 before:-inset-y-3 before:bg-[radial-gradient(closest-side,rgba(5,6,16,0.6)_40%,transparent)]"
            }`}>
              <StarRating rating={app.rating} className={`block h-[12px] transition-colors duration-[600ms] group-data-[dark=true]/hero:text-white ${(!dark || demo === "find") && demo !== "notes" ? "drop-shadow-[0_0_5px_#fff] group-data-[dark=true]/hero:drop-shadow-[0_0_5px_#050608]" : ""}`} />
              {app.rating} / {count} ratings
            </p>
          </div>

          {/* Centred under the rating: the phone, fading out toward the hero's
              foot with the app's demo buttons either side (see HeroPhone), or
              the app's demo in its place. The step widget is fixed to the
              viewport, so it sits outside the parallax layers. */}
          {demo === "steps" ? (
            <HeroSteps accent={app.accent} />
          ) : demo === "find" ? null : (
            <div
              // The flat widgets (calculator, weather, QR, calendar, Bible) scroll with the page:
              // lagging like the phone, they'd slide down over the strip.
              data-depth={flat || demo === "weather" ? "0" : "0.15"} className="relative z-20">
              {demo === "calculator" ? (
                <HeroCalculator />
              ) : demo === "ai" ? (
                <HeroAI />
              ) : demo === "weather" ? (
                <HeroWeather />
              ) : demo === "volume" ? (
                <HeroVolume accent={app.accent} className={PHONE} />
              ) : demo === "flashlight" ? (
                <HeroFlashlight accent={app.accent} className={`${PHONE} mb-[150px]`} />
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
          {t.hero?.strip && <HeroStrip strip={t.hero.strip} onPhoto={demo === "alarm" || demo === "find"} className={`absolute left-1/2 z-20 -translate-x-1/2 tablet:bottom-12 ${demo === "horoscope" ? "bottom-3" : "bottom-8"}`} />}

          {demo === "weather" && <p className="absolute bottom-3 left-3 z-20 text-[11px] text-black/55">{MAP_CREDIT}</p>}

        </HeroParallax>
        )}

        {/* ================= badges + poster strip ================= */}
        <section className="pt-24 tablet:pt-32 text-center">
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
          <h2 className="mx-auto mt-8 px-4 text-balance text-[clamp(21px,6.2vw,24px)] leading-[1.1] font-semibold tracking-[-0.02em] tablet:mt-10 tablet:text-[64px] compact:text-[48px]">
            {/* Two lines from tablet up, broken before the app's name (or the custom line). */}
            {t.socialLine ? <>Join {app.downloads} people<br className="hidden tablet:block" /> {t.socialLine}</> : <>Join {app.downloads} people using<br className="hidden tablet:block" /> {app.title}</>}
          </h2>
          {/* Four at a time, stepping on one by one (ShotSlider). */}
          <div className="mt-14 tablet:mt-20">
            <ShotSlider label="App screenshots" shots={portraits.map(shotOf)} />
          </div>
        </section>

        {/* ================= feature cards ================= */}
        {cards.length > 0 && (
          <Container as="section" className="pt-24 tablet:pt-32 text-center">
            <h2 className={`mx-auto ${H2} desktop-sm:whitespace-nowrap`}>{t.features?.heading ?? `Inside ${app.title}`}</h2>
            <p className={`mx-auto mt-4 max-w-[52ch] ${SUB}`}>{t.features?.sub ?? app.oneLiner}</p>
            <Reveal variant="stagger" className={`mx-auto mt-12 grid max-w-[1100px] gap-4 text-left ${CARD_COLS[cards.length]}`}>
              {cards.map(([i, shot], c) => (
                <FeatureCard key={i} app={app} feature={f[i]} shot={shot} bg={CARD_BGS[c % CARD_BGS.length]} wide={cards.length === 2} />
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
                <h3 className={`${CARD_H3} tablet:text-[44px] compact:text-[34px]`}>{f[t.widget.feature].title}</h3>
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
              <h3 className={`${CARD_H3} tablet:text-[44px] compact:text-[34px]`}>One swipe from your home screen</h3>
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
                <h2 className="text-[clamp(21px,6.2vw,24px)] leading-[1.1] font-semibold tracking-tight tablet:text-[44px] desktop-sm:text-[48px] compact:text-[38px]">
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
        <Container as="section" className="pt-24 tablet:pt-32">
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
          </p>
        </Container>

        {/* ================= spotlight card ================= */}
        {usps.length > 0 && (
          <Container as="section" className="pt-24 tablet:pt-32">
            <Reveal>
              <SpotlightCarousel
                items={usps}
                h2={H2}
              />
            </Reveal>
          </Container>
        )}

        {/* ================= reviews ================= */}
        {/* The heading, then a marquee of review cards. Only for apps with reviews. */}
        {reviews.length > 0 && (
          <section className="pt-24 tablet:pt-32 text-center">
            <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding)]">
              <h2 className="relative mx-auto max-w-[560px] px-4 text-[clamp(21px,6.2vw,24px)] leading-[1.1] font-semibold tracking-[-0.02em] tablet:text-[48px] desktop-sm:text-[52px] compact:text-[40px]">
                {t.reviewsHeading ?? "Loved on Google Play"}
              </h2>
              <p className={`mx-auto mt-5 max-w-[46ch] px-4 ${SUB}`}>
                Don&rsquo;t take our word for it. {app.title} holds a {app.rating} average from{" "}
                {app.ratingCount.toLocaleString("en-US")} ratings on Google Play.
              </p>
            </div>
            <Marquee label="Google Play reviews" duration={50} className="edge-fade mt-14 overflow-hidden pb-4 tablet:mt-20">
              {[...reviewLoop, ...reviewLoop].map((r, i) => (
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
        <section className="pt-24 tablet:pt-32 text-center">
          <Container>
            <h2 className={H2}>{t.closing ?? `Get ${app.title}`}</h2>
            <div className="mt-6 flex justify-center">
              <RingCta
                href={app.website}
                external
                eyebrow="Visit the"
                label="Website"
                icon={
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9 9 3M4 3h5v5" />
                  </svg>
                }
              />
            </div>
          </Container>
        </section>

        {/* ================= the rest of the family ================= */}
        {/* Same frame as on /apps/[slug]: MoreApps has no padding of its own. */}
        <Container className="pt-24 pb-[80px] tablet:pt-32 tablet:pb-[120px]">
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
function FeatureCard({ app, feature, shot, bg, wide }: { app: AppPage; feature: AppFeature; shot: number; bg: string; wide?: boolean }) {
  return (
    <div className="@container relative h-[560px] overflow-hidden rounded-[28px] p-7" style={{ background: bg }}>
      <h3 className={`${CARD_H3} whitespace-nowrap`}>{feature.cardTitle ?? feature.title}</h3>
      {/* A fixed measure in em, with the type sized to the card's width (13–17px), so each description wraps
          to the same three lines at every width and fills the card rather than leaving a gap on the right. */}
      {/* Two cards side by side (desktop): a wider measure and the fuller wording, to fill the card. */}
      <p
        className={`mt-2 line-clamp-3 min-h-[4.35em] max-w-[16.5em] ${CARD_TEXT} text-[clamp(13px,calc(100cqi/16.5),17px)] ${
          wide ? "desktop-sm:max-w-[28em] desktop-sm:text-[clamp(13px,calc(100cqi/28),17px)]" : ""
        }`}
      >
        {wide ? <><span className="hidden desktop-sm:inline">{feature.text}</span><span className="desktop-sm:hidden">{feature.card ?? feature.text}</span></> : feature.card ?? feature.text}
      </p>
      <div className="absolute inset-x-0 top-[220px] flex justify-center">
        <Poster app={app} shot={shot} alt={feature.title} sizes="280px" className="w-[64%]" />
      </div>
    </div>
  );
}
