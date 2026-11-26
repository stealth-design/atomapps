import Image from "next/image";
import { ShaderBackground } from "./ShaderBackground";
import { SKIES } from "./HeroSkies";
import { HeroParallax } from "./HeroParallax";
import { RingCta } from "./RingCta";
import { ICON_RADIUS } from "@/components/folds/fold03/appIcons";
import { appIconSrc, type ComingSoonApp } from "@/data/apps";
import { GLOW, HALO_DARK, HALO_LIGHT } from "./AppTemplate";

/**
 * The hero for an app that isn't on Google Play yet, in the master
 * template's shape: the same shader sky (a click sends a ripple), headline
 * and ring button, with the app's icon where the phone would be.
 *
 * No rating and no store link: there's no listing yet. The ring button
 * asks the reader to get in touch, and the icon — the only art an unreleased
 * app has — floats over the accent's glow with its three planned features
 * orbiting it. ComingSoonTemplate's hero.
 */
export function ComingSoonHero({ app }: { app: ComingSoonApp }) {
  // Steppy keeps only the glow, in a wider space: no icon, ring lines or features.
  const steppy = app.slug === "steppy";
  // White Noise sits under a night sky: white copy, and like the template's
  // dark heroes no foot fade, a rounded edge instead.
  const night = app.slug === "white-noise";
  return (
    <HeroParallax
      dark={night}
      className={`group/hero relative mx-2 mt-[calc(var(--header-height)+8px)] h-[calc(100svh-var(--header-height)-8px)] min-h-[720px] overflow-hidden ${
        night ? "rounded-[24px]" : "rounded-t-[24px]"
      }`}
    >
      <style>{`@keyframes tt-spin{to{transform:rotate(1turn)}}@keyframes tt-unspin{to{transform:rotate(-1turn)}}@keyframes tt-bob{50%{transform:translateY(-10px)}}@keyframes tt-ping{75%,100%{transform:scale(2.4);opacity:0}}`}</style>

      <div data-depth="0.35" className="absolute inset-0">
        <div
          className={`absolute inset-0 ${
            night ? "bg-[#07061a]" : "bg-[linear-gradient(180deg,#dfeaf7_0%,#eef2f7_35%,#f5f4f1_70%,#faf6ec_100%)]"
          }`}
        />
        {/* Steppy's hero is a video of the penguin in the park, not a shader sky. */}
        {app.slug === "steppy" ? (
          <>
            <Image src="/images/apps/steppy/hero-bg.png" alt="" fill priority sizes="100vw" className="object-cover" />
            {/* The penguin's video over its still (the poster, and what shows under reduced motion). */}
            <video
              poster="/images/apps/steppy/hero-bg.png"
              autoPlay
              muted
              playsInline
              aria-hidden
              className="absolute inset-0 size-full object-cover motion-reduce:hidden"
            >
              {/* H.265 (0.5 MB); browsers without HEVC decoding fall back to the H.264 original. */}
              <source src="/videos/steppy.hevc.mp4" type='video/mp4; codecs="hvc1"' />
              <source src="/videos/steppy.mp4" type="video/mp4" />
            </video>
          </>
        ) : (
          <ShaderBackground frag={SKIES[app.slug]} className="absolute inset-0 h-full w-full" />
        )}
      </div>

      <div data-depth="-0.2" className="relative z-20 mx-auto max-w-[900px] px-4 pt-6 text-center desktop-sm:max-w-[1240px] tablet:pt-10 short:pt-5">
        <h1 className={`relative ${GLOW} before:-inset-x-24 before:-inset-y-10 ${night ? HALO_DARK : HALO_LIGHT} text-[clamp(24px,7vw,28px)] leading-[1.08] font-semibold tracking-tight text-balance tablet:text-[52px] desktop-sm:text-[min(72px,5vw)] compact:text-[44px] ${night ? "text-white" : ""}`}>
          {app.headline.split("\n").map((line) => (
            <span key={line} className="tablet:block desktop-sm:whitespace-nowrap">{line} </span>
          ))}
        </h1>
        <p className={`relative ${GLOW} before:-inset-x-16 before:-inset-y-8 ${night ? "[text-shadow:0_0_8px_rgba(5,6,16,0.8),0_0_18px_rgba(5,6,16,0.6)]" : "[text-shadow:0_0_8px_rgba(255,255,255,0.95),0_0_18px_rgba(255,255,255,0.8)]"} mx-auto mt-3 max-w-[480px] text-[16px] leading-[1.5] tablet:mt-4 tablet:text-[18px] short:mt-2 short:text-[16px] ${night ? "text-white/80" : "text-black/75"}`}>{app.summary}</p>
        <div className="mt-5 flex justify-center short:mt-4">
          {/* Not a store button: there's nothing to link to yet. */}
          <RingCta
            href="/contact"
            eyebrow="Coming soon"
            label="Ask us about it"
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" />
              </svg>
            }
          />
        </div>
      </div>

      {/* The icon over its glow, the features on a ring of radius --r turning round it.
          Each feature turns back as the ring turns, so it stays upright. */}
      <div
        data-depth="0.15"
        className={`relative z-10 mx-auto mt-14 grid size-[calc(var(--r)*2)] place-items-center short:mt-12 ${
          steppy ? "[--r:min(240px,40vw)] short:[--r:170px]" : "[--r:min(170px,40vw)] short:[--r:120px]"
        }`}
      >
        <span aria-hidden className="absolute inset-[12%] rounded-full bg-[var(--accent)] opacity-30 blur-3xl" />
        {!steppy && (
          <>
            <span aria-hidden className="absolute inset-0 rounded-full border border-white/80" />
            <span aria-hidden className="absolute inset-[18%] rounded-full border border-white/60" />
            <ul className="absolute inset-0 motion-safe:animate-[tt-spin_36s_linear_infinite]">
              {app.features.map(({ icon, text }, i) => (
                <li
                  key={icon}
                  className="absolute top-1/2 left-1/2 -mt-6 -ml-6"
                  style={{ transform: `rotate(${i * 120 - 90}deg) translateX(var(--r)) rotate(${90 - i * 120}deg)` }}
                >
                  <span title={text} className="grid size-12 place-items-center rounded-2xl bg-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.3)] motion-safe:animate-[tt-unspin_36s_linear_infinite]">
                    <Image src={`/images/fold05/icons/${icon}.svg`} alt={text} width={24} height={24} className="size-6" />
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {!steppy && (
        <span
          className="relative block w-[42%] overflow-hidden shadow-[0_30px_60px_-20px_color-mix(in_srgb,var(--accent)_70%,transparent)] motion-safe:animate-[tt-bob_5s_ease-in-out_infinite]"
          style={{ borderRadius: ICON_RADIUS }}
        >
          <Image src={appIconSrc(app)} alt="" width={374} height={376} priority sizes="160px" className="aspect-square w-full object-cover" />
        </span>
        )}
      </div>

      {/* Bottom centre, above the foot fade (z-15). */}
      <p className="absolute bottom-8 left-1/2 z-20 inline-flex w-max -translate-x-1/2 items-center gap-2 rounded-full bg-white/75 py-1.5 pr-3.5 pl-3 text-[13px] font-semibold shadow-[0_8px_24px_-14px_rgba(0,0,0,0.3)] ring-1 ring-black/5 backdrop-blur-md">
        <span className="relative flex size-2">
          <span className="absolute inset-0 rounded-full bg-[var(--accent)] motion-safe:animate-[tt-ping_1.6s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <span className="relative size-2 rounded-full bg-[var(--accent)]" />
        </span>
        {app.name} · Coming soon
      </p>
    </HeroParallax>
  );
}
