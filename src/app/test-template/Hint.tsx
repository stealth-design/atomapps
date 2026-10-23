/**
 * "See how it works" under a hero's controls: it fades in on load, stays
 * 5s, then fades out for good. By default it hangs centred under its
 * parent, which must be positioned; pass `className` to place it yourself.
 * Hidden from screen readers — the controls carry their own labels.
 */
export function Hint({ className = "absolute top-full left-1/2 mt-2 -translate-x-1/2" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none block w-max text-[12px] font-medium text-black/55 opacity-0 transition-colors group-data-[dark=true]/hero:text-white/60 animate-[tt-hint_5.8s_ease_forwards] ${className}`}
    >
      <style>{`@keyframes tt-hint{0%{opacity:0;transform:translateY(-4px)}7%,93%{opacity:1;transform:none}100%{opacity:0}}`}</style>
      See how it works
    </span>
  );
}
