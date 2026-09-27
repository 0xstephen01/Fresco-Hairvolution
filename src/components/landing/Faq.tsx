import { Band, SectionHead } from "@/components/Section";
import { useDB } from "@/lib/store";
import { whatsappLink } from "@/lib/format";

export function Faq() {
  const { settings, zones } = useDB();
  const covered = zones.filter((z) => z.active);
  const faqs = [
    {
      q: "How does a home visit actually work?",
      a: "You book a date and a two-hour arrival window, send your address and landmark, and Fresco confirms on WhatsApp with the call-out fee. He arrives with the full kit, cuts you at home, and you pay after the cut.",
    },
    {
      q: "What are the areas/zones covered?",
      a: "Fresco travels across Lagos mainland and island. Pick your zone when you book and the call-out is split with you.",
      zones: true,
    },
    {
      q: "What if my area is not on your list?",
      a: "Send a WhatsApp message with your street and area. If it falls in one of the nine zones, Fresco will quote the starting call-out fee for that zone, from ₦2,500 up to ₦20,000 and above for the farthest areas. If it is outside them, he will say so straight away.",
    },
    {
      q: "How much is the call-out fee?",
      a: "It depends on your zone. Zones 1 to 4 and Ikorodu are split 50/50, Zone 5 is 60/40, Zones 6 and 7 are 70/30, and Zone 8 is 80/20. Starting fees run from ₦5,000 in Zone 1 to ₦25,000 and above in Zone 8, so your share runs from ₦2,500 to ₦20,000 and above. The exact figure is confirmed on WhatsApp before he leaves so nothing is added at the door.",
    },
    {
      q: "Can I reschedule, and what if you are running late?",
      a: "Reschedule on WhatsApp up to two hours before your window at no cost. If Fresco is running late he messages you before the window starts. He does not squeeze in extra clients and keep you waiting.",
    },
    {
      q: "What should I have ready, and how do I pay?",
      a: "A chair, a socket for the clippers and water to rinse. Fresco brings the cape, towel and mirror. Payment is by transfer or cash after the cut, and his account details are sent to you in the confirmation.",
    },
    {
      q: "Can more than one person get a cut in the visit?",
      a: "Yes. Add the number of heads on the booking form. Each person pays the service price, but you only pay one call-out fee for the address. Family visits are usually booked on weekends.",
    },
  ];

  const wa = whatsappLink(settings.whatsapp, "Hi Fresco, I have a question about a home visit.");

  return (
    <Band
      id="faq"
      tone="light"
      className="py-16 sm:py-24"
      containerClassName="flex flex-1 flex-col justify-center"
    >
      <SectionHead
        eyebrow="Questions"
        title="faqs"
        lead={`Still unsure about something? Message on WhatsApp and Fresco replies himself, usually within the hour, between ${settings.hours[1].open} and ${settings.hours[6].close}.`}
      />
      <div className="mt-10 grid gap-x-16 lg:grid-cols-2">
        {faqs.map((faq) => (
          <details key={faq.q} className="group border-b border-foreground/15 py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-5 text-base font-semibold tracking-tight marker:hidden sm:text-lg">
                {faq.q}
                <span className="mt-0.5 text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">{faq.a}</p>
              {faq.zones ? (
                <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {covered.map((zone) => (
                    <li key={zone.id} className="text-sm">
                      <span className="font-medium">{zone.name}</span>
                      <span className="text-muted-foreground"> · {zone.areas.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </details>
          ))}
        </div>
        <p className="mt-10 max-w-prose text-sm text-muted-foreground">
          Bookings are taken up to 14 days ahead. Fresco works {settings.hours.filter((h) => !h.closed).length} days a
          week, and blocked-off days are shown when you pick a date.{" "}
          <a href={wa} target="_blank" rel="noreferrer" className="font-medium text-foreground underline underline-offset-4">
            Ask about a date on WhatsApp
          </a>
          .
        </p>
      </Band>
  );
}
