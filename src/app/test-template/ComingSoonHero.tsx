import Image from "next/image";
import { ShaderBackground } from "./ShaderBackground";
import { HeroParallax } from "./HeroParallax";
import { RingCta } from "./RingCta";
import { ICON_RADIUS } from "@/components/folds/fold03/appIcons";
import { appIconSrc, type ComingSoonApp } from "@/data/apps";

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
  return (
    <HeroParallax className="group/hero relative mx-2 mt-[calc(var(--header-height)+8px)] h-[calc(100svh-var(--header-height)-8px)] min-h-[720px] overflow-hidden rounded-t-[24px]">
      <style>{`@keyframes tt-spin{to{transform:rotate(1turn)}}@keyframes tt-unspin{to{transform:rotate(-1turn)}}@keyframes tt-bob{50%{transform:translateY(-10px)}}@keyframes tt-ping{75%,100%{transform:scale(2.4);opacity:0}}`}</style>

      {/* The foot fade, as on the template's hero. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[35%] bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.6)_45%,#fff_100%)]" />
      <div data-depth="0.35" className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#dfeaf7_0%,#eef2f7_35%,#f5f4f1_70%,#faf6ec_100%)]" />
        <ShaderBackground className="absolute inset-0 h-full w-full" />
      </div>

      <div data-depth="-0.2" className="relative z-20 mx-auto max-w-[900px] px-4 pt-6 text-center desktop-sm:max-w-[1240px] tablet:pt-10 short:pt-5">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/75 py-1.5 pr-3.5 pl-3 text-[13px] font-semibold shadow-[0_8px_24px_-14px_rgba(0,0,0,0.3)] ring-1 ring-black/5 backdrop-blur-md">
          <span className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-[var(--accent)] motion-safe:animate-[tt-ping_1.6s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <span className="relative size-2 rounded-full bg-[var(--accent)]" />
          </span>
          {app.name} · Coming soon
        </p>
        <h1 className="mt-4 text-[clamp(30px,9vw,40px)] leading-[1.02] font-semibold tracking-tight text-balance tablet:text-[64px] desktop-sm:text-[min(76px,6vw)] short:text-[52px]">
          {app.headline.split("\n").map((line) => (
            <span key={line} className="block desktop-sm:whitespace-nowrap">{line}</span>
          ))}
        </h1>
        <p className="mx-auto mt-3 max-w-[480px] text-[16px] leading-[1.5] text-black/55 tablet:mt-4 tablet:text-[18px] short:mt-2 short:text-[16px]">{app.summary}</p>
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
      <div data-depth="0.15" className="relative z-10 mx-auto mt-14 grid size-[calc(var(--r)*2)] place-items-center [--r:min(170px,40vw)] short:mt-12 short:[--r:120px]">
        <span aria-hidden className="absolute inset-[12%] rounded-full bg-[var(--accent)] opacity-30 blur-3xl" />
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
        <span
          className="relative block w-[42%] overflow-hidden shadow-[0_30px_60px_-20px_color-mix(in_srgb,var(--accent)_70%,transparent)] motion-safe:animate-[tt-bob_5s_ease-in-out_infinite]"
          style={{ borderRadius: ICON_RADIUS }}
        >
          <Image src={appIconSrc(app)} alt="" width={374} height={376} priority sizes="160px" className="aspect-square w-full object-cover" />
        </span>
      </div>
    </HeroParallax>
  );
}
