import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Testimonial } from "./testimonials";

/**
 * One quote card. Height is content-driven, which reproduces Figma's masonry
 * exactly: 24px padding, a 60px app chip, a 12px gap and then the quote — so a
 * three-line quote lands on 189px and a four-line one on 212px, the two card
 * heights in the design.
 */
export function TestimonialCard({
  testimonial,
  faded,
  ...rest
}: {
  testimonial: Testimonial;
  faded?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <figure
      {...rest}
      className={cn(
        "w-full rounded-[14px] bg-white p-[18px] shadow-[0_10px_28px_rgba(0,0,0,0.04)] tablet:rounded-[20px] tablet:p-[24px]",
        faded && "opacity-40",
      )}
    >
      <figcaption className="flex h-[46px] w-fit items-center gap-[8px] rounded-[9px] border border-[#e8e8e8] bg-white px-[12px] tablet:h-[60px] tablet:gap-[10px] tablet:rounded-[12px] tablet:px-[10px]">
        <Image
          src={testimonial.icon}
          alt=""
          width={279}
          height={280}
          className="size-[21px] rounded-[22%] tablet:size-[28px]"
        />
        <span className="text-[9px] leading-[12px] font-bold text-[#111116] tablet:text-[12px] tablet:leading-[16px]">
          {testimonial.app}
        </span>
        <span
          aria-label="Rated 5 out of 5"
          className="text-[9px] leading-[12px] tracking-[0.5px] text-[#ffbf00] tablet:text-[12px] tablet:leading-[15px]"
        >
          ★★★★★
        </span>
      </figcaption>

      <blockquote className="mt-[9px] text-[11.4px] leading-[18px] text-[#61616a] tablet:mt-[12px] tablet:text-[15px] tablet:leading-[23px]">
        {testimonial.quote}
      </blockquote>
    </figure>
  );
}
