import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { navigate, scrollToId } from "@/lib/router";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Simulation only: the hero rebuilt over the new photo with a black-to-white
    gradient. Reached at /preview and never linked from the live site. */
export function HeroPreview() {
  const reduce = useReducedMotion();

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden bg-black"
    >
      <motion.img
        src="/uploads/chatgpt-image-sep-26-2026-11-35-37-pm.png"
        alt="Fresco Hairvolution hero simulation"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_50%]"
        initial={reduce ? false : { scale: 1.06 }}
        animate={reduce ? undefined : { scale: 1 }}
        transition={{ duration: 18, ease: "easeOut" }}
      />

      {/* Black to white gradient across the frame: solid black behind the copy,
          clear through the middle so the subject reads, easing to white. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#000_0%,rgba(0,0,0,0.92)_26%,rgba(0,0,0,0.5)_46%,rgba(0,0,0,0)_62%,rgba(255,255,255,0.2)_82%,rgba(255,255,255,0.55)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-black/60 to-transparent"
      />

      <div className="relative w-full px-4 pt-20 pb-24 sm:px-6 sm:pt-24 sm:pb-8 md:pt-32 md:pb-16 lg:px-8 lg:pt-36 lg:pb-24">
        <div className="max-w-[48%] sm:max-w-[52%] md:max-w-[56%] lg:max-w-[50rem]">
          <motion.h1
            className="caps text-[13px] leading-[1.3] font-bold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-6xl"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            Precision grooming.
            <br />
            Timeless confidence.
          </motion.h1>

          <motion.p
            className="mt-4 max-w-xl text-[11px] leading-relaxed text-white/75 sm:mt-6 sm:text-base lg:text-lg"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
          >
            <span className="sm:hidden">
              Premium grooming for men who appreciate the details.
            </span>
            <span className="hidden sm:inline">
              Premium grooming for men who appreciate the details. Book Fresco and get precision, comfort and style in your own space.
            </span>
          </motion.p>

          <motion.div
            className="mt-7 flex flex-col items-start gap-5 sm:mt-9 sm:flex-row sm:items-center sm:gap-8"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: EASE }}
          >
            <Button
              size="lg"
              onClick={() => scrollToId("book")}
              className="group h-8 rounded-lg bg-white px-2.5 text-[10px] font-semibold tracking-[0.08em] text-neutral-950 uppercase transition-all duration-200 hover:-translate-y-px hover:bg-white/90 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black has-[>svg]:px-2.5 sm:h-12 sm:px-3.5 sm:text-sm sm:has-[>svg]:px-3.5"
            >
              Book now
              <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Simulation marker, so this page is never mistaken for the live site. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 px-4 pb-5 sm:px-6 lg:px-8">
        <span className="rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-[10px] font-medium tracking-[0.16em] text-white/80 uppercase backdrop-blur">
          Simulation · not published
        </span>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="cursor-pointer rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-[10px] font-medium tracking-[0.16em] text-white/80 uppercase backdrop-blur transition-colors hover:bg-black/70 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          Back to the live site
        </button>
      </div>
    </section>
  );
}
