import { Section } from "@/components/Section";
import { PORTRAIT_IMAGE } from "@/lib/images";

const FACTS = [
  { value: "10+", label: "Years barbering" },
  { value: "Lagos", label: "Home visits across the mainland and island" },
  { value: "1", label: "Barber, every single booking" },
];

export function AboutFresco() {
  return (
    <Section id="about" tone="light">
      <div className="grid grid-cols-[minmax(0,1fr)_1.35fr] gap-x-3 gap-y-4 sm:grid-cols-[minmax(0,0.75fr)_1fr] sm:gap-x-8 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-x-12">
        <div className="relative col-start-1 row-start-2 self-stretch overflow-hidden rounded-xl sm:row-span-3 sm:row-start-1 sm:aspect-[3/4] sm:self-center lg:rounded-2xl">
          <img
            src={PORTRAIT_IMAGE}
            alt="Fresco, the barber behind Fresco Hairvolution"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="col-start-2 row-start-1">
          <p className="eyebrow mb-2 text-[9px] lg:mb-4 lg:text-xs">Meet your barber</p>
          <h2 className="caps text-lg leading-[1.05] font-semibold sm:text-2xl lg:text-4xl">
            About Fresco
          </h2>
        </div>

        <div className="col-start-2 row-start-2">
          <div className="max-w-prose space-y-3 text-[11px] leading-relaxed sm:space-y-4 sm:text-sm lg:space-y-5 lg:text-base">
            <p>
              Fresco is a seasoned barber with over 10 years of experience in the grooming industry,
              dedicated to helping men look sharp, feel confident, and leave every appointment
              feeling their best.
            </p>
            <p>
              With a passion for precision, style, and exceptional service, Fresco combines expert
              barbering with a premium grooming experience tailored to every client.
            </p>
            <p>
              From classic cuts to modern styles and personalized grooming, every detail is handled
              with care, skill, and a commitment to excellence.
            </p>
          </div>
        </div>

        <dl className="col-start-2 row-start-3 mt-4 grid grid-cols-3 gap-3 border-t border-foreground/15 pt-4 sm:mt-2 sm:gap-6 sm:pt-6 lg:mt-4 lg:gap-8 lg:pt-8">
          {FACTS.map((fact) => (
            <div key={fact.value}>
              <dt className="font-display text-sm font-semibold tracking-tight sm:text-lg lg:text-2xl">
                {fact.value}
              </dt>
              <dd className="mt-1 text-[9px] leading-relaxed text-muted-foreground sm:mt-2 sm:text-xs lg:text-sm">
                {fact.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
