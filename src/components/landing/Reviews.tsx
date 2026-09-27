import { Star } from "lucide-react";
import { Section, SectionHead } from "@/components/Section";
import { useDB } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Reviews() {
  const { reviews } = useDB();

  if (reviews.length === 0) {
    return (
      <Section id="reviews">
        <SectionHead
          eyebrow="Reviews"
          title="Reviews from clients"
          lead="No reviews yet. After your visit, send Fresco a line on WhatsApp and it goes up here."
        />
      </Section>
    );
  }

  return (
    <Section id="reviews">
      <SectionHead
        eyebrow="Reviews"
        title="What clients say after the cut"
        lead="Short lines from people who booked a home visit, with their area and rating."
        size="large"
      />

      <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-12 sm:gap-4">
        {reviews.map((review) => (
          <figure
            key={review.id}
            className="flex flex-col rounded-lg border border-white/12 bg-card p-2.5 sm:rounded-xl sm:p-6"
          >
            <div className="flex gap-0.5 sm:gap-1" aria-label={`${review.rating} out of 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn(
                    "size-2.5 sm:size-4",
                    n <= review.rating ? "fill-foreground text-foreground" : "text-muted-foreground/40",
                  )}
                />
              ))}
            </div>
            <blockquote className="mt-2 flex-1 text-[10px] leading-snug sm:mt-5 sm:text-base sm:leading-relaxed">
              "{review.quote}"
            </blockquote>
            <figcaption className="mt-2 border-t border-white/10 pt-1.5 text-[8px] tracking-[0.06em] text-muted-foreground uppercase sm:mt-5 sm:pt-4 sm:text-xs sm:tracking-[0.12em]">
              {review.firstName} · {review.area}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}