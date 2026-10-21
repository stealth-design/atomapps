import type { CSSProperties } from "react";
import Image from "next/image";
import { ShaderBackground } from "./ShaderBackground";
import { HeroPhone } from "./HeroPhone";
import { HeroParallax } from "./HeroParallax";
import { StepSlider } from "./StepSlider";
import { Marquee } from "./Marquee";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FooterParallax } from "@/components/layout/FooterParallax";
import { Container } from "@/components/ui/Container";
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
 * Screenshots are chosen by rule rather than by number: the strips, collage
 * and closing row cycle through the app's portrait posters (a few listings
 * open with a landscape banner), so an app with fewer posters repeats them
 * instead of reaching for one it doesn't have.
 */

/**
 * The review collage, left to right: per column a top offset and its tiles as
 * [k, height, crop], k being an index into the app's portrait posters (wrapped).
 * Mirror-symmetric, eight tiles. The outer pairs run 434px deep and the middle
 * four stop by 381, so the heading lifts 24px into the gap between the outer
 * pairs. Heights are in a 130px-column unit and scale with --w; outer columns
 * hide below 1024.
 */
const M = 198, L = 306;
const COLLAGE: { top: number; outer?: boolean; tiles: [k: number, h: number, pos: string][] }[] = [
  { top: 24, outer: true, tiles: [[1, M, "50% 20%"], [3, M, "50% 70%"]] },
  { top: 75, tiles: [[0, L, "50% 40%"]] },
  { top: 0, tiles: [[2, L, "50% 60%"]] },
  { top: 0, tiles: [[1, L, "50% 45%"]] },
  { top: 75, tiles: [[4, L, "50% 40%"]] },
  { top: 24, outer: true, tiles: [[4, M, "50% 15%"], [1, M, "50% 75%"]] },
];

const CARD_BGS = [
  "linear-gradient(180deg,#eef0f8 40%,#f8dce2)",
  "linear-gradient(180deg,#eef0f8 40%,#c9d3ff)",
  "linear-gradient(180deg,#eef0f8 40%,#cdeccf)",
];
// Static strings so Tailwind sees them; picked by how many cards there are.
const CARD_COLS = ["", "", "desktop-sm:grid-cols-2", "desktop-sm:grid-cols-3"];

const H2 = "text-[36px] leading-[1.05] font-semibold tracking-tight tablet:text-[52px]";
const SUB = "text-[16px] leading-[1.5] text-black/55 tablet:text-[18px]";
const CARD_H3 = "text-[26px] leading-[1.1] font-semibold tracking-tight tablet:text-[32px]";
const LINK = "underline underline-offset-2 can-hover:hover:no-underline";
/** The hero CTA's ring and glow colours, the shader's palette. */
const RING = "bg-[conic-gradient(from_0deg,#f6a5c0,#8ec5ff,#7de0c4,#ffd27a,#c3a6ff,#f6a5c0)]";

