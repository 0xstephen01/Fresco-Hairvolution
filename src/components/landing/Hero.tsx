import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HERO_SHOP_IMAGE } from "@/lib/images";
import { scrollToId } from "@/lib/router";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[50svh] w-full items-center overflow-hidden bg-black md:min-h-screen md:max-h-none"
    >
      {/* Backdrop: the uploaded Fresco photo, in the right half at every width.
          The mask fades the photo's own left edge so it meets the black copy
          half without a seam. Slow drift so it feels alive, anchored right so
          the zoom never eats the right edge of the frame. */}
      <motion.img
        src={HERO_SHOP_IMAGE}
        alt="Fresco Hairvolution barber wearing a branded cape"
        className="absolute inset-y-0 right-0 -z-20 h-full w-1/2 object-cover object-[50%_78%] [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.55)_5%,rgba(0,0,0,0.9)_12%,black_22%)]"
        style={{ transformOrigin: "100% 50%" }}
        initial={reduce ? false : { scale: 1.06 }}
        animate={reduce ? undefined : { scale: 1 }}
        transition={{ duration: 18, ease: "easeOut" }}
      />

      {/* Dark wash so the type always holds contrast, plus a soft vignette.
          The photo starts at the halfway line, so the gradient is solid black
          across the copy half and eases to clear just past 50%, which is what
          makes the two halves meet without a seam. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#000_0%,#000_50%,rgba(0,0,0,0.8)_58%,rgba(0,0,0,0.5)_68%,rgba(0,0,0,0.18)_78%,rgba(0,0,0,0)_88%)] md:bg-[linear-gradient(to_right,#000_0%,#000_50%,rgba(0,0,0,0.55)_56%,rgba(0,0,0,0.18)_64%,rgba(0,0,0,0)_74%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-20 bg-gradient-to-b from-black/70 via-black/35 to-transparent sm:h-24"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/30 via-transparent to-black/40"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(130% 95% at 50% 45%, transparent 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Content sits left, vertically centred, with room for the fixed nav above. */}
      <div className="relative w-full px-4 pt-20 pb-20 sm:px-6 sm:pt-24 sm:pb-8 md:pt-32 md:pb-16 lg:px-8 lg:pt-36 lg:pb-24">
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
    </section>
  );
}
