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
      <div className="px-5 py-[var(--fold-gap-y)] tablet:px-10">
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
          <Reveal variant="fade-up" start="top 85%" className="mt-[119px] tablet:mt-[235px]">
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
                  <Image
                    src={`/images/fold08/${member.photo}`}
                    alt={member.name}
                    width={752}
                    height={658}
                    className="aspect-square w-full rounded-[12px] object-cover tablet:aspect-[376/329] tablet:rounded-[5px]"
                  />
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
