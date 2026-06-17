import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";

import Layout from "./+layout.svelte";

// Layout + its header children (LocaleSwitcher/ThemeToggle) pull these modules; stub them so the
// test stays focused on which nav links render for each user state.
vi.mock("@vercel/analytics/sveltekit", () => ({ injectAnalytics: vi.fn() }));
vi.mock("$app/environment", () => ({ dev: false }));
vi.mock("$app/forms", () => ({ enhance: vi.fn() }));
vi.mock("$app/paths", () => ({ resolve: vi.fn((href: string) => href) }));
vi.mock("$lib/paraglide/runtime", () => ({
  getLocale: () => "en",
  locales: ["en", "zh-tw"],
  setLocale: vi.fn()
}));
vi.mock("$lib/theme", () => ({ THEME_ORDER: ["dark", "light", "system"] }));
vi.mock("$lib/theme.svelte", () => ({ theme: { preference: "dark", set: vi.fn() } }));
vi.mock("$lib/paraglide/messages", () => ({
  nav_dashboard: () => "Dashboard",
  nav_transactions: () => "Transactions",
  nav_admin: () => "Admin",
  nav_api_docs: () => "API Docs",
  sign_out: () => "Sign out",
  locale_label: () => "Language",
  theme_label: () => "Theme",
  theme_dark: () => "Dark",
  theme_light: () => "Light",
  theme_system: () => "System"
}));

const children = createRawSnippet(() => ({ render: () => `<div data-testid="child">child</div>` }));

function renderLayout(user: { name: string; avatar: string; role: "user" | "admin" } | null) {
  return render(Layout, {
    props: { children, data: { user } } as never
  });
}

describe("Root layout header", () => {
  it("shows the public API Docs link when logged out", () => {
    const { container } = renderLayout(null);
    expect(container.querySelector('a[href="/api/docs"]')).not.toBeNull();
    // Logged-out users get no app nav or logout.
    expect(container.querySelector('a[href="/"]')).toBeNull();
    expect(container.querySelector('a[href="/admin"]')).toBeNull();
    expect(container.querySelector('form[action="/logout"]')).toBeNull();
  });

  it("shows API Docs + app nav for a normal user, but no Admin link", () => {
    const { container } = renderLayout({ name: "Ann", avatar: "🦊", role: "user" });
    expect(container.querySelector('a[href="/api/docs"]')).not.toBeNull();
    expect(container.querySelector('a[href="/"]')).not.toBeNull();
    expect(container.querySelector('a[href="/admin"]')).toBeNull();
    expect(container.querySelector('form[action="/logout"]')).not.toBeNull();
  });

  it("shows API Docs + Admin link for an admin", () => {
    const { container } = renderLayout({ name: "Boss", avatar: "👑", role: "admin" });
    expect(container.querySelector('a[href="/api/docs"]')).not.toBeNull();
    expect(container.querySelector('a[href="/admin"]')).not.toBeNull();
  });
});
