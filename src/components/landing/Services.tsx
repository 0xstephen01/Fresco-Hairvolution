import { Clock } from "lucide-react";
import { Section, SectionHead } from "@/components/Section";
import { Badge } from "@/components/ui/badge";
import { useDB } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import { serviceImage } from "@/lib/images";
import { CATEGORIES, type Category } from "@/lib/types";

const CATEGORY_LEAD: Record<Category, string> = {
  Cuts: "Clipper work, finished with a line-up.",
  Kids: "Ages 12 and under. ",
  Extras: "Add to any cut if your hair needs the extra work.",
};

export function Services() {
  const { services } = useDB();
  const active = services.filter((s) => s.active);

  return (
    <Section id="services">
      <SectionHead
        eyebrow="Services & prices"
        title="Every price is for a cut at your home"
        lead="Prices below cover the work, not the travel. The call-out fee for your area is added and agreed on WhatsApp before Fresco leaves."
        size="large"
      />

      <div className="mt-14 space-y-16">
        {CATEGORIES.map((category) => {
          const items = active.filter((s) => s.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <div className="flex flex-col gap-2 border-b border-white/15 pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <h3 className="caps text-xl font-semibold tracking-tight sm:text-2xl">{category}</h3>
                <p className="text-sm text-muted-foreground">{CATEGORY_LEAD[category]}</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((service) => {
                  const named = service.name.trim().length > 0;
                  return (
                  <article
                    key={service.id}
                    className="group flex flex-col overflow-hidden rounded-xl border border-white/12 bg-card transition-colors hover:border-white/30"
                  >
                    <img
                      src={serviceImage(service.id)}
                      alt={named ? service.name : "Service photo"}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="caps text-sm font-semibold tracking-[0.06em]">
                          {named ? service.name : "New service"}
                        </h4>
                        <span className="font-display text-lg font-semibold whitespace-nowrap">
                          {service.price > 0 ? formatNaira(service.price) : "Price on request"}
                        </span>
                      </div>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {service.description.trim() ||
                          "Details coming soon. Ask Fresco about this one when you book."}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="gap-1 font-normal">
                          <Clock className="size-3" />
                          {service.minutes} min
                        </Badge>
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}