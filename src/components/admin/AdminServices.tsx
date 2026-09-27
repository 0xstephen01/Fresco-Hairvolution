import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDB, updateDB } from "@/lib/store";
import { formatNaira, uniqueId } from "@/lib/format";
import { CATEGORIES, type Category, type Service } from "@/lib/types";
import { serviceImage } from "@/lib/images";

const CATEGORY_LABEL: Record<Category, string> = {
  Cuts: "Cuts",
  Kids: "Kids",
  Extras: "Home extras",
};

export function AdminServices() {
  const db = useDB();
  const [draft, setDraft] = useState<Service>(() => newService());

  function newService(): Service {
    return {
      id: uniqueId("svc"),
      name: "",
      category: "Cuts",
      description: "",
      minutes: 30,
      price: 4000,
      active: true,
    };
  }

  function patch(id: string, changes: Partial<Service>) {
    updateDB((d) => {
      const service = d.services.find((s) => s.id === id);
      if (service) Object.assign(service, changes);
    });
  }

  function remove(id: string, name: string) {
    updateDB((d) => {
      d.services = d.services.filter((s) => s.id !== id);
    });
    toast.success(`${name} removed from the price list.`);
  }

  function add(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) {
      toast.error("Give the service a name first.");
      return;
    }
    updateDB((d) => {
      d.services.push({ ...draft, name: draft.name.trim(), description: draft.description.trim() });
    });
    toast.success(`${draft.name} added to the price list.`);
    setDraft(newService());
  }

  return (
    <div className="space-y-8">
      {CATEGORIES.map((category) => {
        const items = db.services.filter((s) => s.category === category);
        return (
          <div key={category}>
            <h3 className="border-b border-border pb-2 text-sm font-semibold tracking-tight">
              {CATEGORY_LABEL[category]}
            </h3>
            <ul className="mt-3 space-y-2">
              {items.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Nothing in this group yet. Add a service below.
                </li>
              ) : (
                items.map((service) => (
                  <li
                    key={service.id}
                    className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[3rem_1fr_7rem_6rem_auto] sm:items-center"
                  >
                    <img
                      src={serviceImage(service.id)}
                      alt=""
                      className="size-12 rounded-lg object-cover sm:size-12"
                    />
                    <div className="min-w-0">
                      <Input
                        value={service.name}
                        onChange={(e) => patch(service.id, { name: e.target.value })}
                        className="h-10 font-medium"
                        aria-label="Service name"
                        placeholder="Name this service"
                      />
                      <Input
                        value={service.description}
                        onChange={(e) => patch(service.id, { description: e.target.value })}
                        className="mt-2 h-10 text-sm"
                        aria-label="Description"
                        placeholder="One line on what this includes"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Price ₦</label>
                      <Input
                        type="number"
                        value={service.price}
                        min={0}
                        step={500}
                        onChange={(e) => patch(service.id, { price: Number(e.target.value) || 0 })}
                        className="mt-1 h-10"
                        aria-label="Price in naira"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Minutes</label>
                      <Input
                        type="number"
                        value={service.minutes}
                        min={10}
                        step={5}
                        onChange={(e) => patch(service.id, { minutes: Number(e.target.value) || 30 })}
                        className="mt-1 h-10"
                        aria-label="Duration in minutes"
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <button
                        type="button"
                        onClick={() => patch(service.id, { active: !service.active })}
                        className="cursor-pointer"
                        aria-pressed={service.active}
                      >
                        <Badge variant={service.active ? "default" : "outline"} className="font-normal">
                          {service.active ? "Bookable" : "Hidden"}
                        </Badge>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(service.id, service.name || "Service")}
                        aria-label={`Remove ${service.name}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        );
      })}

      <form onSubmit={add} className="rounded-xl border border-border bg-card/60 p-5">
        <h3 className="text-sm font-semibold tracking-tight">Add a service</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="new-name" className="text-xs text-muted-foreground">
              Name
            </label>
            <Input
              id="new-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Skin fade and beard"
              className="mt-1 h-11"
            />
          </div>
          <div>
            <label htmlFor="new-category" className="text-xs text-muted-foreground">
              Group
            </label>
            <select
              id="new-category"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}
              className="mt-1 h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="new-price" className="text-xs text-muted-foreground">
              Price ₦
            </label>
            <Input
              id="new-price"
              type="number"
              value={draft.price}
              min={0}
              step={500}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
              className="mt-1 h-11"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="new-description" className="text-xs text-muted-foreground">
              One line about it
            </label>
            <Input
              id="new-description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Fade with a shaped beard in one visit."
              className="mt-1 h-11"
            />
          </div>
          <div>
            <label htmlFor="new-minutes" className="text-xs text-muted-foreground">
              Minutes
            </label>
            <Input
              id="new-minutes"
              type="number"
              value={draft.minutes}
              min={10}
              step={5}
              onChange={(e) => setDraft({ ...draft, minutes: Number(e.target.value) || 30 })}
              className="mt-1 h-11"
            />
          </div>
        </div>
        <Button type="submit" className="mt-4 h-11">
          <Plus />
          Add to the price list
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          New services show on the site straight away. Prices you type here are what customers see on
          the booking form, in naira.
        </p>
      </form>
    </div>
  );
}