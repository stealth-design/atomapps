import Image from "next/image";
import { StarRating } from "./StarRating";
import type { AppPanel } from "./apps";

/**
 * One panel of the Fold 05 stack: the pre-composed scene with the frosted app
 * card over it.
 *
 * The card lays its blocks out in flow rather than at absolute Figma offsets,
 * because the four cards carry different blocks (question / CTA / badge /
 * quote / features / stats) and the panel is now viewport-height, so a fixed
 * 689px coordinate space no longer holds. Spacing is taken from the artboards:
 * 43px gutters, a 65px icon beside the title, then 35/30/30 between blocks,
 * with the closing block anchored to the bottom padding.
 *
 * `index` only drives image priority — the first panel is above the fold.
 *
 * The frosted card deliberately avoids `backdrop-filter`: four stacked panels
 * each blurring a full-bleed photo was the single thing making this page drop
 * frames (p95 25ms, worst 43ms), because a backdrop filter re-samples what is
 * behind it every frame. Instead the card holds its own blurred copy of the
 * same scene, aligned to the panel — a static blur rasterizes once and then
 * just composites. The percentages below invert the card's own box
 * (left 2.569% / width 32.222% etc.) so the copy lines up with the original.
 */
export function AppCard({ panel, index }: { panel: AppPanel; index: number }) {
  return (
    <div
      data-f05-card
      className="relative h-full w-full overflow-hidden rounded-[20px] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] tablet:rounded-[28px]"
    >
      <Image
        src={panel.background}
        alt=""
        fill
        priority={index === 0}
        sizes="100vw"
        className="object-cover object-[68%_center] tablet:object-center"
      />

      {/* dims as the next panel slides over this one */}
      <div
        data-f05-shade
        className="pointer-events-none absolute inset-0 bg-black opacity-0"
      />

      <div className="absolute bottom-[4.5%] left-[5.089%] max-h-[66%] w-[89.822%] tablet:top-[11.738%] tablet:bottom-auto tablet:left-[2.569%] tablet:h-[77.765%] tablet:max-h-none tablet:w-[32.222%]">
        <div className="relative isolate h-auto w-full overflow-hidden rounded-[14px] tablet:h-full tablet:rounded-[19px]">
          {/* frosted backing: the same scene, pre-blurred and aligned to it */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 overflow-hidden"
          >
            <div className="absolute top-[-118.8%] left-[-5.664%] h-[227.4%] w-[111.328%] scale-[1.08] blur-[22px] tablet:top-[-15.09%] tablet:left-[-79.73%] tablet:h-[128.59%] tablet:w-[310.35%]">
              <Image
                src={panel.background}
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-[68%_center] tablet:object-center"
              />
            </div>
            <div className="absolute inset-0 bg-white/[0.72]" />
          </div>

          <div className="relative z-10 flex h-full w-full flex-col px-[6.799%] py-[24px] tablet:px-[9.267%] tablet:py-[44px]">
            {/* ---- header ---- */}
            <div className="flex items-center gap-[12px] tablet:gap-[20px]">
              <Image
                src={panel.icon}
                alt=""
                width={279}
                height={280}
                aria-hidden="true"
                className="size-[40px] shrink-0 rounded-[20.8%] tablet:size-[65px]"
              />
              <h3 className="text-[20px] leading-[26px] font-extrabold text-black tablet:text-[35px] tablet:leading-[46px]">
                {panel.title}
              </h3>
            </div>

            {panel.question && (
              <p className="mt-[20px] text-[16px] leading-[21px] font-medium text-black tablet:mt-[35px] tablet:text-[20px] tablet:leading-[26px]">
                {panel.question}
              </p>
            )}

            <p className="mt-[14px] text-[12px] leading-[16px] font-light text-black tablet:mt-[30px] tablet:text-[14px] tablet:leading-[18px]">
              {panel.description}
            </p>

            {panel.cta && (
              <a
                href={panel.cta.href}
                className="mt-[18px] flex h-[40px] w-fit max-w-full items-center gap-[10px] rounded-full bg-white pr-[10px] pl-[16px] tablet:mt-[30px]"
              >
                <span className="text-[14px] leading-[18px] text-black">
                  {panel.cta.label}
                </span>
                <span className="flex size-[20px] shrink-0 items-center justify-center rounded-full bg-black">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 11 11"
                    aria-hidden="true"
                    fill="none"
                  >
                    <path
                      d="M2 9 9 2M4 2h5v5"
                      stroke="#fff"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            )}

            {panel.badge && (
              <span className="mt-[18px] flex h-[38px] w-fit items-center rounded-full bg-[#909090] px-[17px] text-[14px] leading-[18px] text-white tablet:mt-[30px]">
                {panel.badge}
              </span>
            )}

            {/* ---- closing block, anchored to the bottom of the card ---- */}
            <div className="mt-auto pt-[20px]">
              {panel.quote && (
                <p className="mb-[20px] text-[15px] leading-[21px] font-medium text-black tablet:mb-[40px] tablet:text-[20px] tablet:leading-[26px]">
                  {panel.quote}
                </p>
              )}

              {panel.features && (
                <ul className="flex flex-col gap-[14px] tablet:gap-[20px]">
                  {panel.features.map((feature) => (
                    <li key={feature.icon} className="flex gap-[12px]">
                      <Image
                        src={`/images/fold05/icons/${feature.icon}.svg`}
                        alt=""
                        width={20}
                        height={20}
                        className="mt-[1px] size-[16px] shrink-0 tablet:size-[20px]"
                      />
                      <p className="text-[12px] leading-[16px] text-black tablet:text-[14px] tablet:leading-[18px]">
                        {feature.text}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {panel.stats && (
                <div className="flex gap-[42px] tablet:gap-[111px]">
                  <div>
                    <p className="text-[27px] leading-[36px] font-bold text-black tablet:text-[47px] tablet:leading-[61px]">
                      {panel.stats.downloads}
                    </p>
                    <p className="text-[12px] leading-[16px] text-black tablet:text-[16px] tablet:leading-[20px]">
                      Downloads
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-[7px]">
                      <p className="text-[27px] leading-[36px] font-bold text-black tablet:text-[47px] tablet:leading-[61px]">
                        {panel.stats.rating}
                      </p>
                      <StarRating className="block h-[11px] tablet:h-[18px]" />
                    </div>
                    <p className="text-[12px] leading-[16px] text-black tablet:text-[16px] tablet:leading-[20px]">
                      App Store Rating
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
