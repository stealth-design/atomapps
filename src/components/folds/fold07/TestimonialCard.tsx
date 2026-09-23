import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Testimonial } from "./testimonials";

/**
 * One quote card. Height is content-driven, which reproduces Figma's masonry
 * exactly: 24px padding, a 60px app chip, a 12px gap and then the quote — so a
 * three-line quote lands on 189px and a four-line one on 212px, the two card
 * heights in the design.
 *
 * The chip is a link to the app's page. `clone` marks the second copy of a
 * card that a marquee track renders for its loop: that copy is `aria-hidden`
 * already, and this takes its link out of the tab order too, so a keyboard
 * reader is not offered every app twice.
 */
export function TestimonialCard({
  testimonial,
  faded,
  clone,
  ...rest
}: {
  testimonial: Testimonial;
  faded?: boolean;
  clone?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <figure
      {...rest}
      className={cn(
        "w-full rounded-[14px] bg-white p-[18px] shadow-[0_10px_28px_rgba(0,0,0,0.04)] tablet:rounded-[20px] tablet:p-[24px]",
        faded && "opacity-40",
      )}
    >
      {/*
       * Mobile type is deliberately larger than the artboard. Figma scales the
       * desktop card down to 393px, which lands the quote at 11.4px and the
       * chip at 9px — legible in a static mockup, not on a phone at arm's
       * length. The quote is now 14px/21px and the chip 11px, the smallest
       * sizes that stay comfortable; desktop is untouched.
       */}
      <figcaption>
        <Link
          href={testimonial.href}
          tabIndex={clone ? -1 : undefined}
          className="flex h-[46px] w-fit items-center gap-[8px] rounded-[9px] border border-[#e8e8e8] bg-white px-[12px] transition-colors duration-300 can-hover:hover:border-[#c9c9c9] motion-reduce:transition-none tablet:h-[60px] tablet:gap-[10px] tablet:rounded-[12px] tablet:px-[10px]"
        >
          <Image
            src={testimonial.icon}
            alt=""
            width={56}
            height={56}
            className="size-[24px] rounded-[22%] tablet:size-[28px]"
          />
          <span className="text-[11px] leading-[14px] font-bold text-[#111116] tablet:text-[12px] tablet:leading-[16px]">
            {testimonial.app}
          </span>
          <span
            aria-label="Rated 5 out of 5"
            className="text-[11px] leading-[14px] tracking-[0.5px] text-[#ffbf00] tablet:text-[12px] tablet:leading-[15px]"
          >
            ★★★★★
          </span>
        </Link>
      </figcaption>

      {/* The quotation marks are the card's, not the data's, so every review
          gets the same pair — the old hand-written set had them on some. */}
      <blockquote className="mt-[10px] text-[14px] leading-[21px] text-[#61616a] tablet:mt-[12px] tablet:text-[15px] tablet:leading-[23px]">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
    </figure>
  );
}
