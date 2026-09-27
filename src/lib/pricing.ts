import type { Booking, CoverageZone, DB, Service } from "./types";
import { formatNaira, formatDateLong } from "./format";

export interface Quote {
  service: Service | null;
  addOns: Service[];
  clients: number;
  serviceTotal: number;
  extrasTotal: number;
  calloutFee: number;
  absorbed: number;
  zoneName: string;
  total: number;
}

export function findService(db: DB, id: string): Service | undefined {
  return db.services.find((s) => s.id === id);
}

export function findZone(db: DB, id: string): CoverageZone | undefined {
  return db.zones.find((z) => z.id === id);
}

/** What the customer pays towards the trip, based on the starting fee. */
export function customerCallout(zone: CoverageZone): number {
  return Math.round(zone.feeMin * zone.customerShare);
}

/** What Fresco carries himself on that trip. */
export function absorbedCallout(zone: CoverageZone): number {
  return zone.feeMin - customerCallout(zone);
}

/** The starting call-out fee as a label: "₦5,000", "₦6,000–₦9,000", "₦25,000–₦30,000+". */
export function feeRangeLabel(zone: CoverageZone): string {
  if (zone.feeMax === null) return `${formatNaira(zone.feeMin)}+`;
  if (zone.feeMax === zone.feeMin) return formatNaira(zone.feeMin);
  return `${formatNaira(zone.feeMin)}\u2013${formatNaira(zone.feeMax)}`;
}

/** The customer's share of the starting fee as a label, e.g. "₦2,500–₦4,500". */
export function customerRangeLabel(zone: CoverageZone): string {
  const low = customerCallout(zone);
  if (zone.feeMax === null) return `${formatNaira(low)}+`;
  const high = Math.round(zone.feeMax * zone.customerShare);
  if (high === low) return formatNaira(low);
  return `${formatNaira(low)}\u2013${formatNaira(high)}`;
}

export function quoteFor(
  db: DB,
  serviceId: string,
  addOnIds: string[],
  zoneId: string,
  clients: number,
): Quote {
  const service = findService(db, serviceId) ?? null;
  const addOns = addOnIds
    .map((id) => findService(db, id))
    .filter((s): s is Service => Boolean(s));
  const heads = Math.max(1, clients || 1);
  const serviceTotal = (service?.price ?? 0) * heads;
  const extrasTotal = addOns.reduce((sum, s) => sum + s.price, 0);
  const zone = findZone(db, zoneId);
  const calloutFee = zone ? customerCallout(zone) : 0;
  const absorbed = zone ? absorbedCallout(zone) : 0;
  return {
    service,
    addOns,
    clients: heads,
    serviceTotal,
    extrasTotal,
    calloutFee,
    absorbed,
    zoneName: zone?.name ?? "",
    total: serviceTotal + extrasTotal + calloutFee,
  };
}

export function bookingSummaryText(db: DB, booking: Booking): string {
  const quote = quoteFor(db, booking.serviceId, booking.addOnIds, "", booking.clients);
  const lines = [
    `Booking request for ${db.settings.businessName}`,
    `Name: ${booking.name}`,
    `Phone: ${booking.phone}`,
    `Service: ${quote.service?.name ?? "Service"}${booking.clients > 1 ? ` \u00d7 ${booking.clients} people` : ""}`,
    quote.addOns.length ? `Add-ons: ${quote.addOns.map((a) => a.name).join(", ")}` : "",
    `Date: ${formatDateLong(booking.date)}`,
    `Arrival window: ${booking.slot}`,
    `Address: ${booking.address}${booking.landmark ? `, ${booking.landmark}` : ""}`,
    `Area: ${booking.area}`,
    booking.notes ? `Notes: ${booking.notes}` : "",
    "",
    `Services on the day: ${formatNaira(quote.serviceTotal + quote.extrasTotal)}. Call-out is confirmed separately.`,
  ];
  return lines.filter(Boolean).join("\n");
}
