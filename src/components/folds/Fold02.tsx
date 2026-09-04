import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/folds/fold02/CountUp";
import { cn } from "@/lib/utils";

/**
 * Fold 02 — Impact Numbers
 *
 * Figma (canvas `----> v7`):
 *   desktop  1136:2543  1440 x 268 — three columns split by 1px vertical rules
 *   mobile   1136:1109   393 x 326 — stacked, split by 60px horizontal rules
 *
 * The two artboards word the labels differently and use different greys, so
 * both variants are in the markup; `display: none` keeps the unused one out of
 * the accessibility tree.
 */
/**
 * Each figure is split into the number that counts up and the wording either
 * side of it, so "Top 10" animates its 10 while "Top " stays put.
 */
const STATS = [
  {
    to: 160,
    suffix: "K+",
    label: "4 + Star Reviews",
    labelMobile: "4 + Star Reviews",
  },
  {
    prefix: "Top ",
    to: 10,
    label: "Publisher in downloads on US GooglePlay Store",
    labelMobile: "Downloads on US Google Play Store",
  },
  {
    to: 35,
    suffix: "M",
    label: "US Downloads",
    labelMobile: "Million Downloads",
  },
];

export default function Fold02() {
  // The 24px desktop top inset is section padding rather than a margin on the
  // row — a margin would collapse straight through the section's top edge.
  return (
    <Section fold="02" className="h-[326px] bg-[#fafafa] tablet:h-[268px] tablet:pt-6">
      <Reveal
        variant="stagger"
        className="mx-auto flex h-full max-w-[var(--content-max-width)] flex-col justify-center gap-6 px-5 tablet:h-[180px] tablet:flex-row tablet:gap-0 tablet:px-10"
      >
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "flex flex-col items-center tablet:flex-1 tablet:justify-center",
              index > 0 && "tablet:border-l tablet:border-[#e5e7eb]",
            )}
          >
            <p className="text-[40px] leading-[44px] font-bold text-[#111111] tablet:text-[72px] tablet:leading-[76px] tablet:tracking-[-1.44px] tablet:text-black">
              <CountUp to={stat.to} prefix={stat.prefix} suffix={stat.suffix} />
            </p>

            <p className="mt-2 text-center text-[11px] leading-[14px] font-bold tracking-[1px] text-[#61616a] uppercase tablet:mt-4 tablet:text-[13px] tablet:leading-[17px] tablet:tracking-normal tablet:text-black">
              <span className="tablet:hidden">{stat.labelMobile}</span>
              <span className="hidden tablet:inline">{stat.label}</span>
            </p>

            {index < STATS.length - 1 && (
              <span aria-hidden="true" className="mt-2 h-px w-[60px] bg-[#e5e7eb] tablet:hidden" />
            )}
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
