import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Fold03Motion } from "@/components/folds/fold03/Fold03Motion";
import { IconScatter } from "@/components/folds/fold03/IconScatter";
import { DESKTOP_STAGE, MOBILE_STAGE, PHONE_FADE } from "@/components/folds/fold03/appIcons";

/**
 * Fold 03 — App Family
 *
 * Figma (canvas `----> v7`):
 *   desktop  1136:2630  1440 x 886
 *   mobile   1136:1122   393 x 626
 *
 * A pinned, scroll-scrubbed sequence: the scattered app icons are pulled into
 * the phone, the phone dissolves, and the same icons expand into the final
 * two-row grid. The start frame is the Figma composition; the timeline and the
 * end grid live in Fold03Motion / appIcons.
 *
 * The stage is one viewport tall so the composition is always fully in frame
 * while pinned. Icon start boxes come from IconScatter's stylesheet; the
 * heading is deliberately untouched by the timeline so it stays put.
 */
export default function Fold03() {
  // Uses the shared --fold-gap-y rhythm. The icons Figma lets bleed past the
  // frame (icon-03 sits at y=-145) are clipped by the stage instead of being
  // given svh clearance, which is what used to bloat the gap to Fold 04.
  return (
    <Section fold="03" className="bg-white py-[var(--fold-gap-y)]">
      <Fold03Motion>
        <div
          data-f03="stage"
          // Mobile is pinned to the artboard's own 626px height rather than a
          // full viewport. Every position in here is a percentage of the stage
          // (heading 34.35%, phone plate 39%), so on an 844px phone a `svh`
          // stage stretched them all and left 270px of dead space under the
          // settled grid — the "too much space" before Fold 04. At 626px the
          // percentages land exactly where Figma put them and the slack goes
          // away. Desktop keeps `svh`: its artboard is 886 tall, which is
          // already about a viewport.
          className="relative h-[626px] w-full overflow-clip bg-white tablet:h-svh tablet:min-h-[626px]"
        >
          {/* ---------- phone plate + white fade (mobile) ---------- */}
          <div
            data-f03="phone"
            className="absolute tablet:hidden"
            style={{
              left: `${(-58 / MOBILE_STAGE.width) * 100}%`,
              top: `${(244 / MOBILE_STAGE.height) * 100}%`,
              width: `${(510 / MOBILE_STAGE.width) * 100}%`,
              aspectRatio: "510 / 319",
            }}
          >
            <Image
              src="/images/fold03/phone-mobile.png"
              alt=""
              fill
              sizes="130vw"
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ backgroundImage: PHONE_FADE }} />
          </div>

          {/* ---------- phone plate + white fade (desktop) ---------- */}
          <div
            data-f03="phone"
            className="absolute hidden tablet:block"
            style={{
              left: `${(201 / DESKTOP_STAGE.width) * 100}%`,
              top: `${(187 / DESKTOP_STAGE.height) * 100}%`,
              width: `${(1030 / DESKTOP_STAGE.width) * 100}%`,
              aspectRatio: "1030 / 644",
            }}
          >
            <Image
              src="/images/fold03/phone-desktop.png"
              alt=""
              fill
              sizes="72vw"
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ backgroundImage: PHONE_FADE }} />
          </div>

          {/* ---------- reflection on the phone screen (fades with the phone) ---------- */}
          <Image
            data-f03="phone"
            src="/images/fold03/screen-reflection.png"
            alt=""
            width={256}
            height={256}
            aria-hidden="true"
            className="absolute tablet:hidden"
            style={{
              left: `${(136 / MOBILE_STAGE.width) * 100}%`,
              top: `${(333 / MOBILE_STAGE.height) * 100}%`,
              width: `${(122 / MOBILE_STAGE.width) * 100}%`,
              height: "auto",
              opacity: 0.22,
              filter: "blur(7.5px)",
            }}
          />
          <Image
            data-f03="phone"
            src="/images/fold03/screen-reflection.png"
            alt=""
            width={256}
            height={256}
            aria-hidden="true"
            className="absolute hidden tablet:block"
            style={{
              left: `${(613 / DESKTOP_STAGE.width) * 100}%`,
              top: `${(406 / DESKTOP_STAGE.height) * 100}%`,
              width: `${(205 / DESKTOP_STAGE.width) * 100}%`,
              height: "auto",
              opacity: 0.22,
              filter: "blur(12.5px)",
            }}
          />

          {/* ---------- the icons: one element each, start → phone → grid ---------- */}
          <IconScatter />

          {/* ---------- heading (paints above the icons, as in Figma) ---------- */}
          {/* top: 215/626 mobile, 209/886 desktop */}
          <h2
            data-f03="heading"
            className="absolute top-[34.35%] left-1/2 w-[276px] -translate-x-1/2 text-center text-[18px] leading-[23px] font-extrabold text-black capitalize tablet:top-[23.59%] tablet:w-[462px] tablet:text-[24px] tablet:leading-[31px] desktop-sm:text-[30px] desktop-sm:leading-[39px]"
          >
            {/* Figma has a hard break here: "A family of apps \ndesigned with purpose" */}
            <span className="block">A family of apps</span>
            <span className="block">designed with purpose</span>
          </h2>
        </div>
      </Fold03Motion>
    </Section>
  );
}
