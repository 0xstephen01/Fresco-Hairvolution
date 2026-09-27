import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A full-bleed band. `tone="light"` remaps the design tokens locally so every
 * card, badge and button inside flips to the white editorial treatment.
 */
export function Band({
  id,
  tone = "dark",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  tone?: "dark" | "light";
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full md:flex md:min-h-screen md:flex-col md:justify-center",
        tone === "light" ? "band-light border-y border-black/10" : "bg-background",
        className,
      )}
    >
      <div
        className={cn(
          "w-full px-4 sm:px-6 lg:px-8",
          "md:flex md:flex-1 md:flex-col md:justify-center",
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function Section({
  id,
  tone = "dark",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  tone?: "dark" | "light";
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <Band
      id={id}
      tone={tone}
      className={cn("py-16 sm:py-24", className)}
      containerClassName={containerClassName}
    >
      {children}
    </Band>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  align = "left",
  size = "default",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  size?: "default" | "large";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <h2
        className={cn(
          "caps font-semibold leading-[1.05]",
          size === "large"
            ? "text-3xl sm:text-4xl lg:text-5xl"
            : "text-2xl sm:text-3xl lg:text-4xl",
        )}
      >
        {title}
      </h2>
      {lead ? <p className="mt-5 max-w-prose text-base leading-relaxed opacity-70">{lead}</p> : null}
    </div>
  );
}