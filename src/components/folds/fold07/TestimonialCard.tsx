import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_PAGES_LINKED } from "@/data/apps";
import type { Testimonial } from "./testimonials";

/**
 * One quote card. Height is content-driven, which reproduces Figma's masonry
 * exactly: 24px padding, a 60px app chip, a 12px gap and then the quote — so a
 * three-line quote lands on 189px and a four-line one on 212px, the two card
 * heights in the design.
 *
 * `uniform` is for the mobile rows, where every card on a row is drawn at the
 * same height: the card fills its row, the quote is held to four lines and
 * leads, and the chip is pinned to the foot — so a short quote leaves its
 * spare height between the two rather than as an empty band at the bottom.
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
  uniform,
  ...rest
}: {
  testimonial: Testimonial;
  faded?: boolean;
  clone?: boolean;
  uniform?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <figure
      {...rest}
      className={cn(
        "w-full rounded-[14px] bg-white p-[18px] shadow-[0_10px_28px_rgba(0,0,0,0.04)] tablet:rounded-[20px] tablet:p-[24px]",
        faded && "opacity-40",
        uniform && "flex h-full flex-col",
      )}
    >
      {/*
       * Mobile type is deliberately larger than the artboard. Figma scales the
       * desktop card down to 393px, which lands the quote at 11.4px and the
       * chip at 9px — legible in a static mockup, not on a phone at arm's
       * length. The quote is now 14px/21px and the chip 11px, the smallest
       * sizes that stay comfortable; desktop is untouched.
       */}
      <figcaption className={cn(uniform && "order-last mt-auto pt-[14px]")}>
        {/* A link only while the app pages are linked at all — see
            APP_PAGES_LINKED. Off, the chip is the plain card header it was
            before those pages existed, so nothing here dead-ends. */}
        <Chip href={APP_PAGES_LINKED ? testimonial.href : undefined} clone={clone}>
          <Image
            src={testimonial.icon}
            alt=""
            width={56}
            height={56}
            className="size-[24px] rounded-[22%] tablet:size-[28px]"
          />
          {/* Mobile stacks the stars under the name, so a long name such as
              "Volume Control Launcher" stays on one line and every chip is the
              same two rows. Tablet up keeps them side by side. */}
          <span className="flex flex-col gap-[2px] tablet:flex-row tablet:items-center tablet:gap-[10px]">
            <span className="text-[11px] leading-[14px] font-bold whitespace-nowrap text-[#111116] tablet:text-[12px] tablet:leading-[16px] tablet:whitespace-normal">
              {testimonial.app}
            </span>
            <span
              aria-label="Rated 5 out of 5"
              className="text-[11px] leading-[14px] tracking-[0.5px] text-[#ffbf00] tablet:text-[12px] tablet:leading-[15px]"
            >
              ★★★★★
            </span>
          </span>
        </Chip>
      </figcaption>

      {/* The quotation marks are the card's, not the data's, so every review
          gets the same pair — the old hand-written set had them on some. */}
      <blockquote
        className={cn(
          "mt-[10px] text-[14px] leading-[21px] text-[#61616a] tablet:mt-[12px] tablet:text-[15px] tablet:leading-[23px]",
          uniform && "mt-0 line-clamp-4",
        )}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
    </figure>
  );
}

/**
 * The app chip: one box, rendered as a link or as plain text depending on
 * whether there is a page to reach. Kept as one component so the two cannot
 * drift apart on padding, height or border.
 */
function Chip({
  href,
  clone,
  children,
}: {
  href?: string;
  clone?: boolean;
  children: React.ReactNode;
}) {
  const className =
    "flex h-[46px] w-fit items-center gap-[8px] rounded-[9px] border border-[#e8e8e8] bg-white px-[12px] tablet:h-[60px] tablet:gap-[10px] tablet:rounded-[12px] tablet:px-[10px]";

  if (!href) return <span className={className}>{children}</span>;

  return (
    <Link
      href={href}
      tabIndex={clone ? -1 : undefined}
      className={`${className} transition-colors duration-300 can-hover:hover:border-[#c9c9c9] motion-reduce:transition-none`}
    >
      {children}
    </Link>
  );
}
