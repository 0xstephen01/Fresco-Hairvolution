import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { defaultDB } from "./seed";
import type { Booking, BookingStatus, DB } from "./types";
import { supabaseConfigured } from "./supabase";
import * as remote from "./remote";

const KEY = "fresco.db.v13";

/** True when the project has a Supabase backend linked. */
export const remoteEnabled = supabaseConfigured;

let cache: DB | null = null;
/** The last state we know is on the server, used to work out what changed. */
let synced: DB | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function clone(db: DB): DB {
  return JSON.parse(JSON.stringify(db)) as DB;
}

function read(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(defaultDB);
    const parsed = JSON.parse(raw) as Partial<DB>;
    const base = clone(defaultDB);
    return {
      services: parsed.services ?? base.services,
      bookings: parsed.bookings ?? base.bookings,
      zones: parsed.zones ?? base.zones,
      blackouts: parsed.blackouts ?? base.blackouts,
      reviews: parsed.reviews ?? base.reviews,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return clone(defaultDB);
  }
}

function persist(db: DB): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* storage full or blocked: keep the in-memory copy */
  }
}

function getSnapshot(): DB {
  if (!cache) cache = read();
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Read the whole database outside of React. */
export function getDB(): DB {
  return getSnapshot();
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Apply a change locally and persist it, then let every subscriber re-render. */
export function updateDB(mutator: (draft: DB) => void): void {
  const next = clone(getSnapshot());
  mutator(next);
  cache = next;
  persist(next);
  emit();
  void syncCollections(next);
}

export function resetDB(): void {
  cache = clone(defaultDB);
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}

/* ------------------------------------------------------------------ syncing */

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function diffById<T extends { id: string }>(before: T[], after: T[]) {
  const beforeMap = new Map(before.map((item) => [item.id, item]));
  const afterMap = new Map(after.map((item) => [item.id, item]));
  const upserts = after.filter((item) => !same(beforeMap.get(item.id), item));
  const deletes = before.filter((item) => !afterMap.has(item.id)).map((item) => item.id);
  return { upserts, deletes };
}

/** Push whatever changed since the last sync up to the backend. */
async function syncCollections(next: DB): Promise<void> {
  if (!remoteEnabled) return;
  const before = synced;
  synced = clone(next);
  if (!before) return;

  try {
    const services = diffById(before.services, next.services);
    if (services.upserts.length || services.deletes.length) {
      await remote.pushServices(services.upserts, services.deletes);
    }

    const zones = diffById(before.zones, next.zones);
    if (zones.upserts.length || zones.deletes.length) {
      await remote.pushZones(zones.upserts, zones.deletes);
    }

    const reviews = diffById(before.reviews, next.reviews);
    if (reviews.upserts.length || reviews.deletes.length) {
      await remote.pushReviews(reviews.upserts, reviews.deletes);
    }

    const beforeDates = new Set(before.blackouts.map((b) => b.date));
    const afterDates = new Set(next.blackouts.map((b) => b.date));
    const blackoutUpserts = next.blackouts.filter((b) => !beforeDates.has(b.date));
    const blackoutDeletes = before.blackouts
      .filter((b) => !afterDates.has(b.date))
      .map((b) => b.date);
    if (blackoutUpserts.length || blackoutDeletes.length) {
      await remote.pushBlackouts(blackoutUpserts, blackoutDeletes);
    }

    if (!same(before.settings, next.settings)) {
      await remote.pushSettings(next.settings);
    }
  } catch {
    /* offline or not signed in: the local copy stays and the next edit retries */
    toast.error("Saved here, but it did not reach the server. Check your connection and edit again.");
  }
}

/**
 * Load the site's data from the backend. A brand new project has empty tables,
 * so the seeded price list shows locally until the owner signs in and
 * `pushLocalData` copies it up. Nothing is written here: a visitor is not
 * allowed to write, and the security rules would reject it.
 */
export async function hydrate(): Promise<void> {
  if (!remoteEnabled || hydrated) return;
  hydrated = true;
  try {
    const data = await remote.fetchPublicData();
    const base = clone(defaultDB);
    const fresh = !data.services || data.services.length === 0;
    const next: DB = {
      services: fresh ? base.services : (data.services ?? base.services),
      zones: fresh ? base.zones : (data.zones ?? base.zones),
      blackouts: data.blackouts ?? base.blackouts,
      reviews: fresh ? base.reviews : (data.reviews ?? base.reviews),
      settings: { ...base.settings, ...(data.settings ?? {}) },
      bookings: getSnapshot().bookings,
    };
    cache = next;
    persist(next);
    emit();
    synced = clone(next);
  } catch {
    /* no backend reachable: the local copy keeps the site working */
  }
}

/**
 * Push the whole local copy up to the backend, but only when the server has no
 * price list yet. Called right after the owner signs in, so a brand new project
 * gets the seeded services, zones, reviews and settings without the owner
 * having to edit anything first. An existing project is left untouched.
 */
export async function pushLocalData(): Promise<void> {
  if (!remoteEnabled) return;
  try {
    const existing = await remote.fetchPublicData();
    if (existing.services && existing.services.length > 0) {
      synced = clone(getSnapshot());
      return;
    }
    const db = getSnapshot();
    await remote.pushServices(db.services, []);
    await remote.pushZones(db.zones, []);
    await remote.pushReviews(db.reviews, []);
    await remote.pushBlackouts(db.blackouts, []);
    await remote.pushSettings(db.settings);
    synced = clone(db);
  } catch {
    toast.error("Could not copy your price list to the server. Check your connection and sign in again.");
  }
}

/* ----------------------------------------------------------------- bookings */

/** A customer sending a request. Saved locally and, when linked, on the server. */
export async function submitBooking(booking: Booking): Promise<void> {
  updateDB((draft) => {
    draft.bookings.unshift(booking);
  });
  if (!remoteEnabled) return;
  await remote.pushBooking(booking);
}

/** The owner's booking list. Only returns rows while signed in. */
export async function loadBookings(): Promise<void> {
  if (!remoteEnabled) return;
  const bookings = await remote.fetchBookings();
  updateDB((draft) => {
    draft.bookings = bookings;
  });
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<void> {
  updateDB((draft) => {
    const booking = draft.bookings.find((b) => b.id === id);
    if (booking) booking.status = status;
  });
  if (!remoteEnabled) return;
  await remote.pushBookingStatus(id, status);
}

export async function removeBooking(id: string): Promise<void> {
  updateDB((draft) => {
    draft.bookings = draft.bookings.filter((b) => b.id !== id);
  });
  if (!remoteEnabled) return;
  await remote.deleteBooking(id);
}

/** A customer looking up their own bookings with the phone number they used. */
export async function lookupBookings(phone: string): Promise<Booking[]> {
  if (!remoteEnabled) {
    const digits = (value: string) => value.replace(/\D/g, "").slice(-10);
    return getSnapshot()
      .bookings.filter((b) => digits(b.phone) === digits(phone))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  return remote.lookupBookings(phone);
}

export async function cancelOwnBooking(id: string, phone: string): Promise<void> {
  if (!remoteEnabled) {
    updateDB((draft) => {
      draft.bookings = draft.bookings.filter((b) => b.id !== id);
    });
    return;
  }
  await remote.cancelOwnBooking(id, phone);
}
