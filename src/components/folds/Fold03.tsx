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
  // Only a top gap: the stage already ends in whitespace below the settled
  // grid, so a bottom gap on top of that is what made the run into Fold 04
  // read as a void.
  //
  // That whitespace is also why the top gap is not the plain fold token. The
  // space *below* this fold is its leftover stage plus Fold 04's own padding
  // (170px at 1440), while the space above was only Fold 02's padding plus
  // ours, and the scatter starts hard against the stage's top edge — 134px at
  // 1440, and just 42px on a phone. The larger top values below even the two
  // sides up at the breakpoints the artboards actually specify. Exact parity
  // at every width isn't reachable with static padding, because the gap below
  // scales with the stage's aspect while the heading's type size doesn't.
  return (
    <Section
      fold="03"
      className="bg-white pt-[96px] tablet:pt-[var(--fold-gap-y)] desktop-md:pt-[80px]"
    >
      <Fold03Motion>
        <div
          data-f03="stage"
          // The stage is aspect-locked rather than viewport-height.
          //
          // Everything in here is positioned as a percentage of the stage, but
          // icon *sizes* are percentages of its width — so the two only stay in
          // step while the stage keeps a fixed aspect. A `svh` stage broke that
          // (the composition stretched at one height and squashed at another)
          // and, being taller than the composition needs, left 337px of dead
          // white under the settled grid on desktop: the gap to Fold 04
          // measured 507px. These ratios are the artboards trimmed to what the
          // end frame actually occupies, which holds the gap near the standard
          // fold rhythm at every width.
          className="relative aspect-[393/545] w-full overflow-clip bg-white tablet:aspect-[1440/560]"
        >
          {/* ---------- phone plate + white fade (mobile) ---------- */}
          {/* Anchored by its bottom, not its top. The plate's upper half is
              painted out by PHONE_FADE, so only its lower edge is actually
              visible — pinning that edge keeps the device where the artboard
              has it (bottom at 90% mobile / 93.8% desktop) while the shorter
              stage crops only the part nobody can see. */}
          <div
            data-f03="phone"
            className="absolute tablet:hidden"
            style={{
              left: `${(-58 / MOBILE_STAGE.width) * 100}%`,
              bottom: `${((MOBILE_STAGE.height - (244 + 319)) / MOBILE_STAGE.height) * 100}%`,
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
              bottom: `${((DESKTOP_STAGE.height - (187 + 644)) / DESKTOP_STAGE.height) * 100}%`,
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
            // Bottom-anchored to stay on the phone's screen, which is now
            // bottom-anchored too (the reflection is square, so its height
            // follows its width).
            style={{
              left: `${(136 / MOBILE_STAGE.width) * 100}%`,
              bottom: `${((MOBILE_STAGE.height - (333 + 122)) / MOBILE_STAGE.height) * 100}%`,
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
              bottom: `${((DESKTOP_STAGE.height - (406 + 205)) / DESKTOP_STAGE.height) * 100}%`,
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
