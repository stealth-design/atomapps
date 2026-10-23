import Image from "next/image";
import type { ReactNode } from "react";

export type Step = { title: string; text: string; image: string };

type Props = { steps: Step[]; intro?: ReactNode; className?: string };

const two = (n: number) => String(n).padStart(2, "0");

/**
 * The "How it works" band: `intro` over the steps as a stack of cards that scroll normally. On desktop
 * each card holds its step's image `position: fixed` at the same spot in the
 * viewport and clips it with `clip-path` (which, unlike overflow, clips fixed
 * descendants) — so the image reads as one still frame and the card edges
 * wipe it from one step to the next. Below desktop the image just sits in the
 * card under the text.
 */
export function StepSlider({ steps, intro, className = "" }: Props) {
  const n = steps.length;
  return (
    <section
      aria-label="How it works"
      className={`px-[var(--content-padding)] pt-[calc(var(--header-height)+20px)] pb-16 [--v:min(520px,62svh)] ${className}`}
    >
      {intro}
      <ol className="mx-auto mt-10 flex max-w-[1100px] flex-col gap-4 tablet:gap-6">
        {steps.map(({ title, text, image }, i) => (
          <li
            key={title}
            className="flex flex-col gap-6 rounded-[24px] bg-[linear-gradient(135deg,#fff_0%,#eef0f8_100%)] p-6 [clip-path:inset(0_round_24px)] tablet:p-10 desktop-sm:h-[min(600px,74svh)] desktop-sm:justify-center desktop-sm:rounded-[28px] desktop-sm:p-16 desktop-sm:[clip-path:inset(0_round_28px)]"
          >
            <div className="desktop-sm:max-w-[42%]">
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-black/30">
                {two(i + 1)} / {two(n)}
              </p>
              <h3 className="mt-3 text-[30px] leading-[1.05] font-semibold tracking-[-0.03em] tablet:text-[44px] desktop-sm:text-[52px]">
                {title}
              </h3>
              <p className="mt-4 text-[16px] leading-[1.45] text-black/55 tablet:text-[20px]">{text}</p>
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-[24px] desktop-sm:fixed desktop-sm:top-1/2 desktop-sm:right-[max(64px,calc(50%-486px))] desktop-sm:size-[var(--v)] desktop-sm:-translate-y-1/2 desktop-sm:rounded-[28px]">
              <Image
                src={image}
                alt=""
                width={608}
                height={608}
                sizes="(max-width: 1023px) 90vw, 520px"
                className="h-full w-full object-cover"
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
