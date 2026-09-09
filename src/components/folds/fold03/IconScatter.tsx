import Image from "next/image";
import {
  BLUR_SCALE,
  ICON_LINKS,
  DESKTOP_ICONS,
  DESKTOP_ICONS_WIDE,
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
  // Tied to the stage's own cap (--content-max-width-wide, 1920), not the
  // layout lock at 1440: up to 1920 the stage still runs end to end, so the
  // two side icons bleed off the screen's own edge exactly as the artboard
  // intends. Only past 1920 does the stage centre inside gutters and turn
  // those bleeds into visible cuts — see DESKTOP_ICONS_WIDE.
  `@media(min-width:1921px){${startRules(DESKTOP_ICONS_WIDE, DESKTOP_STAGE)}}`,
  // Icon links go live only once the sequence has settled — see the anchor
  // below. Written here rather than as a Tailwind variant because the selector
  // needs an ancestor condition on the stage, which arbitrary variants express
  // badly, and this stylesheet is already server-rendered alongside it.
  `#fold-03 [data-f03-icon] a{pointer-events:none}`,
  `#fold-03 [data-f03-complete] [data-f03-icon] a{pointer-events:auto}`,
].join("");

export function IconScatter() {
  return (
    // No `aria-hidden` on the group any more: a linked icon is a real
    // destination and has to reach the accessibility tree. Each unlinked icon
    // carries the attribute itself instead, so the decorative ones stay out of
    // it exactly as before.
    <div>
      <style>{START_CSS}</style>

      {END_ORDER.map((icon) => {
        const link = ICON_LINKS[icon];

        const art = (
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
        );

        return (
          <div
            key={icon}
            data-f03-icon={icon}
            aria-hidden={link ? undefined : true}
            className="absolute aspect-square"
          >
            {link ? (
              // Only live once the grid has settled — mid-flight the icons are
              // moving targets, and a click that lands on whichever one happens
              // to be under the cursor is a click nobody meant. The stage sets
              // `data-f03-complete` when the sequence finishes; until then the
              // anchor is inert but still focusable by keyboard, which does not
              // depend on where anything is on screen.
              <a
                href={link.href}
                aria-label={link.label}
                className="block h-full w-full"
              >
                {art}
              </a>
            ) : (
              art
            )}
          </div>
        );
      })}
    </div>
  );
}
