import Image from "next/image";
import Link from "next/link";
import { APPS, appIconSrc, type AppPage } from "@/data/apps";
import { ICON_RADIUS } from "@/components/folds/fold03/appIcons";

/**
 * The rest of the family, at the foot of every app page. The same artwork as
 * Fold 03's grid, at the same corner radius, so it reads as the same set of
 * icons a reader came in through — just with names under them this time.
 */
export function MoreApps({ current }: { current: AppPage }) {
  const others = APPS.filter((app) => app.slug !== current.slug);

  return (
    <section aria-labelledby="more-apps-heading">
      <h2
        id="more-apps-heading"
        className="text-[24px] leading-[30px] font-extrabold text-[var(--foreground)] tablet:text-[30px] tablet:leading-[38px]"
      >
        More from Atom Apps
      </h2>

      <ul className="mt-[28px] grid grid-cols-3 gap-x-[16px] gap-y-[28px] tablet:mt-[36px] tablet:grid-cols-5 tablet:gap-x-[24px] desktop-sm:grid-cols-7">
        {others.map((app) => (
          <li key={app.slug}>
            <Link
              href={`/apps/${app.slug}`}
              className="group/app flex flex-col items-center gap-[12px] text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              <span
                className="block w-full max-w-[96px] overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:group-hover/app:scale-[1.06] motion-reduce:transition-none"
                style={{ borderRadius: ICON_RADIUS }}
              >
                <Image
                  src={appIconSrc(app)}
                  alt=""
                  width={279}
                  height={280}
                  sizes="96px"
                  className="aspect-square w-full object-cover"
                />
              </span>
              <span className="text-[13px] leading-[18px] font-medium text-[var(--foreground)] tablet:text-[14px] tablet:leading-[19px]">
                {app.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
