import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import LocaleSwitcher from "./LocaleSwitcher.svelte";

const { mockRuntime } = vi.hoisted(() => ({
  mockRuntime: {
    getLocale: () => "en",
    locales: ["en", "zh-tw"],
    setLocale: vi.fn()
  }
}));

vi.mock("$lib/paraglide/runtime", () => mockRuntime);

vi.mock("$lib/paraglide/messages", () => ({
  locale_label: () => "Language Selector"
}));

describe("LocaleSwitcher", () => {
  it("renders a select trigger with current locale", () => {
    render(LocaleSwitcher);

    const trigger = screen.getByLabelText("Language Selector");
    expect(trigger).toBeTruthy();
    expect(trigger.tagName).toBe("BUTTON");
  });
});
