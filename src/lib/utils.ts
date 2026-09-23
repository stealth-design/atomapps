type ClassValue = string | number | null | boolean | undefined | ClassValue[];

/** Joins truthy class names together, flattening nested arrays. */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const flatten = (input: ClassValue) => {
    if (!input) return;
    if (Array.isArray(input)) {
      input.forEach(flatten);
      return;
    }
    classes.push(String(input));
  };

  inputs.forEach(flatten);

  return classes.join(" ");
}

/**
 * Resolves one of the header's section anchors for the page it is shown on.
 *
 * The nav's targets are folds on the home page (`#fold-04`), which is where
 * they were written for. On any other route a bare hash points at an element
 * the page does not have, so the link does nothing — prefixing `/` sends it
 * home and to the fold in one step. Routes (`/contact`) pass through as is.
 */
export function navHref(href: string, pathname: string | null): string {
  if (!href.startsWith("#") || pathname === "/" || pathname === null) return href;
  return `/${href}`;
}
