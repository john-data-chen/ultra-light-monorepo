import { render, fireEvent, screen } from "@testing-library/svelte";
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
  it("renders select with options and current locale selected", () => {
    render(LocaleSwitcher);

    const select = screen.getByLabelText("Language Selector") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("en");

    const options = screen.getAllByRole("option") as HTMLOptionElement[];
    expect(options).toHaveLength(2);
    expect(options[0].value).toBe("en");
    expect(options[0].textContent).toBe("EN");
    expect(options[1].value).toBe("zh-tw");
    expect(options[1].textContent).toBe("中文");
  });

  it("calls setLocale when selection changes", async () => {
    render(LocaleSwitcher);

    const select = screen.getByLabelText("Language Selector");
    await fireEvent.change(select, { target: { value: "zh-tw" } });

    expect(mockRuntime.setLocale).toHaveBeenCalledWith("zh-tw");
  });
});
