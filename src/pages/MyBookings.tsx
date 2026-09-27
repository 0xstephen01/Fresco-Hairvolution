import { useState } from "react";
import { Calendar, Clock, MapPin, MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Section, SectionHead } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDB, lookupBookings, cancelOwnBooking } from "@/lib/store";
import { formatDateLong, formatNaira, whatsappLink } from "@/lib/format";
import { quoteFor } from "@/lib/pricing";
import { navigate } from "@/lib/router";
import type { Booking, BookingStatus } from "@/lib/types";

const STATUS_LABEL: Record<BookingStatus, string> = {
  new: "Awaiting confirmation",
  confirmed: "Confirmed",
  done: "Completed",
};

export function MyBookings() {
  const db = useDB();
  const [phone, setPhone] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Booking[]>([]);
  const [searching, setSearching] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const digits = (value: string) => value.replace(/\D/g, "").slice(-10);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    if (digits(phone).length < 10) {
      toast.error("Enter the phone number you booked with, like 0803 123 4567.");
      return;
    }
    setSearching(true);
    try {
      const found = await lookupBookings(phone);
      setResults(found);
      setQuery(phone);
    } catch {
      toast.error("Could not reach the booking list. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  async function cancelBooking() {
    if (!cancelTarget) return;
    try {
      await cancelOwnBooking(cancelTarget.id, cancelTarget.phone);
      setResults((prev) => prev.filter((b) => b.id !== cancelTarget.id));
      toast.success("Booking cancelled. Fresco has been told the slot is free.");
    } catch {
      toast.error("That did not go through. Message Fresco on WhatsApp and he will cancel it.");
    }
    setCancelTarget(null);
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-28 sm:px-6 sm:pt-32 lg:px-8">
      <SectionHead
        eyebrow="My bookings"
        title="Look up a home visit"
        lead="Enter the phone number you booked with and your visits will appear with their status."
      />

      <form onSubmit={search} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="lookup" className="text-sm font-medium">
            Phone number
          </label>
          <Input
            id="lookup"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0803 123 4567"
            inputMode="tel"
            className="mt-2 h-11"
          />
        </div>
        <Button type="submit" className="mt-0 h-11 sm:mt-7" disabled={searching}>
          <Search />
          {searching ? "Looking…" : "Find my booking"}
        </Button>
      </form>

      <div className="mt-10 pb-16">
        {!query ? (
          <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
            <p className="text-base font-medium">No number entered yet</p>
            <p className="mx-auto mt-2 max-w-prose text-sm text-muted-foreground">
              Type the number you used when booking and your visits will appear here with their status.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
            <p className="text-base font-medium">No bookings found for {query}</p>
            <p className="mx-auto mt-2 max-w-prose text-sm text-muted-foreground">
              Check the number, or message Fresco on WhatsApp with your name and address and he will find
              it for you.
            </p>
            <Button asChild variant="outline" className="mt-5 h-11">
              <a
                href={whatsappLink(db.settings.whatsapp, `Hi Fresco, I booked with ${query}. Please help me find my booking.`)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle />
                Message Fresco
              </a>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {results.map((booking) => {
              const quote = quoteFor(db, booking.serviceId, booking.addOnIds, "", booking.clients);
              return (
                <li key={booking.id} className="rounded-xl border border-white/12 bg-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="caps text-base font-semibold tracking-[0.08em]">
                        {quote.service?.name ?? "Home visit"}
                        {booking.clients > 1 ? ` × ${booking.clients}` : ""}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Reference {booking.id.toUpperCase()}
                      </p>
                    </div>
                    <Badge
                      variant={booking.status === "new" ? "secondary" : "default"}
                      className="font-normal"
                    >
                      {STATUS_LABEL[booking.status]}
                    </Badge>
                  </div>

                  <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                    <div className="flex gap-2">
                      <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <dt className="text-xs text-muted-foreground">Date</dt>
                        <dd>{formatDateLong(booking.date)}</dd>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <dt className="text-xs text-muted-foreground">Window</dt>
                        <dd>{booking.slot}</dd>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <dt className="text-xs text-muted-foreground">Address</dt>
                        <dd>
                          {booking.address}, {booking.area}
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <p className="text-sm">
                      Services: <span className="font-semibold">{formatNaira(quote.serviceTotal + quote.extrasTotal)}</span>
                      <span className="text-muted-foreground"> + call-out confirmed on WhatsApp</span>
                    </p>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="h-10">
                        <a
                          href={whatsappLink(
                            db.settings.whatsapp,
                            `Hi Fresco, about booking ${booking.id.toUpperCase()} on ${formatDateLong(booking.date)} at ${booking.slot}.`,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle />
                          WhatsApp
                        </a>
                      </Button>
                      {booking.status !== "done" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 text-destructive hover:text-destructive"
                          onClick={() => setCancelTarget(booking)}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-10 rounded-xl border border-white/12 bg-card/60 p-6">
          <h2 className="caps text-sm font-semibold tracking-[0.12em]">Need another slot?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Book a fresh home visit and Fresco will confirm it on WhatsApp.
          </p>
          <Button className="mt-4 h-11" onClick={() => navigate("/")}>
            Back to booking
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this home visit?</DialogTitle>
            <DialogDescription>
              {cancelTarget
                ? `${formatDateLong(cancelTarget.date)} at ${cancelTarget.slot}. The slot goes back to Fresco's day, so tell him early if you change your mind.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="h-11">
                Keep my booking
              </Button>
            </DialogClose>
            <Button variant="destructive" className="h-11" onClick={cancelBooking}>
              Yes, cancel it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}