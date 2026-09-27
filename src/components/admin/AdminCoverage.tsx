import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDB, updateDB } from "@/lib/store";
import { formatNaira, uniqueId } from "@/lib/format";
import { customerCallout, feeRangeLabel, customerRangeLabel } from "@/lib/pricing";
import type { CoverageZone } from "@/lib/types";

const emptyDraft = { name: "", areas: "", feeMin: 5000, feeMax: "", share: 50 };

export function AdminCoverage() {
  const db = useDB();
  const [draft, setDraft] = useState(emptyDraft);

  function patch(id: string, changes: Partial<CoverageZone>) {
    updateDB((d) => {
      const zone = d.zones.find((z) => z.id === id);
      if (zone) Object.assign(zone, changes);
    });
  }

  function remove(id: string, name: string) {
    updateDB((d) => {
      d.zones = d.zones.filter((z) => z.id !== id);
    });
    toast.success(`${name} removed from the coverage list.`);
  }

  function add(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.areas.trim()) {
      toast.error("Give the zone a name and at least one area.");
      return;
    }
    const min = Math.max(0, draft.feeMin || 0);
    const max = draft.feeMax.trim() === "" ? null : Math.max(0, Number(draft.feeMax) || 0);
    updateDB((d) => {
      d.zones.push({
        id: uniqueId("zone"),
        name: draft.name.trim(),
        areas: draft.areas.split(",").map((a) => a.trim()).filter(Boolean),
        feeMin: min,
        feeMax: max !== null && max >= min ? max : min,
        customerShare: draft.share / 100,
        active: true,
      });
    });
    toast.success(`${draft.name} added.`);
    setDraft(emptyDraft);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/30 bg-white/5 p-5">
        <h3 className="text-sm font-semibold tracking-tight">How the call-out works</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Each zone has a starting call-out range. The customer pays their share of it and you absorb
          the rest, so a Zone 1 visit at 50% costs the customer {formatNaira(2500)} of a{" "}
          {formatNaira(5000)} trip. The exact fee is confirmed on WhatsApp before the visit.
        </p>
      </div>

      <ul className="space-y-3">
        {db.zones.map((zone) => (
          <li key={zone.id} className="rounded-xl border border-border bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-[7rem_1fr_7rem_7rem_6rem_auto] sm:items-end">
              <div>
                <label className="text-xs text-muted-foreground">Zone</label>
                <Input
                  value={zone.name}
                  onChange={(e) => patch(zone.id, { name: e.target.value })}
                  className="mt-1 h-10 font-medium"
                  aria-label="Zone name"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Areas, comma separated</label>
                <Input
                  value={zone.areas.join(", ")}
                  onChange={(e) =>
                    patch(zone.id, {
                      areas: e.target.value.split(",").map((a) => a.trim()).filter(Boolean),
                    })
                  }
                  className="mt-1 h-10"
                  aria-label="Areas in this zone"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fee from ₦</label>
                <Input
                  type="number"
                  value={zone.feeMin}
                  min={0}
                  step={500}
                  onChange={(e) => patch(zone.id, { feeMin: Number(e.target.value) || 0 })}
                  className="mt-1 h-10"
                  aria-label="Starting call-out fee in naira"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fee up to ₦</label>
                <Input
                  type="number"
                  value={zone.feeMax ?? ""}
                  placeholder="open"
                  min={0}
                  step={500}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    patch(zone.id, { feeMax: raw === "" ? null : Number(raw) || 0 });
                  }}
                  className="mt-1 h-10"
                  aria-label="Top of the call-out range in naira, leave blank for open-ended"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Customer %</label>
                <Input
                  type="number"
                  value={Math.round(zone.customerShare * 100)}
                  min={0}
                  max={100}
                  step={10}
                  onChange={(e) =>
                    patch(zone.id, {
                      customerShare: Math.min(100, Math.max(0, Number(e.target.value) || 0)) / 100,
                    })
                  }
                  className="mt-1 h-10"
                  aria-label="Percentage of the call-out fee the customer pays"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={zone.active ? "secondary" : "outline"}
                  size="sm"
                  className="h-10"
                  onClick={() => patch(zone.id, { active: !zone.active })}
                >
                  {zone.active ? "Live" : "Hidden"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${zone.name}`}
                  onClick={() => remove(zone.id, zone.name)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Starting fee {feeRangeLabel(zone)} · customer pays {customerRangeLabel(zone)} · you
              absorb from {formatNaira(absorbedLow(zone))}
            </p>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="rounded-xl border border-dashed border-border p-4">
        <h3 className="text-sm font-semibold tracking-tight">Add a zone</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-[7rem_1fr_7rem_7rem_6rem_auto] sm:items-end">
          <div>
            <label className="text-xs text-muted-foreground">Zone</label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Zone 10"
              className="mt-1 h-10"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Areas, comma separated</label>
            <Input
              value={draft.areas}
              onChange={(e) => setDraft({ ...draft, areas: e.target.value })}
              placeholder="Ikorodu, Imota"
              className="mt-1 h-10"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Fee from ₦</label>
            <Input
              type="number"
              value={draft.feeMin}
              min={0}
              step={500}
              onChange={(e) => setDraft({ ...draft, feeMin: Number(e.target.value) || 0 })}
              className="mt-1 h-10"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Fee up to ₦</label>
            <Input
              type="number"
              value={draft.feeMax}
              placeholder="open"
              min={0}
              step={500}
              onChange={(e) => setDraft({ ...draft, feeMax: e.target.value })}
              className="mt-1 h-10"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Customer %</label>
            <Input
              type="number"
              value={draft.share}
              min={0}
              max={100}
              step={10}
              onChange={(e) => setDraft({ ...draft, share: Number(e.target.value) || 0 })}
              className="mt-1 h-10"
            />
          </div>
          <Button type="submit" className="h-10">
            <Plus />
            Add
          </Button>
        </div>
      </form>
    </div>
  );
}

/** What Fresco absorbs at the bottom of the range. */
function absorbedLow(zone: CoverageZone): number {
  return zone.feeMin - customerCallout(zone);
}
