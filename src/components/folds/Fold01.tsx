import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { HeroMotion } from "@/components/folds/fold01/HeroMotion";
import { HeroPhone } from "@/components/folds/fold01/HeroPhone";

/**
 * Fold 01 — Hero
 *
 * Figma (canvas `----> v7`):
 *   desktop  1136:2593  1440 x 800
 *   mobile   1136:1088   393 x 761
 *
 * Layout notes: every offset below is the design measurement expressed as a
 * percentage of the artboard, so the composition holds at any viewport width.
 * The background plate is deliberately oversized and offset (desktop 1643x912
 * at -98,-44; mobile 976x910 at -292,-64) — that framing is part of the design.
 */
export default function Fold01() {
  return (
    <Section fold="01">
      <HeroMotion>
        <div className="relative h-[761px] w-full overflow-hidden bg-black tablet:h-[700px] desktop-sm:h-[800px]">
          {/* ---------- background plate ---------- */}
          <div data-hero="bg" className="absolute inset-0">
            <div className="absolute top-[-8.41%] left-[-74.3%] h-[119.6%] w-[248.35%] tablet:hidden">
              <Image
                src="/images/fold01/hero-bg-mobile.jpg"
                alt=""
                fill
                priority
                sizes="250vw"
                className="object-cover"
              />
            </div>
            <div className="absolute top-[-5.5%] left-[-6.81%] hidden h-[114%] w-[114.1%] tablet:block">
              <Image
                src="/images/fold01/hero-bg-desktop.jpg"
                alt=""
                fill
                priority
                sizes="115vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* ---------- soft light wash behind the phone (desktop only) ---------- */}
          <div
            aria-hidden="true"
            className="absolute top-[43.75%] left-[5.07%] hidden h-[51.75%] w-[89.86%] tablet:block"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 50%, rgba(217,217,217,0.10) 0%, rgba(217,217,217,0) 70%)",
            }}
          />

          {/* ---------- small moon (mobile only; the desktop moon is in the plate) ---------- */}
          <Image
            src="/images/fold01/hero-moon.png"
            alt=""
            width={204}
            height={190}
            priority
            aria-hidden="true"
            className="absolute top-[30.09%] left-[77.86%] h-auto w-[17.05%] tablet:hidden"
          />

          {/* ---------- copy ---------- */}
          <div
            data-hero="copy"
            className="absolute top-[92px] right-0 left-0 flex flex-col items-center gap-[12px] px-5 desktop-sm:top-[68px] desktop-sm:gap-[9px]"
          >
            <h1 className="max-w-[355px] text-center text-[40px] leading-[43px] font-bold text-white tablet:max-w-[440px] tablet:text-[48px] tablet:leading-[52px] desktop-sm:max-w-[527px] desktop-sm:text-[60px] desktop-sm:leading-[62px]">
              <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                <span data-hero-line className="block">
                  Everyday tasks
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                <span data-hero-line className="block">
                  made easy
                </span>
              </span>
            </h1>

            <p className="overflow-hidden pb-[0.14em] -mb-[0.14em] text-center text-[16px] leading-[20px] text-[#acacac] tablet:text-[20px] tablet:leading-[24px] desktop-sm:text-[24px] desktop-sm:leading-[26px] desktop-sm:text-white">
              <span data-hero-line className="block">
                Through apps that people love
              </span>
            </p>
          </div>

          {/* ---------- phone mockup ---------- */}
          <div
            data-hero="phone"
            className="absolute top-[37.7%] left-1/2 ml-[2.5px] w-[186px] -translate-x-1/2 tablet:w-[250px] tablet:ml-[6px] desktop-sm:top-[37.25%] desktop-sm:ml-[8px] desktop-sm:w-[312px]"
          >
            <HeroPhone />
          </div>

          {/* ---------- bottom fade into the next fold ---------- */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 tablet:hidden"
            style={{ backgroundImage: "linear-gradient(to bottom, transparent 56.3%, #000 100%)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden tablet:block"
            style={{
              backgroundImage: "linear-gradient(to bottom, transparent 82.5%, rgba(0,0,0,0.93) 100%)",
            }}
          />
        </div>
      </HeroMotion>
    </Section>
  );
}
