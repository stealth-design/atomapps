import Image from "next/image";
import type { CSSProperties } from "react";
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
      // `--focal` is the scene's own horizontal focal point, consumed by both
      // the scene and its blurred copy below so the two stay in register.
      style={{ "--focal": panel.mobileFocal } as CSSProperties}
      // Past 1920 the card stops filling the panel and takes the reference
      // frame's own 1764:1087, so it reads as a landscape card rather than the
      // near-square block a 1360-wide panel made of a 100dvh height. At the
      // nav's 1360 that comes to 1360x838.
      //
      // Only the card shrinks. The panel around it stays `h-svh`, because its
      // height is the scroll distance the sticky stack runs on — shortening
      // that would speed every transition up. The panel centres this instead.
      //
      // Everything inside is a percentage of this box, so the internals hold
      // their proportions: the glass card lands at 438x652, a 0.67 against the
      // 0.66 it has at 1440.
      className="relative h-full w-full overflow-hidden rounded-[20px] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] tablet:rounded-[28px] desktop-xl:h-auto desktop-xl:aspect-[1764/1087]"
    >
      {/*
       * Two boxes, because the scene both drifts and needs somewhere to drift
       * to. The outer one is the panel's own box and belongs to StackMotion,
       * which owns its transform; the inner one carries the zoom that puts
       * 3% of the panel's height off each edge, so the drift never pulls a
       * blank strip into frame.
       *
       * The zoom sits on the inner box rather than the image so `object-cover`
       * still resolves against the panel's true box — the framing is the one
       * the focal points were measured against, just 6% closer in.
       */}
      <div data-f05-scene className="absolute inset-0">
        <div className="absolute inset-0 scale-[1.06]">
          <Image
            src={panel.background}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-[var(--focal)_center] tablet:object-center"
          />
        </div>
      </div>

      {/* dims as the next panel slides over this one */}
      <div
        data-f05-shade
        className="pointer-events-none absolute inset-0 bg-black opacity-0"
      />

      {/*
       * A size container, purely so the card below can measure its own insets
       * against the panel's HEIGHT on all four sides.
       *
       * `top`/`bottom` percentages resolve against the container's height and
       * `left` against its width, so the artboard's 11.738% / 2.569% pair was
       * only ever equal at one aspect ratio — and was not equal at any of
       * them: at the reference frame's 1764x1087 it came out 93px above and
       * below against 35px on the left. `cqh` is 1% of this box's height
       * whatever its shape, so one number drives all three and the three stay
       * equal from a 4:3 tablet to the 1.623 plate past 1920.
       *
       * It is a box of its own rather than `container-type` on the card root,
       * which would put size containment on the element whose height the
       * aspect ratio and the sticky panel are already deriving.
       *
       * `pointer-events-none` because it spans the whole panel; the card puts
       * them back for itself, so the scene beside it is not covered by an
       * invisible sheet.
       */}
      <div className="pointer-events-none absolute inset-0 [container-type:size]">
        {/* The card drifts against the scene, which is where the depth in this
            panel comes from — see StackMotion for the three coupled amounts.
            *
            * The rest position is centred vertically — (100 - 77.765) / 2 —
            * rather than the artboard's 11.738% top, which left only 10.497%
            * under it. StackMotion's own +-2.5% swings either side of wherever
            * the card rests, so centring the rest position is what makes the
            * top and bottom gaps equal through the whole drift, and the left
            * inset above is what brings the third side into line with them. */}
        <div
          data-f05-glass
          className="pointer-events-auto absolute bottom-[4.5%] left-[5.089%] max-h-[66%] w-[89.822%] tablet:top-[11.1175cqh] tablet:bottom-auto tablet:left-[11.1175cqh] tablet:h-[77.765cqh] tablet:max-h-none tablet:w-[32.222%]"
        >
          {/*
           * Solid white, not frosted.
           *
           * This used to hold its own pre-blurred copy of the scene under a 72%
           * white wash — a way of faking `backdrop-filter`, which four stacked
           * full-bleed photos could not afford to do for real. Solid white drops
           * all of it: the copy, the second decode of every scene, the wash, and
           * the coupled drift that kept the copy registered against the photo as
           * the card moved over it. `data-f05-frost` is gone with it, so
           * StackMotion now moves two things here instead of three.
           */}
          <div className="relative isolate h-auto w-full overflow-hidden rounded-[14px] bg-white tablet:h-full tablet:rounded-[19px]">
            {/* Top-aligned past 1920, not centred. Centring split the leftover
                room above and below, which put each card's header at a different
                height — 64px down on Find My Phone against 6px on Steppy, since
                the four carry different amounts of copy. Aligning to the top
                gives every header the same offset from the card's edge and
                collects the slack at the foot instead.

                The gap that centring originally closed stays closed: the stats
                block below drops `mt-auto` past 1920, so it follows the content
                rather than being pushed to the card's bottom. */}
            {/*
             * One padding value, all four sides. Percentage padding resolves
             * against the inline size for top and bottom as well as left and
             * right, so a single number is genuinely equal all round — which the
             * old `px-[9.267%] py-[44px]` pair only happened to be at 1440 and
             * drifted from at every other width. 10.4% is ~48px in the card
             * against the 43 it was, which is the nudge inward.
             */}
            <div className="relative z-10 flex h-full w-full flex-col p-[6.799%] tablet:p-[10.4%]">
              {/* ---- header ---- */}
              {/* The app name deliberately has no `desktop-xl` size. It shares its
                  row with the icon, so it only gets 268px in the narrowed card,
                  and "Volume Control" — the longest of the four — needs 35.6px or
                  less to hold one line there. 35px is already that ceiling, so
                  growing it only buys a wrap the reference frame does not have. */}
              <div className="flex items-center gap-[12px] tablet:gap-[20px]">
                <Image
                  src={panel.icon}
                  alt=""
                  width={279}
                  height={280}
                  aria-hidden="true"
                  className="size-[40px] shrink-0 rounded-[20.8%] tablet:size-[65px] desktop-xl:size-[54px]"
                />
                <h3 className="text-[20px] leading-[26px] font-extrabold text-black tablet:text-[35px] tablet:leading-[46px]">
                  {panel.title}
                </h3>
              </div>

              {panel.question && (
                <p className="mt-[20px] text-[16px] leading-[21px] font-medium text-black tablet:mt-[35px] desktop-xl:mt-[26px] tablet:text-[20px] tablet:leading-[26px] desktop-xl:text-[21px] desktop-xl:leading-[28px]">
                  {panel.question}
                </p>
              )}

              <p className="mt-[14px] text-[12px] leading-[16px] font-light text-black tablet:mt-[30px] desktop-xl:mt-[22px] tablet:text-[14px] tablet:leading-[18px] desktop-xl:text-[15px] desktop-xl:leading-[20px]">
                {panel.description}
              </p>

              {panel.cta && (
                <a
                  href={panel.cta.href}
                  // One width for all four past 1920. `w-fit` sizes each pill to its own
                  // label, so the four ran 204-230px and read as four different
                  // buttons; 240 clears the longest ("Explore Volume Control", 230)
                  // and `justify-between` pins the arrow to the right edge so the
                  // shorter labels do not leave it floating mid-pill.
                  className="group/cta relative mt-[18px] flex h-[40px] w-fit max-w-full shrink-0 items-center gap-[10px] rounded-full bg-black pr-[10px] pl-[16px] transition-colors duration-[450ms] ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:hover:bg-white motion-reduce:transition-none tablet:mt-[30px] desktop-xl:mt-[22px] desktop-xl:h-[44px] desktop-xl:w-[240px] desktop-xl:justify-between"
                >
                  {/*
                   * The whole pill inverts on hover: black ground and white type
                   * become white ground and black type, and the arrow's disc
                   * flips with them.
                   *
                   * The hairline is what keeps the pill's edge honest once it
                   * turns white, because the card behind it is white too. On the
                   * black fill it has nothing to do, so it runs the opposite way
                   * from the ground: solid at rest, 15% on hover, where the edge
                   * is actually at risk of disappearing.
                   *
                   * The fill is `hover:` on the pill while everything inside it
                   * is `group-hover:` — a group's own element is not a descendant
                   * of itself, so `group-hover` never matches it. That mismatch
                   * is what left the ground white while the label went white too.
                   *
                   * The stroke is a ring on its own element rather than a `border`
                   * on the pill: a border is part of the box, so bringing one in
                   * would shift the label by its own width. An inset ring paints
                   * inside the same box and moves nothing — the CTA measures the
                   * same at rest and on hover.
                   */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-black transition-[box-shadow] duration-[450ms] ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:group-hover/cta:ring-black/15 motion-reduce:transition-none"
                  />

                  <span className="relative text-[14px] leading-[18px] text-white transition-colors duration-[450ms] ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:group-hover/cta:text-black motion-reduce:transition-none desktop-xl:text-[15px] desktop-xl:leading-[20px]">
                    {panel.cta.label}
                  </span>

                  {/*
                   * The same arrow move as the footer's ring: one copy leaves
                   * through the top-right and its replacement arrives from the
                   * bottom-left, both clipped to the circle by `overflow-hidden`,
                   * so it reads as one arrow travelling through rather than a
                   * glyph that jumps back. Two copies rather than one going out
                   * and returning — a single arrow has to come back along the
                   * diagonal it just left by, which reads as a recoil.
                   */}
                  {/* `text-*` on the disc rather than a colour on the arrows:
                      both copies draw with `currentColor`, so one declaration
                      here inverts the pair and they cannot fall out of step. */}
                  <span className="relative grid size-[20px] shrink-0 place-items-center overflow-hidden rounded-full bg-white text-black transition-colors duration-[450ms] ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:group-hover/cta:bg-black can-hover:group-hover/cta:text-white motion-reduce:transition-none">
                    <CtaArrow className="translate-x-0 translate-y-0 can-hover:group-hover/cta:translate-x-[150%] can-hover:group-hover/cta:-translate-y-[150%]" />
                    <CtaArrow className="-translate-x-[150%] translate-y-[150%] can-hover:group-hover/cta:translate-x-0 can-hover:group-hover/cta:translate-y-0" />
                  </span>
                </a>
              )}

              {panel.badge && (
                <span // Matches the CTA pill past 1920 — the same 240x44 box with a centred
                  // label — so the "coming soon" card sits in the row rather than
                  // beside it.
                  className="mt-[18px] flex h-[38px] w-fit shrink-0 items-center rounded-full bg-[#909090] px-[17px] text-[14px] leading-[18px] text-white tablet:mt-[30px] desktop-xl:mt-[22px] desktop-xl:h-[44px] desktop-xl:w-[240px] desktop-xl:justify-center desktop-xl:text-[15px] desktop-xl:leading-[20px]"
                >
                  {panel.badge}
                </span>
              )}

              {/* ---- closing block, anchored to the bottom of the card ---- */}
              {/* `pb-0` and a `-mb` on the stats below: the closing block is
                  pinned to the foot by `mt-auto`, so the only thing under the
                  numbers is the card's own padding — and a caption's line box
                  carries leading under its baseline, which made that padding
                  read deeper than the equal one above it. The negative margin
                  takes back just that leading. */}
              <div className="mt-auto pt-[20px] -mb-[6px] desktop-xl:mt-[26px]">
                {panel.quote && (
                  <p className="mb-[20px] text-[15px] leading-[21px] font-medium text-black tablet:mb-[40px] tablet:text-[20px] tablet:leading-[26px] desktop-xl:text-[21px] desktop-xl:leading-[28px]">
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
                        <p className="text-[12px] leading-[16px] text-black tablet:text-[14px] tablet:leading-[18px] desktop-xl:text-[15px] desktop-xl:leading-[20px]">
                          {feature.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                {panel.stats && (
                  <div className="flex gap-[42px] tablet:gap-[111px]">
                    <div>
                      <p className="text-[27px] leading-[36px] font-bold text-black tablet:text-[47px] tablet:leading-[61px] desktop-xl:text-[48px] desktop-xl:leading-[60px]">
                        {panel.stats.downloads}
                      </p>
                      <p className="text-[12px] leading-[16px] text-black tablet:text-[16px] tablet:leading-[20px] desktop-xl:text-[16px] desktop-xl:leading-[21px]">
                        Downloads
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-[7px]">
                        <p className="text-[27px] leading-[36px] font-bold text-black tablet:text-[47px] tablet:leading-[61px] desktop-xl:text-[48px] desktop-xl:leading-[60px]">
                          {panel.stats.rating}
                        </p>
                        <StarRating rating={panel.stats.rating} className="block h-[11px] tablet:h-[18px]" />
                      </div>
                      <p className="text-[12px] leading-[16px] text-black tablet:text-[16px] tablet:leading-[20px] desktop-xl:text-[16px] desktop-xl:leading-[21px]">
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
    </div>
  );
}

/**
 * One copy of the CTA's arrow. Two of these ride in the circle at a time — see
 * the note at the ring for why — on the same curve the footer's arrow uses.
 */
function CtaArrow({ className }: { className: string }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      aria-hidden="true"
      fill="none"
      className={`col-start-1 row-start-1 transition-transform duration-[600ms] ease-[cubic-bezier(0.625,0.05,0,1)] motion-reduce:transition-none ${className}`}
    >
      <path
        d="M2 9 9 2M4 2h5v5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
