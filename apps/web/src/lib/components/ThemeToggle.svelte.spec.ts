import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import ThemeToggle from "./ThemeToggle.svelte";

const { mockTheme } = vi.hoisted(() => ({
  mockTheme: {
    preference: "dark" as const,
    set: vi.fn()
  }
}));

vi.mock("$lib/theme.svelte", () => ({
  theme: mockTheme
}));

vi.mock("$lib/paraglide/messages", () => ({
  theme_dark: () => "Dark",
  theme_light: () => "Light",
  theme_system: () => "System",
  theme_label: () => "Theme Selector"
}));

describe("ThemeToggle", () => {
  it("renders with current theme preference", () => {
    mockTheme.preference = "dark";
    render(ThemeToggle);

    const trigger = screen.getByLabelText("Theme Selector");
    expect(trigger).toBeTruthy();
    expect(trigger.tagName).toBe("BUTTON");
  });
});
