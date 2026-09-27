import { useState } from "react";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDB, updateDB } from "@/lib/store";
import { formatDateLong, todayISO } from "@/lib/format";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AdminSchedule() {
  const db = useDB();
  const [draft, setDraft] = useState({ date: todayISO(), reason: "" });

  function patchHours(index: number, changes: Partial<(typeof db.settings.hours)[number]>) {
    updateDB((d) => {
      Object.assign(d.settings.hours[index], changes);
    });
  }

  function addBlackout(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.date) {
      toast.error("Pick the date you are not working.");
      return;
    }
    if (db.blackouts.some((b) => b.date === draft.date)) {
      toast.error(`${formatDateLong(draft.date)} is already blocked off.`);
      return;
    }
    updateDB((d) => {
      d.blackouts.push({ date: draft.date, reason: draft.reason.trim() || "Not working" });
      d.blackouts.sort((a, b) => a.date.localeCompare(b.date));
    });
    toast.success(`${formatDateLong(draft.date)} is now blocked off on the booking form.`);
    setDraft({ date: todayISO(), reason: "" });
  }

  function removeBlackout(date: string) {
    updateDB((d) => {
      d.blackouts = d.blackouts.filter((b) => b.date !== date);
    });
    toast.success("That day is open again.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">Working days and hours</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          These hours build the arrival windows customers can pick on the booking form.
        </p>
        <ul className="mt-4 space-y-2">
          {db.settings.hours.map((hours, index) => (
            <li
              key={DAYS[index]}
              className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_7rem_7rem_auto] sm:items-center"
            >
              <span className="text-sm font-medium">{DAYS[index]}</span>
              <div>
                <label className="text-xs text-muted-foreground">Opens</label>
                <Input
                  type="time"
                  value={hours.open}
                  onChange={(e) => patchHours(index, { open: e.target.value })}
                  className="mt-1 h-10"
                  aria-label={`${DAYS[index]} opening time`}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Closes</label>
                <Input
                  type="time"
                  value={hours.close}
                  onChange={(e) => patchHours(index, { close: e.target.value })}
                  className="mt-1 h-10"
                  aria-label={`${DAYS[index]} closing time`}
                />
              </div>
              <Button
                variant={hours.closed ? "default" : "outline"}
                className="h-10"
                onClick={() => patchHours(index, { closed: !hours.closed })}
              >
                {hours.closed ? "Closed" : "Working"}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold tracking-tight">Days off</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Blocked dates cannot be booked. Customers see the reason next to the date.
        </p>

        {db.blackouts.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
            <CalendarOff className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No days blocked off</p>
            <p className="mx-auto mt-1 max-w-prose text-xs text-muted-foreground">
              Add a date below when you are travelling, resting or booked out.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {db.blackouts.map((blackout) => (
              <li
                key={blackout.date}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="text-sm font-medium">{formatDateLong(blackout.date)}</p>
                  <p className="text-xs text-muted-foreground">{blackout.reason}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 text-muted-foreground hover:text-destructive"
                  onClick={() => removeBlackout(blackout.date)}
                  aria-label={`Open ${blackout.date} again`}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addBlackout} className="mt-4 rounded-xl border border-border bg-card/60 p-5">
          <div className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
            <div>
              <label htmlFor="blackout-date" className="text-xs text-muted-foreground">
                Date
              </label>
              <Input
                id="blackout-date"
                type="date"
                value={draft.date}
                min={todayISO()}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                className="mt-1 h-11"
              />
            </div>
            <div>
              <label htmlFor="blackout-reason" className="text-xs text-muted-foreground">
                Reason, shown to customers
              </label>
              <Input
                id="blackout-reason"
                value={draft.reason}
                onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
                placeholder="Family day"
                className="mt-1 h-11"
              />
            </div>
            <Button type="submit" className="h-11">
              <Plus />
              Block off
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}