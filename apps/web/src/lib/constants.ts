import { APP_NAME as SHARED_APP_NAME, DEMO_EMAIL } from "@ultra-light/shared";

export const APP_NAME = SHARED_APP_NAME;
export { DEMO_EMAIL };

export function pageTitle(section: string): string {
  return `${section} · ${APP_NAME}`;
}
