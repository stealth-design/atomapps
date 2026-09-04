import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PARTNERS, TEAM } from "@/components/folds/fold08/leadership";

/**
 * Fold 08 — Leadership & Partners
 *
 * Figma (canvas `----> v7`):
 *   desktop  1136:2559  1440 x 1137
 *   mobile   1136:2479   393 x 685
 *
 * Partner strip up top, then the leadership grid. Desktop runs the five logos
 * in one row and the three people at 376x329; mobile wraps the logos to 3 + 2,
 * relabels the section "Leadership / Meet the team", and crops the portraits
 * square at 109px. Logo widths and order both come from `leadership.ts`.
 */
export default function Fold08() {
  return (
    <Section fold="08" className="bg-white">
      {/* Bottom gap only — see Fold 07. The space above comes from Fold 07's
          bottom, and this fold's bottom is what separates it from the footer. */}
      <div className="px-5 pb-[var(--fold-gap-y)] tablet:px-10">
        <div className="mx-auto max-w-[var(--content-max-width)]">
          {/* ---------- partners ---------- */}
          <Reveal variant="stagger">
            <p className="text-center text-[13px] leading-[17px] font-bold text-black uppercase">
              Our partners
            </p>

            <ul className="mt-[35px] flex flex-wrap items-center justify-center gap-x-[30px] gap-y-[21px] tablet:gap-x-[65px]">
              {PARTNERS.map((partner) => (
                <li
                  key={partner.name}
                  className={`shrink-0 ${MOBILE_ORDER[partner.order.mobile]} ${DESKTOP_ORDER[partner.order.desktop]}`}
                >
                  <Image
                    src={`/images/fold08/${partner.src}`}
                    alt={partner.name}
                    width={partner.width.desktop}
                    height={55}
                    className="h-auto w-[var(--logo-w)] tablet:w-[var(--logo-w-lg)]"
                    style={
                      {
                        "--logo-w": `${partner.width.mobile}px`,
                        "--logo-w-lg": `${partner.width.desktop}px`,
                      } as React.CSSProperties
                    }
                  />
                </li>
              ))}
            </ul>
          </Reveal>

          {/* ---------- leadership ---------- */}
          {/* Artboard has 119/235px here; trimmed about a quarter, since that
              much air read as a break between two folds rather than two blocks
              of one. */}
          <Reveal variant="fade-up" start="top 85%" className="mt-[92px] tablet:mt-[176px]">
            <p className="text-center text-[12px] leading-[16px] font-bold text-[#111116] uppercase tablet:hidden">
              Leadership
            </p>
            <h2 className="mt-[8px] text-center text-[26px] leading-[34px] font-extrabold text-[#111116] tablet:mt-0 tablet:text-[48px] tablet:leading-[55px]">
              <span className="tablet:hidden">Meet the team</span>
              <span className="hidden tablet:inline">Leadership Team</span>
            </h2>

            <ul className="mt-[32px] flex justify-center gap-[13px] tablet:mt-[54px] tablet:gap-[20px]">
              {TEAM.map((member, index) => (
                <li key={member.name} className="w-[109px] tablet:w-[376px]">
                  {/*
                   * The three columns travel at three different rates, which is
                   * what makes the parallax here legible: the photos used to
                   * drift inside their frames instead, but identically, and
                   * motion nothing can be compared against does not read as
                   * motion. Raked left to right rather than alternating, so the
                   * row tilts as one thing instead of scattering.
                   *
                   * The whole column moves, frame and caption together, rather
                   * than the photo moving inside a frame that is itself moving.
                   * Nesting the two cost most of the travel: a trigger inside a
                   * moving element has its start and end measured off a shifted
                   * position, and down here — with only the footer left below —
                   * `clamp()` then trims the window to the scroll that is
                   * actually left, so the tween never reaches its end.
                   *
                   * The `li` is the trigger and stays put; only the box inside
                   * it moves.
                   *
                   * Off below `tablet`, where the row is three 109px thumbnails
                   * and a rake this size would just look misaligned.
                   */}
                  <div
                    data-parallax="trigger"
                    data-parallax-disable="mobileLandscape"
                    data-parallax-start={COLUMN_RAKE[index % COLUMN_RAKE.length]}
                    data-parallax-end={-COLUMN_RAKE[index % COLUMN_RAKE.length]}
                  >
                    <div data-parallax="target">
                      <Image
                        src={`/images/fold08/${member.photo}`}
                        alt={member.name}
                        width={752}
                        height={658}
                        // Three across on mobile (~105px each) against a 376px
                        // slot on desktop. Without this the 752px intrinsic
                        // made Next serve a 1920w variant into a 105px box.
                        sizes="(min-width: 768px) 380px, 33vw"
                        className="aspect-square w-full rounded-[12px] object-cover tablet:aspect-[376/329] tablet:rounded-[5px]"
                      />
                      <p className="mt-[18px] text-center text-[17.4px] leading-[24px] font-bold text-[#111116] tablet:mt-[25px] tablet:text-left tablet:text-[24px] tablet:leading-[31px]">
                        {member.name}
                      </p>
                      <p className="mt-[3px] text-center text-[12px] leading-[16px] text-[#111116] tablet:mt-[4px] tablet:text-left tablet:text-[18px] tablet:leading-[24px] tablet:font-light">
                        <span className="tablet:hidden">{member.roleMobile ?? member.role}</span>
                        <span className="hidden tablet:inline">{member.role}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* ---------- leadership ---------- */}
          {/* Artboard has 119/235px here; trimmed about a quarter, since that
              much air read as a break between two folds rather than two blocks
              of one. */}
          <Reveal variant="fade-up" start="top 85%" className="mt-[92px] tablet:mt-[176px]">
            <p className="text-center text-[12px] leading-[16px] font-bold text-[#111116] uppercase tablet:hidden">
              Leadership
            </p>
            <h2 className="mt-[8px] text-center text-[26px] leading-[34px] font-extrabold text-[#111116] tablet:mt-0 tablet:text-[48px] tablet:leading-[55px]">
              <span className="tablet:hidden">Meet the team</span>
              <span className="hidden tablet:inline">Leadership Team</span>
            </h2>

            <ul className="mt-[32px] flex justify-center gap-[13px] tablet:mt-[54px] tablet:gap-[20px]">
              {TEAM.map((member, index) => (
                <li key={member.name} className="w-[109px] tablet:w-[376px]">
                  {/*
                   * The three columns travel at three different rates, which is
                   * what makes the parallax here legible at all: the photos
                   * were already drifting inside their frames, but identically,
                   * and motion nothing can be compared against does not read as
                   * motion. Raked left to right rather than alternating, so the
                   * row tilts as one thing instead of scattering.
                   *
                   * The `li` is the trigger and stays put; only the box inside
                   * it moves. That keeps this measurable — the frame below is a
                   * trigger too, and a trigger inside a moving element gets its
                   * own start and end measured off a shifted position.
                   *
                   * Off below `tablet`, where the row is three 109px thumbnails
                   * and a rake this size would just look misaligned.
                   */}
                  <div
                    data-parallax="trigger"
                    data-parallax-disable="mobileLandscape"
                    data-parallax-start={COLUMN_RAKE[index % COLUMN_RAKE.length]}
                    data-parallax-end={-COLUMN_RAKE[index % COLUMN_RAKE.length]}
                  >
                    <div data-parallax="target">
                  {/* The frame keeps the artboard's crop and corner radius; the
                      photo inside it is what moves. Off below 480px, where the
                      portraits are 109px thumbnails and the travel would read
                      as a wobble rather than depth. */}
                  <div
                    data-parallax="trigger"
                    data-parallax-disable="mobile"
                    data-parallax-start="12"
                    data-parallax-end="-12"
                    className="relative aspect-square overflow-hidden rounded-[12px] tablet:aspect-[376/329] tablet:rounded-[5px]"
                  >
                    {/* 136% tall, hung 18% above the frame, so ±12% of the
                        photo's own height — about ±16% of the frame — always
                        has image behind it and the crop never shows through.
                        Overhang has to stay ahead of travel: raising one
                        without the other is what opens a gap at the edge. */}
                    <div
                      data-parallax="target"
                      className="absolute inset-x-0 top-[-18%] h-[136%]"
                    >
                      <Image
                        src={`/images/fold08/${member.photo}`}
                        alt={member.name}
                        width={752}
                        height={658}
                        // Three across on mobile (~105px each) against a 376px
                        // slot on desktop. Without this the 752px intrinsic
                        // made Next serve a 1920w variant into a 105px box.
                        sizes="(min-width: 768px) 380px, 33vw"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="mt-[18px] text-center text-[17.4px] leading-[24px] font-bold text-[#111116] tablet:mt-[25px] tablet:text-left tablet:text-[24px] tablet:leading-[31px]">
                    {member.name}
                  </p>
                  <p className="mt-[3px] text-center text-[12px] leading-[16px] text-[#111116] tablet:mt-[4px] tablet:text-left tablet:text-[18px] tablet:leading-[24px] tablet:font-light">
                    <span className="tablet:hidden">{member.roleMobile ?? member.role}</span>
                    <span className="hidden tablet:inline">{member.role}</span>
                  </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* Per-column travel, as a share of a column's own height, rising left to
   right so the row rakes rather than scatters. The largest works out at ~74px
   either way against the 176px of air above the row and the fold's own gap
   below it, so no column ever reaches its neighbours' blocks. */
const COLUMN_RAKE = [4, 11, 18];

/* Tailwind needs literal class names, so the order utilities are looked up
   rather than interpolated from the data. */
const MOBILE_ORDER = ["", "order-1", "order-2", "order-3", "order-4", "order-5"];
const DESKTOP_ORDER = [
  "",
  "tablet:order-1",
  "tablet:order-2",
  "tablet:order-3",
  "tablet:order-4",
  "tablet:order-5",
];
