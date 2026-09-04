import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "footer";
}

/** Centers content and applies the shared max-width + responsive gutters. */
export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-[var(--content-max-width)] px-[var(--content-padding)]", className)}
    >
      {children}
    </Tag>
  );
}
