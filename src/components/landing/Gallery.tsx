import { ArrowRight } from "lucide-react";
import { Band, SectionHead } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { scrollToId } from "@/lib/router";

type Shot = {
  src: string;
  label: string;
  note: string;
  wide?: boolean;
};

const SHOTS: Shot[] = [
  {
    src: "/uploads/cut-skin-fade.jpg",
    label: "Skin fade",
    note: "Cut down to the skin, blended clean",
  },
  {
    src: "/uploads/cut-taper-fade.jpg",
    label: "Taper Fade ",
    note: "Short at the sides, length kept on top",
  },
  {
    src: "/uploads/cut-kids-fade.jpg",
    label: "Kids fade",
    note: "Patient hands, quiet clippers",
  },
  {
    src: "/uploads/cut-afro-trim.jpg",
    label: "drop fade",
    note: "Shape held, ends tidied",
  },
  {
    src: "/uploads/cut-low-cut.jpg",
    label: "mohawk",
    note: "Low sides, fuller top",
  },
  {
    src: "/uploads/kids-cut-line.jpg",
    label: "TAPER FADE",
    note: "Side trims, full hair",
  },
  {
    src: "/uploads/cut-hair-dye.jpg",
    label: "skin fade",
    note: "Grey covered, natural finish",
  },
  {
    src: "/uploads/cut-beard-sculpt.jpg",
    label: "HAIR DESIGN",
    note: "Edges sharpened, length shaped",
  },
  {
    src: "/uploads/beard-clean-shave.jpg",
    label: "TAPER FADE",
    note: "Low taper, high length",
  },
  {
    src: "/uploads/img-9091.jpg",
    label: "taper fade",
    note: "Taper Fade on low cut",
  },
  {
    src: "/uploads/combo-cut-beard.jpg",
    label: "Mohawk",
    note: "Low sides, fuller top",
  },
  {
    src: "/uploads/combo-full.jpg",
    label: "fade and hair design",
    note: "Fade and hair design",
  },
];

export function Gallery() {
  return (
    <Band id="gallery" tone="light" className="py-16 sm:py-24">
      <SectionHead
        eyebrow="Recent work"
        title="GALLERY"
        lead="Clean cuts, done at the comfort of wherever you are "
        size="large"
      />

      <div className="mt-12 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {SHOTS.map((shot, index) => (
          <figure
            key={`${shot.label}-${index}`}
            className={
              shot.wide
                ? "group relative col-span-2 overflow-hidden rounded-xl"
                : "group relative overflow-hidden rounded-xl"
            }
          >
            <img
              src={shot.src}
              alt={shot.label}
              className={
                shot.wide
                  ? "aspect-[2/1] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  : "aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              }
              loading="lazy"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pt-10 pb-3">
              <span className="block text-[11px] font-semibold tracking-[0.14em] text-white uppercase">
                {shot.label}
              </span>
              <span className="mt-0.5 block text-xs text-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {shot.note}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Photos of recent visits go up here as they are taken. If you want a cut you have seen
          here, name it when you book.
        </p>
        <Button
          onClick={() => scrollToId("book")}
          className="h-11 w-full rounded-lg sm:w-auto"
        >
          Book a home visit
          <ArrowRight />
        </Button>
      </div>
    </Band>
  );
}