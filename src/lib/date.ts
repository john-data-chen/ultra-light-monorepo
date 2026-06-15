// Date helpers shared by client and server. App dates are plain ISO strings.

export const MONTH_RE = /^\d{4}-\d{2}$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** True when the string is a "YYYY-MM" month. */
export function isValidMonth(value: string): boolean {
  return MONTH_RE.test(value);
}

/** True when the string is a "YYYY-MM-DD" date. */
export function isValidDate(value: string): boolean {
  return DATE_RE.test(value);
}

/** Current month as "YYYY-MM". */
export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Today as "YYYY-MM-DD". */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Formats a date string or object for consistent SSR/client rendering.
 * Hardcodes Asia/Taipei timezone for deterministic output in this app.
 */
export function formatDateTime(value: Date | string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
    timeZone: "Asia/Taipei"
  }).format(new Date(value));
}
