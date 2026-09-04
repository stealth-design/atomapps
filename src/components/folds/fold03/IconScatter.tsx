import Image from "next/image";
import {
  BLUR_SCALE,
  DESKTOP_ICONS,
  DESKTOP_STAGE,
  END_ORDER,
  ICON_RADIUS,
  MOBILE_ICONS,
  MOBILE_STAGE,
  type IconPlacement,
} from "./appIcons";

/**
 * The app-icon layer: exactly ONE element per icon, which the scroll timeline
 * animates all the way from the scatter, through the phone, to the final grid.
 *
 * The two artboards scatter the icons differently, and an element can only
 * have one inline style, so the START boxes ship as a small server-rendered
 * stylesheet with a `min-width: 768px` block for the desktop scatter. That
 * keeps SSR correct at both breakpoints without duplicating the DOM — the
 * timeline then measures whatever the active breakpoint laid out.
 *
 * Each icon is two nested elements on purpose: the outer box is owned by the
 * scroll timeline (x / y / scale / filter / opacity) and the inner one by the
 * ambient float, so the two never fight over the same property.
 */

const pct = (value: number, basis: number) => `${((value / basis) * 100).toFixed(4)}%`;

function startRules(icons: IconPlacement[], stage: { width: number; height: number }) {
  return icons
    .map((item) => {
      const declarations = [
        `left:${pct(item.x, stage.width)}`,
        `top:${pct(item.y, stage.height)}`,
        `width:${pct(item.size, stage.width)}`,
        `opacity:${item.opacity ?? 1}`,
        `filter:blur(${(item.blur ?? 0) * BLUR_SCALE}px)`,
      ].join(";");
      return `#fold-03 [data-f03-icon="${item.icon}"]{${declarations}}`;
    })
    .join("");
}

const START_CSS = [
  startRules(MOBILE_ICONS, MOBILE_STAGE),
  `@media(min-width:768px){${startRules(DESKTOP_ICONS, DESKTOP_STAGE)}}`,
].join("");

export function IconScatter() {
  return (
    <div aria-hidden="true">
      <style>{START_CSS}</style>

      {END_ORDER.map((icon) => (
        <div key={icon} data-f03-icon={icon} className="absolute aspect-square">
          <div
            data-f03-float
            className="relative h-full w-full overflow-hidden"
            style={{ borderRadius: ICON_RADIUS }}
          >
            <Image
              src={`/images/fold03/${icon}.jpg`}
              alt=""
              fill
              sizes="(max-width: 767px) 25vw, 20vw"
              className="object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
