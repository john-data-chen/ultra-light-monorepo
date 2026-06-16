// App-wide constants shared by client and server.

export const APP_NAME = "Expense Tracker";

/** Demo account email pre-filled on the login form (no password / no registration). */
export const DEMO_EMAIL = "john@example.com";

/** Build a document title like "Dashboard · Expense Tracker". */
export function pageTitle(section: string): string {
  return `${section} · ${APP_NAME}`;
}
