import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/* `can-hover:` rather than a bare `hover:` — see globals.css. A tap matches
   `hover:` on a touchscreen and leaves the state stuck on the control. */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-[var(--foreground)] text-[var(--background)] can-hover:hover:opacity-90",
  secondary: "bg-[var(--surface)] text-[var(--foreground)] can-hover:hover:opacity-90",
  ghost: "bg-transparent text-[var(--foreground)] can-hover:hover:bg-[var(--surface)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-13 px-8 text-lg",
};

/** Reset button primitive. No brand styling yet — folds can extend via className. */
export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium",
        "transition-[background-color,opacity,transform] duration-300 ease-[cubic-bezier(0.625,0.05,0,1)]",
        "can-hover:hover:-translate-y-[1px] active:translate-y-0 motion-reduce:transition-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}
