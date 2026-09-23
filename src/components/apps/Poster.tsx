import Image from "next/image";
import { cn } from "@/lib/utils";
import type { AppPage, AppScreenshot } from "@/data/apps";

/**
 * One of the store's posters, as a card.
 *
 * The listings' screenshots are not raw screen captures: each is a composed
 * marketing frame with a phone already rendered inside it under a headline.
 * So the page does not put them in a device frame of its own — that would be
 * a phone inside a phone — and shows them as the posters they are, on a
 * rounded card with a soft shadow, the way Fold 05 treats its scenes.
 *
 * `shot` is 1-based to match the data; an index the app has no poster for
 * renders nothing rather than the wrong picture.
 */
export function Poster({
  app,
  shot,
  alt,
  priority = false,
  sizes = "(max-width: 767px) 80vw, 400px",
  className,
}: {
  app: AppPage;
  shot: number;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const image: AppScreenshot | undefined = app.screenshots[shot - 1];
  if (!image) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[22px] bg-[var(--surface)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.28)] tablet:rounded-[28px]",
        className,
      )}
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      <Image
        src={image.src}
        alt={alt}
        width={image.width}
        height={image.height}
        priority={priority}
        sizes={sizes}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
