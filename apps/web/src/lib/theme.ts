// Shared theme constants/types (no runes here so server code — hooks.server.ts — can import).
export const THEME_COOKIE = "theme";

export type ThemePreference = "dark" | "light" | "system";

export const DEFAULT_THEME: ThemePreference = "dark";

// Toggle order for the 3-way switch.
export const THEME_ORDER: ThemePreference[] = ["dark", "light", "system"];

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "dark" || value === "light" || value === "system";
}

export function nextPreference(pref: ThemePreference): ThemePreference {
  return THEME_ORDER[(THEME_ORDER.indexOf(pref) + 1) % THEME_ORDER.length];
}

/** Resolve whether the `.dark` class should be applied, given the preference
 *  and the current system (OS) preference. Pure — unit-testable. */
export function resolveDark(pref: ThemePreference, systemPrefersDark: boolean): boolean {
  return pref === "dark" || (pref === "system" && systemPrefersDark);
}
