import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { APPROACH_STEPS } from "@/components/folds/fold06/steps";

/**
 * Fold 06 — Our Approach
 *
 * Figma (canvas `----> v7`):
 *   desktop  1153:8675  1440 x 1009
 *   mobile   1136:1991   393 x 906
 *
 * A centred header over faint concentric arcs, then three process cards. The
 * cards are identical on both artboards (331x535); desktop rows them with a
 * 77px gap, mobile scrolls them horizontally with a 15px gap — Figma parks the
 * second and third off-canvas, the same carousel hint used elsewhere.
 *
 * Card illustrations are dense vector compositions (avatar clusters, a phone
 * UI, an orbit diagram), so each is exported as a PNG rather than rebuilt.
 */
export default function Fold06() {
  return (
    <Section fold="06" className="relative overflow-hidden bg-white">
      {/* ---------- decorative arcs (Figma: one masked circle group at 20%) ---------- */}
      <Image
        src="/images/fold06/bg-arcs.svg"
        alt=""
        width={1510}
        height={1510}
        aria-hidden="true"
        className="pointer-events-none absolute top-[-14%] left-[-141.7%] w-[383.5%] max-w-none tablet:top-[10.95%] tablet:left-[-2.88%] tablet:w-[104.86%]"
      />

      <div className="relative py-[var(--fold-gap-y)]">
        <Reveal variant="stagger" className="px-5 text-center tablet:px-10">
          <p className="text-[12px] leading-[16px] font-bold tracking-[0.02em] text-black uppercase tablet:text-[16px] tablet:leading-[21px]">
            Our Approach
          </p>

          <h2 className="mt-[24px] text-[28px] leading-[34px] font-extrabold text-black capitalize tablet:mt-[29px] tablet:text-[50px] tablet:leading-[60px]">
            We start with real life.
          </h2>

          <p className="mx-auto mt-[10px] max-w-[266px] text-[15px] leading-[25px] text-[#515151] tablet:mt-[20px] tablet:max-w-[437px] tablet:text-[20px] tablet:leading-[28px]">
            Great apps start with understanding what people actually need
          </p>
        </Reveal>

        {/* ---------- process cards ---------- */}
        {/* No `data-lenis-prevent` here: it makes Lenis skip the wheel over this
            whole band, so the page jumped from smooth to instant scrolling as
            the cursor crossed the cards. Touch isn't synced to Lenis
            (`syncTouch` is off), so horizontal swiping is native anyway, and
            Lenis ignores horizontal wheel deltas — the carousel still works. */}
        <div
          className="mt-[64px] flex snap-x snap-mandatory gap-[15px] overflow-x-auto scroll-pl-[31px] px-[31px] pb-2 [scrollbar-width:none] tablet:mt-[58px] desktop-md:justify-center desktop-md:snap-none desktop-md:gap-[77px] desktop-md:overflow-visible desktop-md:px-10 [&::-webkit-scrollbar]:hidden"
        >
          {APPROACH_STEPS.map((step) => (
            <article
              key={step.id}
              className="relative h-[535px] w-[331px] shrink-0 snap-start overflow-hidden rounded-[13px] bg-white px-[28px] pt-[33px] shadow-[0_0_4px_rgba(0,0,0,0.03),0_0_19px_rgba(0,0,0,0.07)]"
            >
              <span className="flex size-[39px] items-center justify-center rounded-[11px] border border-[#e5e7eb] bg-white">
                <Image
                  src={`/images/fold06/${step.icon}.svg`}
                  alt=""
                  width={17}
                  height={17}
                  className="size-[17px]"
                />
              </span>

              <h3 className="mt-[16px] text-[25px] leading-[33px] font-bold text-[#111827]">
                {step.title}
              </h3>

              <p
                className="mt-[16px] text-[14px] leading-[18px] text-[#6b7280]"
                style={{ width: step.bodyWidth }}
              >
                {step.body}
              </p>

              {/*
               * `unoptimized` is required, not a shortcut: the image optimizer
               * has no animated output, so a GIF routed through it comes back
               * as a single still frame. It also means the bytes are served
               * as-authored, which is why these stay lazy — they sit well
               * below the fold and together weigh far more than the rest of
               * the page.
               */}
              <Image
                src={step.illustration.src}
                alt=""
                width={step.illustration.width * 2}
                height={step.illustration.height * 2}
                unoptimized
                loading="lazy"
                aria-hidden="true"
                className="absolute top-[228px] left-[28px] h-auto"
                // The GIFs are matted on #fcfcfc, three values off the card's
                // white, which showed as a faint rectangle around each one.
                // 1.2% of brightness maps 252 to exactly 255 so the matte
                // disappears; the artwork shifts by the same 1.2%, which is
                // not perceptible and avoids re-encoding 241 frames.
                style={{ width: step.illustration.width, filter: "brightness(1.0119)" }}
              />
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