export function AppTemplate({ app }: { app: AppPage }) {
  const t = getTemplate(app.slug);
  const f = app.features;
  const reviews = REVIEWS.filter((r) => r.slug === app.slug);
  const count = `${Math.round(app.ratingCount / 1000)}K`;

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
        <HeroParallax className="relative mx-2 mt-[calc(var(--header-height)+8px)] h-[calc(100svh-var(--header-height)-8px)] min-h-[720px] overflow-hidden rounded-t-[24px]">
          {/* Fades the sky, the shader and the phone's foot into the page's white,
              so the hero has no bottom edge. Above the phone (z-10), under the copy (z-20). */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[35%] bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.6)_45%,#fff_100%)]" />
          <div data-depth="0.35" className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#dfeaf7_0%,#eef2f7_35%,#f5f4f1_70%,#faf6ec_100%)]" />
            <ShaderBackground className="absolute inset-0 h-full w-full" />
          </div>

          <div data-depth="-0.2" className="relative z-20 mx-auto max-w-[900px] px-4 pt-10 text-center">
            {/* Each authored line is its own block and may wrap inside itself,
                so a long line (some headlines run to ~30 characters) can't
                push past the screen. */}
            <h1 className="text-[40px] leading-[1.02] font-semibold tracking-tight text-balance tablet:text-[76px]">
              {app.headline.split("\n").map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </h1>
            <p className={`mx-auto mt-4 max-w-[480px] ${SUB}`}>{app.summary}</p>
            {/* The hero's store button: a frosted pill inside a 3px ring of
                conic gradient (the shader's colours) turning behind it, and a
                soft blur of the same colours under it that brightens and
                spreads on hover or keyboard focus. Its own markup rather than
                PlayStoreButton, whose black fill the live pages keep. Still
                under reduced motion. */}
            <div className="mt-6 flex justify-center">
              <span className="group relative inline-flex">
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -inset-1 rounded-full opacity-40 blur-md transition-[opacity,filter,inset] duration-500 can-hover:group-hover:-inset-2.5 can-hover:group-hover:opacity-90 can-hover:group-hover:blur-xl group-focus-within:-inset-2.5 group-focus-within:opacity-90 group-focus-within:blur-xl ${RING}`}
                />
                <a
                  href={playStoreUrl(app)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex overflow-hidden rounded-full p-[3px] focus-visible:outline-none"
                >
                  <span aria-hidden className={`absolute top-1/2 left-1/2 aspect-square w-[160%] -translate-1/2 animate-[tt-spin_4s_linear_infinite] motion-reduce:animate-none ${RING}`} />
                  <span className="relative flex h-[44px] items-center gap-3 rounded-full bg-white/90 pr-5 pl-[10px] text-[var(--foreground)] backdrop-blur-sm">
                    <span className="grid size-[26px] place-items-center rounded-full bg-[var(--foreground)] text-white">
                      <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden fill="currentColor">
                        <path d="M0 0.8v10.4c0 .6.66.98 1.18.68l8.34-5.2a.8.8 0 0 0 0-1.36L1.18.12A.8.8 0 0 0 0 .8Z" />
                      </svg>
                    </span>
                    <span className="flex flex-col text-left leading-none">
                      <span className="text-[10px] leading-[12px] tracking-[0.02em] uppercase opacity-70">Get it on</span>
                      <span className="text-[15px] leading-[18px] font-semibold">Google Play</span>
                    </span>
                  </span>
                </a>
              </span>
            </div>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-black/50">
              <StarRating rating={app.rating} className="block h-[12px]" />
              {app.rating} / {count} ratings
            </p>
          </div>

          {/* Centred under the rating, fading out toward the hero's foot, with
              the app's demo buttons either side — see HeroPhone. */}
          <div data-depth="0.15" className="relative z-10">
            <HeroPhone
              screen={t.hero?.screen}
              actions={t.hero?.actions}
              className="mx-auto -mt-2 h-[60vh] min-h-[420px] w-[min(100vw,60vh)] [mask-image:linear-gradient(180deg,#000_60%,transparent_95%)]"
            />
          </div>

          {t.hero?.strip && (
            <div className="absolute bottom-8 left-1/2 z-20 flex w-max -translate-x-1/2 flex-col items-center gap-3 tablet:bottom-12">
              <p className="text-[14px] leading-[18px] text-[#61616a] tablet:text-[15px]">{t.hero.strip.label}</p>
              <ul className="flex items-center text-[var(--foreground)]">
                {t.hero.strip.items.map(({ label, icon }, i) => (
                  <li key={label} className="flex items-center">
                    {i > 0 && <span aria-hidden className="mx-4 h-5 w-px bg-black/15 tablet:mx-6" />}
                    <span className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="size-[20px] tablet:size-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d={icon} />
                      </svg>
                      <span className="text-[17px] leading-none font-semibold tracking-[-0.01em] tablet:text-[20px]">{label}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <a
            href={playStoreUrl(app)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 bottom-3 z-20 hidden items-center gap-3 rounded-xl bg-[#1d1d1f] p-2 pr-4 text-white tablet:flex"
          >
            <Image src={appIconSrc(app)} alt="" width={48} height={48} className="size-12" style={{ borderRadius: ICON_RADIUS }} />
            <span className="text-sm leading-tight font-semibold">
              {app.title}
              <span className="block text-[11px] font-normal text-white/60">Free on Google Play</span>
            </span>
          </a>
        </HeroParallax>

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
            className="mx-auto mt-14 max-w-[1440px] overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_18%,#000_82%,transparent)] tablet:mt-20"
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
            <div className={`mx-auto mt-12 grid max-w-[1100px] gap-4 text-left ${CARD_COLS[cards.length]}`}>
              {cards.map(([i, shot], c) => (
                <FeatureCard key={i} app={app} feature={f[i]} shot={shot} bg={CARD_BGS[c % CARD_BGS.length]} />
              ))}
            </div>
          </Container>
        )}

        {/* ================= wide widget card ================= */}
        {t.widget && f[t.widget.feature] && (
          <Container as="section" className="pt-4">
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
          </Container>
        )}

        {/* ================= launcher card ================= */}
        <Container as="section" className="pt-4">
          <div className="relative mx-auto grid max-w-[1100px] items-center gap-10 overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#eef0f8,#cdeef0)] p-8 tablet:p-12 desktop-sm:grid-cols-[1fr_1fr]">
            {/* orbit rings */}
            <div className="pointer-events-none absolute top-1/2 left-[38%] size-[900px] -translate-1/2 rounded-full border border-white/70" />
            <div className="pointer-events-none absolute top-1/2 left-[38%] size-[600px] -translate-1/2 rounded-full border border-white/70" />
            <div className="relative flex h-[420px] items-start justify-center">
              <Poster app={app} shot={app.launcherShots[0]} alt="" sizes="260px" className="w-[220px] tablet:w-[260px]" />
              {app.launcherBenefits.slice(0, 5).map((b, i) => (
                <span
                  key={b.title}
                  className="absolute grid size-14 place-items-center rounded-2xl bg-white text-2xl shadow-lg"
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
        </Container>

        {/* ================= how it works band ================= */}
        {/* The whole band pins while the scroll walks the steps, one image at
            a time — see StepSlider. Only for apps with steps written. */}
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
        <Container as="section" className="py-28">
          <div className="mx-auto grid max-w-[1000px] items-center gap-16 desktop-sm:grid-cols-2">
            <div>
              <h2 className={H2}>It&rsquo;s a launcher, too</h2>
              <p className={`mt-3 ${SUB}`}>{app.title} also has the following features:</p>
              <ul className="mt-10 flex flex-col gap-3">
                {app.launcherBenefits.map((b) => (
                  <li key={b.title} className="rounded-2xl bg-[#eef0f8] px-5 py-4">
                    <p className="font-semibold">{b.emoji} {b.title}</p>
                    <p className="mt-1 text-sm text-black/50">{b.text}</p>
                  </li>
                ))}
              </ul>
              {/* The launcher disclosure every app page carries. */}
              <p className="mt-8 text-[14px] leading-[22px] text-[#61616a]">
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
            <Poster app={app} shot={app.launcherShots[1]} alt="" sizes="340px" className="mx-auto w-[280px] tablet:w-[340px]" />
          </div>
        </Container>

        {/* ================= spotlight card ================= */}
        {spotlight && (
          <Container as="section">
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
          </Container>
        )}

        {/* ================= reviews ================= */}
        {/* A symmetric collage of tiles with the heading set into the gap its
            shorter middle columns leave, then a marquee of review cards.
            Only for apps with reviews. */}
        {reviews.length > 0 && (
          <section className="pt-32 text-center">
            {/* The site's content width and side padding (as Container); the
                wrapper is a size container, and --w is one column's share of its
                width (4 columns below 1024, 6 above). Every height and offset
                is a multiple of --w, so the collage keeps its shape at any
                width; the design unit is a 130px column. */}
            <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--content-padding)] [--g:8px] [--w:calc((100cqw-3*var(--g))/4)] [container-type:inline-size] desktop-sm:[--g:14px] desktop-sm:[--w:calc((100cqw-5*var(--g))/6)]">
              <div className="flex items-start justify-between gap-[var(--g)]">
                {COLLAGE.map((col, c) => (
                  <div
                    key={c}
                    className={`flex w-[var(--w)] shrink-0 flex-col gap-[var(--g)] ${col.outer ? "hidden desktop-sm:flex" : ""}`}
                    style={{ marginTop: `calc(var(--w) * ${col.top / 130})` }}
                  >
                    {col.tiles.map(([k, h, pos], i) => {
                      const img = shotOf(pick(k));
                      return (
                        <div key={i} className="overflow-hidden rounded-[18px] tablet:rounded-[24px]" style={{ height: `calc(var(--w) * ${h / 130})` }}>
                          <Image src={img.src} alt="" width={img.width} height={img.height} sizes="(max-width: 1023px) 25vw, 17vw" className="h-full w-full object-cover" style={{ objectPosition: pos }} />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <h2 className="relative mx-auto mt-10 max-w-[560px] px-4 text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] tablet:mt-12 tablet:text-[48px] desktop-sm:mt-[calc(var(--w)*-24/130)] desktop-sm:text-[52px]">
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

function FeatureCard({ app, feature, shot, bg }: { app: AppPage; feature: AppFeature; shot: number; bg: string }) {
  return (
    <div className="relative h-[560px] overflow-hidden rounded-[28px] p-7" style={{ background: bg }}>
      <h3 className={CARD_H3}>{feature.title}</h3>
      <p className="mt-2 line-clamp-4 text-[15px] leading-[1.45] text-black/55">{feature.text}</p>
      <Poster app={app} shot={shot} alt={feature.title} sizes="280px" className="mx-auto mt-8 w-[75%]" />
    </div>
  );
}
