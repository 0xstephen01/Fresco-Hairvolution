import { useState } from "react";
import { CalendarDays, Check, MessageCircle, Phone, UserX } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDB, setBookingStatus } from "@/lib/store";
import { formatDateLong, formatNaira, relativeLabel, todayISO, whatsappLink } from "@/lib/format";
import { quoteFor } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

type Filter = "today" | "upcoming" | "all" | BookingStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "new", label: "New" },
  { id: "confirmed", label: "Confirmed" },
  { id: "done", label: "Done" },
  { id: "all", label: "All" },
];

const STATUS_STYLE: Record<BookingStatus, string> = {
  new: "border-primary/40 bg-primary/10 text-primary",
  confirmed: "border-border bg-secondary text-secondary-foreground",
  done: "border-border bg-transparent text-muted-foreground",
};

/** Customer numbers are stored local-style (0803...); WhatsApp needs the country code. */
function customerNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
};

export function AdminBookings() {
  const db = useDB();
  const [filter, setFilter] = useState<Filter>("today");
  const today = todayISO();

  const sorted = [...db.bookings].sort((a, b) =>
    a.date === b.date ? a.slot.localeCompare(b.slot) : a.date.localeCompare(b.date),
  );

  const filtered = sorted.filter((b) => {
    if (filter === "today") return b.date === today;
    if (filter === "upcoming") return b.date > today;
    if (filter === "all") return true;
    return b.status === filter;
  });

  function setStatus(id: string, status: BookingStatus) {
    void setBookingStatus(id, status).catch(() => {
      toast.error("That change did not reach the server. Check your connection and try again.");
    });
    const labels: Record<BookingStatus, string> = {
      new: "moved back to new",
      confirmed: "confirmed",
      done: "marked done",
    };
    toast.success(`Booking ${labels[status]}.`);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "h-10 cursor-pointer rounded-full border px-4 text-sm transition-colors",
              filter === f.id
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {f.label}
            <span className="ml-1.5 text-xs text-muted-foreground">
              {f.id === "all"
                ? sorted.length
                : f.id === "today"
                  ? sorted.filter((b) => b.date === today).length
                  : f.id === "upcoming"
                    ? sorted.filter((b) => b.date > today).length
                    : sorted.filter((b) => b.status === f.id).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
          <CalendarDays className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-base font-medium">
            {filter === "today" ? "No bookings for today" : "Nothing in this list"}
          </p>
          <p className="mx-auto mt-2 max-w-prose text-sm text-muted-foreground">
            {filter === "today"
              ? "New requests appear here as soon as a customer fills the form on the site."
              : "Try another filter, or check the New list for requests waiting on your reply."}
          </p>
          <Button variant="outline" className="mt-5 h-11" onClick={() => setFilter("all")}>
            Show all bookings
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((booking) => {
            const quote = quoteFor(db, booking.serviceId, booking.addOnIds, "", booking.clients);
            const waMessage = `Hi ${booking.name.split(" ")[0]}, Fresco here about your home visit on ${formatDateLong(booking.date)} at ${booking.slot}.`;
            const customerWa = whatsappLink(customerNumber(booking.phone), waMessage);
            return (
              <li key={booking.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold tracking-tight">{booking.name}</h3>
                      <Badge variant="outline" className={cn("font-normal", STATUS_STYLE[booking.status])}>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {relativeLabel(booking.date)} · {booking.slot} · {booking.clients}{" "}
                      {booking.clients === 1 ? "person" : "people"}
                    </p>
                  </div>
                  <p className="font-display text-lg font-semibold text-primary">
                    {formatNaira(quote.serviceTotal + quote.extrasTotal)}
                  </p>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Service</dt>
                    <dd>
                      {quote.service?.name ?? "Service"}
                      {quote.addOns.length > 0 ? ` + ${quote.addOns.map((a) => a.name).join(", ")}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Phone</dt>
                    <dd className="flex items-center gap-2">
                      <a href={`tel:${booking.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                        {booking.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Address</dt>
                    <dd>
                      {booking.address}
                      {booking.landmark ? `, ${booking.landmark}` : ""} · {booking.area}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Notes</dt>
                    <dd className={booking.notes ? "" : "text-muted-foreground"}>
                      {booking.notes || "None"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button asChild size="sm" className="h-10">
                    <a href={customerWa} target="_blank" rel="noreferrer">
                      <MessageCircle />
                      Reply on WhatsApp
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-10">
                    <a href={`tel:${booking.phone.replace(/\s/g, "")}`}>
                      <Phone />
                      Call
                    </a>
                  </Button>
                  {booking.status === "new" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10"
                      onClick={() => setStatus(booking.id, "confirmed")}
                    >
                      <Check />
                      Confirm
                    </Button>
                  ) : null}
                  {booking.status !== "done" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10"
                      onClick={() => setStatus(booking.id, "done")}
                    >
                      Mark done
                    </Button>
                  ) : null}
                  {booking.status !== "new" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 text-destructive hover:text-destructive"
                      onClick={() => setStatus(booking.id, "new")}
                    >
                      <UserX />
                      Mark no-show
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}