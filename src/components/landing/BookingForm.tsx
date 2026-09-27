import { useMemo, useState } from "react";
import { Calendar, Check, Clock, MapPin, MessageCircle, Scissors, Users } from "lucide-react";
import { toast } from "sonner";
import { Section, SectionHead } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDB, submitBooking } from "@/lib/store";
import {
  dayLabel,
  formatDateLong,
  formatNaira,
  nextDays,
  slotsForDate,
  todayISO,
  uniqueId,
  whatsappLink,
} from "@/lib/format";
import { quoteFor, customerRangeLabel } from "@/lib/pricing";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";
import { serviceImage } from "@/lib/images";
import type { Booking } from "@/lib/types";

const emptyForm = {
  name: "",
  phone: "",
  serviceId: "",
  addOnIds: [] as string[],
  date: todayISO(),
  slot: "",
  address: "",
  areaId: "",
  landmark: "",
  clients: 1,
  notes: "",
};

export function BookingForm() {
  const db = useDB();
  const { services, zones, blackouts, settings } = db;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const named = (s: { name: string }) => s.name.trim().length > 0;
  const bookableServices = services.filter((s) => s.active && s.category !== "Extras" && named(s));
  const addOns = services.filter((s) => s.active && s.category === "Extras" && named(s));
  const activeZones = zones.filter((z) => z.active);
  const days = useMemo(() => nextDays(14), []);
  const blackoutDates = blackouts.map((b) => b.date);
  const quote = quoteFor(db, form.serviceId, form.addOnIds, form.areaId, form.clients);
  const slots = form.date ? slotsForDate(form.date, settings) : [];
  const blackout = blackouts.find((b) => b.date === form.date);

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function toggleAddOn(id: string) {
    setForm((prev) => ({
      ...prev,
      addOnIds: prev.addOnIds.includes(id)
        ? prev.addOnIds.filter((a) => a !== id)
        : [...prev.addOnIds, id],
    }));
  }

  function pickDate(date: string) {
    setForm((prev) => ({ ...prev, date, slot: "" }));
    setErrors((prev) => ({ ...prev, date: "", slot: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Enter the name Fresco should ask for.";
    if (form.phone.replace(/\D/g, "").length < 10)
      next.phone = "Enter a phone number he can call, like 0803 123 4567.";
    if (!form.serviceId) next.serviceId = "Choose the service you want.";
    if (!form.date) next.date = "Pick a date.";
    if (!form.slot) next.slot = "Pick an arrival window.";
    if (!form.address.trim()) next.address = "Enter your street and house number.";
    if (!form.areaId) next.areaId = "Choose your area so the call-out fee is right.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) {
      toast.error("Some details are missing. Check the fields in red.");
      return;
    }
    setSaving(true);
    const booking: Booking = {
      id: uniqueId("bk"),
      name: form.name.trim(),
      phone: form.phone.trim(),
      serviceId: form.serviceId,
      addOnIds: form.addOnIds,
      date: form.date,
      slot: form.slot,
      address: form.address.trim(),
      area: quote.zoneName,
      landmark: form.landmark.trim(),
      clients: form.clients,
      notes: form.notes.trim(),
      status: "new",
      createdAt: todayISO(),
    };
    window.setTimeout(() => {
      void submitBooking(booking)
        .catch(() => {
          toast.error("Saved on this device, but the request did not reach Fresco. Send it on WhatsApp too.");
        })
        .finally(() => {
          setSaving(false);
          setForm(emptyForm);
          toast.success("Booking request sent. Fresco confirms it on WhatsApp.");
          navigate(`/booking/${booking.id}`);
        });
    }, 400);
  }

  return (
    <Section id="book" className="border-y border-white/10 bg-card/30">
      <SectionHead
        eyebrow="Book a home visit"
        title="Request a slot in under a minute"
        lead="Fill this in and Fresco confirms on WhatsApp with the call-out fee for your area. Nothing is charged here, you pay after the cut."
      />

      <form onSubmit={submit} className="mt-12 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]">
        <div className="min-w-0 space-y-6">
          {/* Step 1: service */}
          <fieldset className="min-w-0 rounded-xl border border-white/12 bg-card p-6">
            <legend className="px-1 caps text-xs font-semibold tracking-[0.12em] text-muted-foreground">
              1. What do you want done?
            </legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {bookableServices.map((service) => {
                const selected = form.serviceId === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => set("serviceId", service.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40 hover:bg-accent/40",
                    )}
                  >
                    <img
                      src={serviceImage(service.id)}
                      alt=""
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{service.name}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {service.minutes} min
                        <span className="text-primary">{formatNaira(service.price)}</span>
                      </span>
                    </span>
                    {selected ? <Check className="size-4 shrink-0 text-primary" /> : null}
                  </button>
                );
              })}
            </div>
            {errors.serviceId ? (
              <p className="mt-2 text-sm text-destructive">{errors.serviceId}</p>
            ) : null}

            {addOns.length > 0 ? (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-medium">Add-ons, optional</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {addOns.map((addOn) => {
                    const selected = form.addOnIds.includes(addOn.id);
                    return (
                      <button
                        key={addOn.id}
                        type="button"
                        onClick={() => toggleAddOn(addOn.id)}
                        aria-pressed={selected}
                        className={cn(
                          "h-10 cursor-pointer rounded-full border px-4 text-sm transition-colors",
                          selected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        {addOn.name} · {formatNaira(addOn.price)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </fieldset>

          {/* Step 2: date and slot */}
          <fieldset className="min-w-0 rounded-xl border border-white/12 bg-card p-6">
            <legend className="px-1 caps text-xs font-semibold tracking-[0.12em] text-muted-foreground">
              2. When should he come?
            </legend>
            <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
              {days.map((day) => {
                const blocked = blackoutDates.includes(day);
                const selected = form.date === day;
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={blocked}
                    onClick={() => pickDate(day)}
                    aria-pressed={selected}
                    className={cn(
                      "h-16 w-16 shrink-0 cursor-pointer rounded-lg border text-xs transition-colors",
                      blocked
                        ? "cursor-not-allowed border-border/60 text-muted-foreground/50 line-through"
                        : selected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    <span className="block font-semibold">{dayLabel(day)}</span>
                    <span className="mt-1 block">{day.slice(8)}/{day.slice(5, 7)}</span>
                  </button>
                );
              })}
            </div>
            {errors.date ? <p className="mt-2 text-sm text-destructive">{errors.date}</p> : null}
            {blackout ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Fresco is off on {formatDateLong(blackout.date)}: {blackout.reason}.
              </p>
            ) : null}

            <p className="mt-5 text-sm font-medium">Arrival window</p>
            <p className="text-xs text-muted-foreground">
              Two-hour window. He messages you when he is on the way.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {slots.length === 0 ? (
                <p className="col-span-full text-sm text-muted-foreground">
                  Fresco does not work on this date. Pick another day.
                </p>
              ) : (
                slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => set("slot", slot)}
                    aria-pressed={form.slot === slot}
                    className={cn(
                      "h-11 cursor-pointer rounded-lg border text-sm transition-colors",
                      form.slot === slot
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {slot}
                  </button>
                ))
              )}
            </div>
            {errors.slot ? <p className="mt-2 text-sm text-destructive">{errors.slot}</p> : null}
          </fieldset>

          {/* Step 3: address and details */}
          <fieldset className="min-w-0 rounded-xl border border-white/12 bg-card p-6">
            <legend className="px-1 caps text-xs font-semibold tracking-[0.12em] text-muted-foreground">
              3. Where is he cutting?
            </legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name} htmlFor="name">
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Chidi Okonkwo"
                  className="h-11"
                  aria-invalid={Boolean(errors.name)}
                />
              </Field>
              <Field label="Phone number" error={errors.phone} htmlFor="phone" hint="Used for calls and WhatsApp">
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="0803 123 4567"
                  inputMode="tel"
                  className="h-11"
                  aria-invalid={Boolean(errors.phone)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Home address" error={errors.address} htmlFor="address" hint="Street, house number and floor">
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="12 Admiralty Way, Flat 3"
                    className="h-11"
                    aria-invalid={Boolean(errors.address)}
                  />
                </Field>
              </div>
              <Field label="Your zone" error={errors.areaId} htmlFor="area" hint="Sets the call-out fee">
                <select
                  id="area"
                  value={form.areaId}
                  onChange={(e) => set("areaId", e.target.value)}
                  aria-invalid={Boolean(errors.areaId)}
                  className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="">Choose your zone</option>
                  {activeZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} · {zone.areas.slice(0, 3).join(", ")}
                      {zone.areas.length > 3 ? "…" : ""} · {customerRangeLabel(zone)} call-out
                    </option>
                  ))}
                  <option value="other">My area is not listed</option>
                </select>
              </Field>
              <Field label="Nearest landmark" htmlFor="landmark" hint="Helps him find the gate">
                <Input
                  id="landmark"
                  value={form.landmark}
                  onChange={(e) => set("landmark", e.target.value)}
                  placeholder="Beside Ebeano supermarket"
                  className="h-11"
                />
              </Field>
              <Field label="How many people are getting a cut?" htmlFor="clients" hint="One call-out fee per address">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-11"
                    onClick={() => set("clients", Math.max(1, form.clients - 1))}
                    aria-label="Fewer people"
                  >
                    −
                  </Button>
                  <span className="flex h-11 w-14 items-center justify-center rounded-lg border border-border text-sm">
                    {form.clients}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-11"
                    onClick={() => set("clients", Math.min(6, form.clients + 1))}
                    aria-label="More people"
                  >
                    +
                  </Button>
                </div>
              </Field>
              <Field label="Notes for Fresco" htmlFor="notes" hint="Optional: hair length, gate code, pet on the compound">
                <Input
                  id="notes"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Please come through the back gate"
                  className="h-11"
                />
              </Field>
            </div>
          </fieldset>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="min-w-0 rounded-xl border border-white/12 bg-card p-6">
            <h3 className="caps text-base font-semibold tracking-[0.1em]">Your visit</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Service">
                {quote.service ? quote.service.name : "Not chosen yet"}
              </Row>
              {quote.addOns.length > 0 ? (
                <Row label="Add-ons">{quote.addOns.map((a) => a.name).join(", ")}</Row>
              ) : null}
              <Row label="People">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5 text-muted-foreground" />
                  {quote.clients}
                </span>
              </Row>
              <Row label="Date">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  {form.date ? formatDateLong(form.date) : "Not picked"}
                </span>
              </Row>
              <Row label="Window">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {form.slot || "Not picked"}
                </span>
              </Row>
              <Row label="Zone">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  {quote.zoneName || "Not picked"}
                </span>
              </Row>
            </dl>

            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <Row label="Services on the day">{formatNaira(quote.serviceTotal + quote.extrasTotal)}</Row>
              <Row label="Call-out fee">
                {quote.zoneName ? (
                  <span>
                    from {formatNaira(quote.calloutFee)}
                    {quote.absorbed > 0 ? (
                      <span className="text-xs text-muted-foreground"> · Fresco pays {formatNaira(quote.absorbed)}</span>
                    ) : null}
                  </span>
                ) : (
                  "Confirmed on WhatsApp"
                )}
              </Row>
            </div>

            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Estimated total</span>
              <span className="font-display text-xl font-semibold">
                from {formatNaira(quote.total)}
              </span>
            </div>

            <Button type="submit" size="lg" disabled={saving} className="mt-5 h-12 w-full">
              {saving ? (
                "Sending request…"
              ) : (
                <>
                  <Scissors />
                  Request this slot
                </>
              )}
            </Button>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              No payment now. Fresco replies on WhatsApp to confirm the slot, the address and the exact
              call-out fee.
            </p>
            <Button asChild variant="ghost" className="mt-2 h-11 w-full">
              <a
                href={whatsappLink(settings.whatsapp, "Hi Fresco, I would like to book a home visit.")}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle />
                Or message on WhatsApp
              </a>
            </Button>
          </div>
        </aside>
      </form>
    </Section>
  );
}

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}