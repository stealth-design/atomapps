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
 * relabels the section "Leadership / Meet the team", and stacks the people one
 * to a row with full-width square portraits. Logo widths and order both come
 * from `leadership.ts`.
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
            <h2 className="mt-[8px] text-center text-[26px] leading-[34px] font-normal text-[#111116] tablet:mt-0 tablet:text-[48px] tablet:leading-[55px]">
              <span className="tablet:hidden">Meet the team</span>
              <span className="hidden tablet:inline">Leadership Team</span>
            </h2>

            {/* Mobile stacks the three one to a row, each portrait the full
                column less 8px a side (28px from the screen edge in all). */}
            <ul className="mt-[32px] flex flex-col gap-[28px] px-2 tablet:mt-[54px] tablet:flex-row tablet:justify-center tablet:gap-[20px] tablet:px-0">
              {TEAM.map((member) => (
                <li key={member.name} className="tablet:w-[376px]">
                  {/* The frame keeps the artboard's crop and corner radius. */}
                  <div className="relative aspect-square overflow-hidden rounded-[12px] tablet:aspect-[376/329] tablet:rounded-[5px]">
                    {/* Flush with the frame, and the drift is gone with it.
                        The photo used to sit in a box 136% tall hung 18% above,
                        which is what gave the parallax room to travel — but it
                        also meant the frame only ever showed rows 13% to 87% of
                        the photo, and every head in this row starts inside that
                        first 13%. There is no way to keep both: the crop only
                        exists to be panned, so anchoring the photo costs the
                        travel.
                        It costs nothing else. The frame is 376x329 and every
                        photo is the same 1.143, so at `inset-0` `object-cover`
                        shows each one whole, uncropped.

                        The sources are not all the same size, though: Dan and
                        Tarika are 1341x1173, Ekaterina 376x329. The frame is
                        376 wide, so hers is a 1x asset where theirs are better
                        than 2x — she will read soft on a retina screen until
                        the portrait is re-exported at 752 or above. */}
                    <div className="absolute inset-0">
                      <Image
                        src={`/images/fold08/${member.photo}`}
                        alt={member.name}
                        width={752}
                        height={658}
                        // Nearly full width on mobile, a 376px slot on desktop.
                        sizes="(min-width: 768px) 380px, 100vw"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Same type at both breakpoints; mobile centres it under the
                      portrait and sits it a little closer. */}
                  <p className="mt-[16px] text-center text-[24px] leading-[31px] font-bold text-[#111116] tablet:mt-[25px] tablet:text-left">
                    {member.name}
                  </p>
                  <p className="mt-[2px] text-center text-[18px] leading-[24px] font-light text-[#111116] tablet:mt-[4px] tablet:text-left">
                    {member.role}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

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
