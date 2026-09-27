import type { DayHours, Settings } from "./types";

export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** "Sat 12 Oct" */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${DAY_NAMES[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "Saturday 12 October" */
export function formatDateLong(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const full = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${full[d.getMonth()]}`;
}

export function dayName(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return DAY_NAMES[d.getDay()];
}

export function dayLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return "Today";
  if (iso === toISO(addDays(new Date(), 1))) return "Tomorrow";
  return DAY_NAMES[new Date(`${iso}T00:00:00`).getDay()].slice(0, 3);
}

export function relativeLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return "Today";
  if (iso < today) return "Past";
  if (iso === toISO(addDays(new Date(), 1))) return "Tomorrow";
  return formatDate(iso);
}

export function nextDays(count = 14): string[] {
  const out: string[] = [];
  const base = new Date();
  for (let i = 0; i < count; i += 1) out.push(toISO(addDays(base, i)));
  return out;
}

export function hourLabel(hour24: number): string {
  const h = hour24 % 24;
  const suffix = h < 12 ? "am" : "pm";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}:00 ${suffix}`;
}

export function hoursToMinutes(value: string): number {
  const [h, m] = value.split(":").map((n) => Number.parseInt(n, 10));
  if (Number.isNaN(h)) return 0;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
}

/** Two-hour arrival windows between opening and closing time for that weekday. */
export function slotsForDate(iso: string, settings: Settings): string[] {
  const weekday = new Date(`${iso}T00:00:00`).getDay();
  const day: DayHours | undefined = settings.hours[weekday];
  if (!day || day.closed) return [];
  const start = Math.floor(hoursToMinutes(day.open) / 60);
  const end = Math.floor(hoursToMinutes(day.close) / 60);
  const slots: string[] = [];
  for (let h = start; h + 2 <= end; h += 2) slots.push(hourLabel(h));
  if (iso === todayISO()) {
    const nowHour = new Date().getHours();
    return slots.filter((_, index) => start + index * 2 > nowHour - 1);
  }
  return slots;
}

export function hoursSummary(settings: Settings): string {
  const weekdays = settings.hours[1];
  return `${settings.hours[1].open} – ${weekdays.close}`;
}

export function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
}