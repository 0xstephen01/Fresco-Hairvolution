import { Calendar, CheckCircle2, Clock, MapPin, MessageCircle, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDB } from "@/lib/store";
import { formatDateLong, formatNaira, whatsappLink } from "@/lib/format";
import { quoteFor, bookingSummaryText } from "@/lib/pricing";
import { navigate } from "@/lib/router";

export function BookingConfirmed({ bookingId }: { bookingId: string }) {
  const db = useDB();
  const booking = db.bookings.find((b) => b.id === bookingId);

  if (!booking) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="caps text-2xl font-semibold sm:text-3xl">Booking not found</h1>
        <p className="mx-auto mt-3 max-w-prose text-base text-muted-foreground">
          That booking is not on this device. Look it up with the phone number you booked with, or send
          Fresco a message and he will find it.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button className="h-11" onClick={() => navigate("/my-bookings")}>
            Look up my booking
          </Button>
          <Button asChild variant="outline" className="h-11">
            <a href={whatsappLink(db.settings.whatsapp, "Hi Fresco, I booked a home visit.")} target="_blank" rel="noreferrer">
              <MessageCircle />
              WhatsApp Fresco
            </a>
          </Button>
        </div>
      </main>
    );
  }

  const quote = quoteFor(db, booking.serviceId, booking.addOnIds, "", booking.clients);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-28 pb-12 sm:px-6 sm:pt-32 sm:pb-16 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-white/10 text-foreground">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="eyebrow mt-5">Request received</p>
        <h1 className="caps mt-3 text-3xl font-semibold sm:text-4xl">
          Your slot is sent to Fresco
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
          Fresco confirms on WhatsApp, usually within the hour of your message. Keep this page or take a
          screenshot of the details below.
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-white/12 bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-xs text-muted-foreground">Booking reference</p>
            <p className="font-display text-lg font-semibold tracking-[0.1em]">{booking.id.toUpperCase()}</p>
          </div>
          <Badge variant="secondary" className="font-normal">
            {booking.status === "new" ? "Awaiting confirmation" : booking.status}
          </Badge>
        </div>

        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <Item icon={Calendar} label="Date" value={formatDateLong(booking.date)} />
          <Item icon={Clock} label="Arrival window" value={booking.slot} />
          <Item icon={MapPin} label="Address" value={`${booking.address}${booking.landmark ? `, ${booking.landmark}` : ""}`} />
          <Item icon={Users} label="Area" value={booking.area} />
        </dl>

        <div className="mt-6 border-t border-border pt-5">
          <h2 className="caps text-sm font-semibold tracking-[0.12em]">What is booked</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between gap-4">
              <span>
                {quote.service?.name ?? "Service"}
                {booking.clients > 1 ? ` × ${booking.clients} people` : ""}
              </span>
              <span className="whitespace-nowrap">{formatNaira(quote.serviceTotal)}</span>
            </li>
            {quote.addOns.map((addOn) => (
              <li key={addOn.id} className="flex justify-between gap-4 text-muted-foreground">
                <span>{addOn.name}</span>
                <span className="whitespace-nowrap">{formatNaira(addOn.price)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-4 text-muted-foreground">
              <span>Call-out fee to {booking.area}</span>
              <span className="text-right">Confirmed on WhatsApp</span>
            </li>
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Services on the day</span>
            <span className="font-display text-xl font-semibold">
              {formatNaira(quote.serviceTotal + quote.extrasTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/12 bg-card/60 p-6">
        <h2 className="caps text-sm font-semibold tracking-[0.12em]">Travel fee and payment</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The call-out fee for {booking.area} is added to the total and confirmed on WhatsApp before
          Fresco leaves. Pay by transfer or cash after the cut. Nothing is charged here.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-white/12 bg-card/60 p-6">
        <h2 className="caps text-sm font-semibold tracking-[0.12em]">Save these details</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Screenshot this page, or open My bookings and look it up with {booking.phone}. Reschedule on
          WhatsApp up to two hours before your window at no cost.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="h-12 sm:h-11">
          <a
            href={whatsappLink(db.settings.whatsapp, bookingSummaryText(db, booking))}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle />
            Send details on WhatsApp
          </a>
        </Button>
        <Button variant="outline" size="lg" className="h-12 sm:h-11" onClick={() => navigate("/my-bookings")}>
          My bookings
        </Button>
        <Button asChild variant="ghost" size="lg" className="h-12 sm:h-11">
          <a href={`tel:${db.settings.phone.replace(/\s/g, "")}`}>
            <Phone />
            Call {db.settings.phone}
          </a>
        </Button>
      </div>
    </main>
  );
}

function Item({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm">{value}</dd>
      </div>
    </div>
  );
}