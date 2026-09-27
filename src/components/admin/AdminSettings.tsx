import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDB, updateDB, remoteEnabled } from "@/lib/store";
import { navigate } from "@/lib/router";
import type { Settings } from "@/lib/types";

export function AdminSettings() {
  const db = useDB();
  const [form, setForm] = useState<Settings>(db.settings);
  const [pin, setPin] = useState(db.settings.ownerPin);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (pin.trim().length < 4) {
      toast.error("The PIN needs at least 4 characters.");
      return;
    }
    updateDB((draft) => {
      draft.settings = { ...form, ownerPin: pin.trim() };
    });
    toast.success("Settings saved. The site and booking form use them straight away.");
  }

  function resetDemo() {
    updateDB((draft) => {
      draft.bookings = [];
    });
    toast.success("Sample bookings cleared. Your services, areas and settings stay as they are.");
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold tracking-tight">Business details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Business name" htmlFor="biz-name">
            <Input
              id="biz-name"
              value={form.businessName}
              onChange={(e) => set("businessName", e.target.value)}
              className="h-11"
            />
          </Field>
          <Field label="Phone number" htmlFor="biz-phone" hint="Shown on the site for calls">
            <Input
              id="biz-phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="h-11"
            />
          </Field>
          <Field label="WhatsApp number" htmlFor="biz-wa" hint="International format, digits only, e.g. 2348032147788">
            <Input
              id="biz-wa"
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              className="h-11"
            />
          </Field>
          <Field label="Instagram handle" htmlFor="biz-ig" hint="Without the @">
            <Input
              id="biz-ig"
              value={form.instagram}
              onChange={(e) => set("instagram", e.target.value)}
              className="h-11"
            />
          </Field>
          <Field label="TikTok handle" htmlFor="biz-tt" hint="Without the @">
            <Input
              id="biz-tt"
              value={form.tiktok}
              onChange={(e) => set("tiktok", e.target.value)}
              className="h-11"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold tracking-tight">Words on the page</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The headline and promise at the top of the site, and the two notes customers read before they
          book.
        </p>
        <div className="mt-4 grid gap-4">
          <Field label="Hero headline" htmlFor="hero-h">
            <Input
              id="hero-h"
              value={form.heroHeadline}
              onChange={(e) => set("heroHeadline", e.target.value)}
              className="h-11"
            />
          </Field>
          <Field label="Hero promise" htmlFor="hero-s">
            <textarea
              id="hero-s"
              value={form.heroSubline}
              onChange={(e) => set("heroSubline", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </Field>
          <Field label="Call-out note" htmlFor="callout-note">
            <textarea
              id="callout-note"
              value={form.calloutNote}
              onChange={(e) => set("calloutNote", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </Field>
          <Field label="What Fresco brings" htmlFor="included">
            <textarea
              id="included"
              value={form.includedLine}
              onChange={(e) => set("includedLine", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold tracking-tight">Owner PIN</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {remoteEnabled
            ? "Your owner area is protected by your email and password login, so this PIN is not used. It stays here for the version of the site without a backend."
            : "Change it whenever you want. You sign in with it at /admin on this device."}
        </p>
        <div className="mt-4 max-w-xs">
          <Field label="New PIN" htmlFor="owner-pin">
            <Input
              id="owner-pin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="h-11"
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" className="h-11">
          Save settings
        </Button>
        <Button type="button" variant="outline" className="h-11" onClick={() => navigate("/")}>
          View the site
        </Button>
        {remoteEnabled ? null : (
          <Button
            type="button"
            variant="ghost"
            className="h-11 text-destructive hover:text-destructive"
            onClick={resetDemo}
          >
            Clear sample bookings
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}