/**
 * The shape of a form field, shared by the two forms on the site.
 *
 * Both sit on the same white card over the same sky, so they are the same
 * control: the reference's filled, borderless field. Kept here rather than in
 * either form so neither can drift from the other.
 */
export const FIELD =
  "w-full rounded-[10px] bg-[var(--surface)] px-[16px] text-[15px] leading-[20px] text-[var(--foreground)] " +
  "placeholder:text-[#9a9aa1] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#2774c1]";

export const LABEL =
  "block text-[14px] leading-[18px] font-medium text-[var(--foreground)]";

/** The filled pill both forms submit with. */
export const SUBMIT =
  "inline-flex h-[48px] items-center justify-center rounded-[10px] bg-[#2774c1] px-[32px] text-[15px] leading-[20px] font-medium text-white " +
  // `can-hover:` rather than a bare `hover:` — see globals.css. A tap on a
  // phone matches `hover:` too, and the state then sticks on the button until
  // something else is touched.
  "transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.625,0.05,0,1)] can-hover:hover:-translate-y-[2px] can-hover:hover:bg-[#1f63a8] " +
  "active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2774c1] " +
  "motion-reduce:transition-none motion-reduce:can-hover:hover:translate-y-0";
