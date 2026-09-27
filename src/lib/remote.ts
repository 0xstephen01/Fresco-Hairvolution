import { supabase, supabaseConfigured } from "./supabase";
import type {
  BlackoutDate,
  Booking,
  CoverageZone,
  DB,
  Review,
  Service,
  Settings,
} from "./types";

export { supabaseConfigured };

type Row = Record<string, unknown>;

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;
const num = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const bool = (value: unknown, fallback = true): boolean =>
  typeof value === "boolean" ? value : fallback;
const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

/* ------------------------------------------------------------------ mappers */

function serviceRow(s: Service, position: number): Row {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    description: s.description,
    minutes: s.minutes,
    price: s.price,
    active: s.active,
    position,
  };
}

function serviceFrom(row: Row): Service {
  return {
    id: str(row.id),
    name: str(row.name),
    category: str(row.category, "Cuts") as Service["category"],
    description: str(row.description),
    minutes: num(row.minutes, 30),
    price: num(row.price),
    active: bool(row.active),
  };
}

function zoneRow(z: CoverageZone, position: number): Row {
  return {
    id: z.id,
    name: z.name,
    areas: z.areas,
    fee_min: z.feeMin,
    fee_max: z.feeMax,
    customer_share: z.customerShare,
    active: z.active,
    position,
  };
}

function zoneFrom(row: Row): CoverageZone {
  const max = row.fee_max;
  return {
    id: str(row.id),
    name: str(row.name),
    areas: list(row.areas),
    feeMin: num(row.fee_min),
    feeMax: typeof max === "number" && Number.isFinite(max) ? max : null,
    customerShare: num(row.customer_share, 0.5),
    active: bool(row.active),
  };
}

function reviewRow(r: Review, position: number): Row {
  return {
    id: r.id,
    first_name: r.firstName,
    area: r.area,
    quote: r.quote,
    rating: r.rating,
    date: r.date,
    position,
  };
}

function reviewFrom(row: Row): Review {
  return {
    id: str(row.id),
    firstName: str(row.first_name),
    area: str(row.area),
    quote: str(row.quote),
    rating: num(row.rating, 5),
    date: str(row.date),
  };
}

function bookingRow(b: Booking): Row {
  return {
    id: b.id,
    name: b.name,
    phone: b.phone,
    service_id: b.serviceId,
    add_on_ids: b.addOnIds,
    date: b.date,
    slot: b.slot,
    address: b.address,
    area: b.area,
    landmark: b.landmark,
    clients: b.clients,
    notes: b.notes,
    status: b.status,
    created_at: b.createdAt,
  };
}

function bookingFrom(row: Row): Booking {
  const status = str(row.status, "new");
  return {
    id: str(row.id),
    name: str(row.name),
    phone: str(row.phone),
    serviceId: str(row.service_id),
    addOnIds: list(row.add_on_ids),
    date: str(row.date),
    slot: str(row.slot),
    address: str(row.address),
    area: str(row.area),
    landmark: str(row.landmark),
    clients: num(row.clients, 1),
    notes: str(row.notes),
    status: status === "confirmed" || status === "done" ? status : "new",
    createdAt: str(row.created_at),
  };
}

/* -------------------------------------------------------------------- reads */

/** Everything a visitor needs to see the site. No sign-in required. */
export async function fetchPublicData(): Promise<Partial<DB>> {
  if (!supabaseConfigured) return {};
  const [services, zones, blackouts, reviews, settings] = await Promise.all([
    supabase.from("services").select("*").order("position", { ascending: true }),
    supabase.from("zones").select("*").order("position", { ascending: true }),
    supabase.from("blackouts").select("*").order("date", { ascending: true }),
    supabase.from("reviews").select("*").order("position", { ascending: true }),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const out: Partial<DB> = {};
  if (!services.error && services.data) out.services = (services.data as Row[]).map(serviceFrom);
  if (!zones.error && zones.data) out.zones = (zones.data as Row[]).map(zoneFrom);
  if (!blackouts.error && blackouts.data) {
    out.blackouts = (blackouts.data as Row[]).map((row) => ({
      date: str(row.date),
      reason: str(row.reason, "Not working"),
    }));
  }
  if (!reviews.error && reviews.data) out.reviews = (reviews.data as Row[]).map(reviewFrom);
  if (!settings.error && settings.data) {
    const data = (settings.data as Row).data;
    if (data && typeof data === "object") out.settings = data as Settings;
  }
  return out;
}

/** Booking requests. Only works while the owner is signed in. */
export async function fetchBookings(): Promise<Booking[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("date", { ascending: true });
  if (error || !data) return [];
  return (data as Row[]).map(bookingFrom);
}

/* ------------------------------------------------------------------- writes */

export async function pushServices(upserts: Service[], deletes: string[]): Promise<void> {
  if (upserts.length) {
    const rows = upserts.map((s, index) => serviceRow(s, index));
    const { error } = await supabase.from("services").upsert(rows);
    if (error) throw error;
  }
  if (deletes.length) {
    const { error } = await supabase.from("services").delete().in("id", deletes);
    if (error) throw error;
  }
}

export async function pushZones(upserts: CoverageZone[], deletes: string[]): Promise<void> {
  if (upserts.length) {
    const rows = upserts.map((z, index) => zoneRow(z, index));
    const { error } = await supabase.from("zones").upsert(rows);
    if (error) throw error;
  }
  if (deletes.length) {
    const { error } = await supabase.from("zones").delete().in("id", deletes);
    if (error) throw error;
  }
}

export async function pushBlackouts(upserts: BlackoutDate[], deletes: string[]): Promise<void> {
  if (upserts.length) {
    const { error } = await supabase.from("blackouts").upsert(upserts);
    if (error) throw error;
  }
  if (deletes.length) {
    const { error } = await supabase.from("blackouts").delete().in("date", deletes);
    if (error) throw error;
  }
}

export async function pushReviews(upserts: Review[], deletes: string[]): Promise<void> {
  if (upserts.length) {
    const rows = upserts.map((r, index) => reviewRow(r, index));
    const { error } = await supabase.from("reviews").upsert(rows);
    if (error) throw error;
  }
  if (deletes.length) {
    const { error } = await supabase.from("reviews").delete().in("id", deletes);
    if (error) throw error;
  }
}

export async function pushSettings(settings: Settings): Promise<void> {
  const { error } = await supabase.from("settings").upsert({ id: 1, data: settings });
  if (error) throw error;
}

/** A customer sending a booking request. Works without signing in. */
export async function pushBooking(booking: Booking): Promise<void> {
  const { error } = await supabase.from("bookings").insert(bookingRow(booking));
  if (error) throw error;
}

export async function pushBookingStatus(id: string, status: Booking["status"]): Promise<void> {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
}

/** A customer looking up the bookings made with their own phone number. */
export async function lookupBookings(phone: string): Promise<Booking[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase.rpc("lookup_bookings", { p_phone: phone });
  if (error || !data) return [];
  return (data as Row[]).map(bookingFrom);
}

/** A customer cancelling one of their own bookings. */
export async function cancelOwnBooking(id: string, phone: string): Promise<void> {
  if (!supabaseConfigured) return;
  const { error } = await supabase.rpc("cancel_booking", { p_id: id, p_phone: phone });
  if (error) throw error;
}

/* --------------------------------------------------------------------- auth */

export async function ownerSignIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function ownerSignOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function currentOwner(): Promise<string | null> {
  if (!supabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.email ?? null;
}

export function onOwnerChange(callback: (email: string | null) => void): () => void {
  if (!supabaseConfigured) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user.email ?? null);
  });
  return () => data.subscription.unsubscribe();
}
