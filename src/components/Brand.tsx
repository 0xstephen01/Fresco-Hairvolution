import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/uploads/img-6576.jpeg"
      alt="Fresco Hairvolution"
      className={cn("h-9 w-9 rounded-full object-cover ring-1 ring-white/25", className)}
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-sm leading-none font-semibold tracking-[0.14em] uppercase",
        className,
      )}
    >
      Fresco Hairvolution
    </span>
  );
}