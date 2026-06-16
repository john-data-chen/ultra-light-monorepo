import { browser } from "$app/environment";

import {
  DEFAULT_THEME,
  isThemePreference,
  nextPreference,
  resolveDark,
  THEME_COOKIE,
  type ThemePreference
} from "./theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function readCookiePreference(): ThemePreference {
  if (!browser) {
    return DEFAULT_THEME;
  }
  const value = document.cookie.match(/(?:^|;\s*)theme=(dark|light|system)/)?.[1];
  return isThemePreference(value) ? value : DEFAULT_THEME;
}

function systemPrefersDark(): boolean {
  return browser && window.matchMedia(DARK_QUERY).matches;
}

function applyToDocument(pref: ThemePreference): void {
  if (!browser) {
    return;
  }
  document.documentElement.classList.toggle("dark", resolveDark(pref, systemPrefersDark()));
}

class ThemeStore {
  preference = $state<ThemePreference>(readCookiePreference());

  constructor() {
    if (!browser) {
      return;
    }
    // Re-apply when the OS scheme changes while the user is on `system`.
    window.matchMedia(DARK_QUERY).addEventListener("change", () => {
      if (this.preference === "system") {
        applyToDocument("system");
      }
    });
  }

  set(pref: ThemePreference): void {
    this.preference = pref;
    if (!browser) {
      return;
    }
    document.cookie = `${THEME_COOKIE}=${pref};path=/;max-age=31536000;samesite=lax`;
    applyToDocument(pref);
  }

  cycle(): void {
    this.set(nextPreference(this.preference));
  }
}

export const theme = new ThemeStore();
