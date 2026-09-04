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
              {TEAM.map((member) => (
                <li key={member.name} className="w-[109px] tablet:w-[376px]">
                  {/* The frame keeps the artboard's crop and corner radius; the
                      photo inside it is what moves. Off below 480px, where the
                      portraits are 109px thumbnails and the travel would read
                      as a wobble rather than depth. */}
                  <div
                    data-parallax="trigger"
                    data-parallax-disable="mobile"
                    data-parallax-start="8"
                    data-parallax-end="-8"
                    className="relative aspect-square overflow-hidden rounded-[12px] tablet:aspect-[376/329] tablet:rounded-[5px]"
                  >
                    {/* 124% tall, hung 12% above the frame, so ±8% of the
                        photo's own height — about ±10% of the frame — always
                        has image behind it and the crop never shows through. */}
                    <div
                      data-parallax="target"
                      className="absolute inset-x-0 top-[-12%] h-[124%]"
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
