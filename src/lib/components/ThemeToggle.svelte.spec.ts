import { render, fireEvent, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import ThemeToggle from "./ThemeToggle.svelte";

const { mockTheme } = vi.hoisted(() => ({
  mockTheme: {
    preference: "dark",
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
  it("renders a select with current preference selected", () => {
    mockTheme.preference = "dark";
    render(ThemeToggle);

    const select = screen.getByLabelText("Theme Selector") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("dark");

    const options = screen.getAllByRole("option") as HTMLOptionElement[];
    expect(options).toHaveLength(3);
    expect(options[0].value).toBe("dark");
    expect(options[0].textContent).toBe("Dark");
    expect(options[1].value).toBe("light");
    expect(options[1].textContent).toBe("Light");
    expect(options[2].value).toBe("system");
    expect(options[2].textContent).toBe("System");
  });

  it("calls theme.set when selection changes", async () => {
    render(ThemeToggle);

    const select = screen.getByLabelText("Theme Selector");
    await fireEvent.change(select, { target: { value: "light" } });

    expect(mockTheme.set).toHaveBeenCalledWith("light");
  });
});
