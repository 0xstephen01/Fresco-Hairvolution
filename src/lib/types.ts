export type Category = "Cuts" | "Kids" | "Extras";

export const CATEGORIES: Category[] = ["Cuts", "Kids", "Extras"];

export interface Service {
  id: string;
  name: string;
  category: Category;
  description: string;
  minutes: number;
  price: number;
  active: boolean;
}

export type BookingStatus = "new" | "confirmed" | "done";

export interface Booking {
  id: string;
  name: string;
  phone: string;
  serviceId: string;
  addOnIds: string[];
  date: string;
  slot: string;
  address: string;
  area: string;
  landmark: string;
  clients: number;
  notes: string;
  status: BookingStatus;
  createdAt: string;
}

/**
 * A travel zone. `feeMin` is the starting call-out cost for the trip and
 * `feeMax` the top of the range (null when the range is open-ended, e.g.
 * "₦30,000+"). `customerShare` is the fraction of the fee the customer pays
 * (0 to 1); Fresco absorbs the rest.
 */
export interface CoverageZone {
  id: string;
  name: string;
  areas: string[];
  feeMin: number;
  feeMax: number | null;
  customerShare: number;
  active: boolean;
}

export interface BlackoutDate {
  date: string;
  reason: string;
}

export interface Review {
  id: string;
  firstName: string;
  area: string;
  quote: string;
  rating: number;
  date: string;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface Settings {
  businessName: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  heroHeadline: string;
  heroSubline: string;
  calloutNote: string;
  includedLine: string;
  ownerPin: string;
  hours: DayHours[];
}

export interface DB {
  services: Service[];
  bookings: Booking[];
  zones: CoverageZone[];
  blackouts: BlackoutDate[];
  reviews: Review[];
  settings: Settings;
}
