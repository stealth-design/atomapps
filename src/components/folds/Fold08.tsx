import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PartnerStrip } from "@/components/folds/fold08/PartnerStrip";
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

            {/*
             * One row at every breakpoint. On mobile it is deliberately wider
             * than the screen — full-bleed past the page gutter, at the
             * logos' full Figma widths rather than the artboard's shrunken
             * mobile ones — and PartnerStrip maps page scroll onto its
             * horizontal scroll so all five pass through view.
             *
             * The scroller stays on until 1280, not 768: at their full widths
             * the five logos plus gaps come to 1065px, which does not fit
             * inside the page gutter until roughly 1145px of viewport.
             * Handing over to a centred row at `tablet` put 149px of
             * horizontal overflow on the whole page at 768.
             *
             * `overflow-x-auto` rather than `hidden`: the strip stays
             * swipeable, which is what reduced-motion users rely on since
             * they get no scroll-driven travel.
             */}
            <PartnerStrip>
              <div
                data-f08-strip
                className="mt-[35px] -mx-5 overflow-x-auto tablet:-mx-10 desktop-md:mx-0 desktop-md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <ul className="flex w-max items-center gap-[44px] px-5 tablet:px-10 desktop-md:w-full desktop-md:justify-center desktop-md:gap-[65px] desktop-md:px-0">
                  {PARTNERS.map((partner) => (
                    <li key={partner.name} className="shrink-0">
                      <Image
                        src={`/images/fold08/${partner.src}`}
                        alt={partner.name}
                        width={partner.width}
                        height={55}
                        className="h-auto"
                        style={{ width: partner.width }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </PartnerStrip>
          </Reveal>

          {/* ---------- leadership ---------- */}
          {/* Artboard has 119/235px here; trimmed about a quarter, since that
              much air read as a break between two folds rather than two blocks
              of one. */}
          <Reveal
            variant="fade-up"
            start="top 85%"
            className="mt-[92px] tablet:mt-[176px]"
          >
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
                    // Three across on mobile (~105px each) against a 376px slot
                    // on desktop. Without this the 752px intrinsic made Next
                    // serve a 1920w variant into a 105px box.
                    sizes="(min-width: 768px) 380px, 33vw"
                    className="aspect-square w-full rounded-[12px] object-cover tablet:aspect-[376/329] tablet:rounded-[5px]"
                  />
                  <p className="mt-[18px] text-center text-[17.4px] leading-[24px] font-bold text-[#111116] tablet:mt-[25px] tablet:text-left tablet:text-[24px] tablet:leading-[31px]">
                    {member.name}
                  </p>
                  <p className="mt-[3px] text-center text-[12px] leading-[16px] text-[#111116] tablet:mt-[4px] tablet:text-left tablet:text-[18px] tablet:leading-[24px] tablet:font-light">
                    <span className="tablet:hidden">
                      {member.roleMobile ?? member.role}
                    </span>
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
