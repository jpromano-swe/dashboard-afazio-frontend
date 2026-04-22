export const DEFAULT_LOCALE = "es-AR";
export const DEFAULT_TIME_ZONE = "America/Argentina/Buenos_Aires";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateForBuenosAires(dateInput: string | Date) {
  if (typeof dateInput === "string" && DATE_ONLY_PATTERN.test(dateInput)) {
    return new Date(`${dateInput}T12:00:00-03:00`);
  }

  return new Date(dateInput);
}

export function toIsoDate(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function toTimeZoneCalendarDate(dateInput: string | Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(toDateForBuenosAires(dateInput));

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12, 0, 0));
}

export function endOfMonth(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 12, 0, 0),
  );
}

export function startOfWeek(date: Date) {
  const current = new Date(date);
  const dayIndex = (current.getUTCDay() + 6) % 7;

  current.setUTCDate(current.getUTCDate() - dayIndex);
  current.setUTCHours(12, 0, 0, 0);

  return current;
}

export function formatShortDate(dateInput: string | Date) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIME_ZONE,
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(toDateForBuenosAires(dateInput));
}

export function formatMonthYear(dateInput: string | Date) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(toDateForBuenosAires(dateInput));
}

export function formatCapitalizedMonthYear(dateInput: string | Date) {
  const formatted = formatMonthYear(dateInput);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatTime(dateInput: string | Date) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(toDateForBuenosAires(dateInput));
}

export function formatDateTime(dateInput: string | Date) {
  return `${formatShortDate(dateInput)} · ${formatTime(dateInput)}`;
}

export function formatDateRange(from: string | Date, to: string | Date) {
  return `${formatShortDate(from)} - ${formatShortDate(to)}`;
}

export function formatWeekdayLabel(dateInput: string | Date) {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIME_ZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(toDateForBuenosAires(dateInput));
}

export function toTimeZoneIsoDate(dateInput: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(toDateForBuenosAires(dateInput));

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return toIsoDate(toDateForBuenosAires(dateInput));
  }

  return `${year}-${month}-${day}`;
}
