import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { currentMonth, formatDateTime, isValidDate, isValidMonth, today } from "./date";

describe("date helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // System time: 2026-06-03 10:40:35
    vi.setSystemTime(new Date("2026-06-03T10:40:35Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("validates months correctly", () => {
    expect(isValidMonth("2026-06")).toBe(true);
    expect(isValidMonth("1999-12")).toBe(true);
    expect(isValidMonth("2026-6")).toBe(false);
    expect(isValidMonth("2026-06-03")).toBe(false);
    expect(isValidMonth("invalid")).toBe(false);
  });

  it("validates dates correctly", () => {
    expect(isValidDate("2026-06-03")).toBe(true);
    expect(isValidDate("1999-12-31")).toBe(true);
    expect(isValidDate("2026-06")).toBe(false);
    expect(isValidDate("2026-6-3")).toBe(false);
    expect(isValidDate("invalid")).toBe(false);
  });

  it("returns current month correctly", () => {
    expect(currentMonth()).toBe("2026-06");
  });

  it("returns today's date correctly", () => {
    expect(today()).toBe("2026-06-03");
  });

  it("formats dates deterministically with Asia/Taipei timezone", () => {
    // 2026-06-03 10:40:35Z is 18:40:35 in Asia/Taipei
    const d = new Date("2026-06-03T10:40:35Z");

    const formattedEn = formatDateTime(d, "en-US");
    expect(formattedEn).toContain("Jun 3, 2026");
    expect(formattedEn).toContain("18:40");

    const formattedZh = formatDateTime(d, "zh-TW");
    expect(formattedZh).toContain("2026/6/3");
    expect(formattedZh).toContain("18:40");
  });
});
