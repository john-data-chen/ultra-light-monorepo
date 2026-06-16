import { describe, it, expect, vi, afterEach } from "vitest";

import { isValidMonth, isValidDate, currentMonth, today, formatDateTime } from "./date";

describe("isValidMonth", () => {
  it("accepts YYYY-MM format", () => {
    expect(isValidMonth("2026-06")).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(isValidMonth("2026/06")).toBe(false);
    expect(isValidMonth("2026-06-01")).toBe(false);
    expect(isValidMonth("26-06")).toBe(false);
  });
});

describe("isValidDate", () => {
  it("accepts YYYY-MM-DD format", () => {
    expect(isValidDate("2026-06-15")).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(isValidDate("2026-06")).toBe(false);
    expect(isValidDate("15-06-2026")).toBe(false);
  });
});

describe("currentMonth", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns current month as YYYY-MM", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T10:00:00Z"));
    expect(currentMonth()).toBe("2026-06");
  });
});

describe("today", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today as YYYY-MM-DD", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T10:00:00Z"));
    expect(today()).toBe("2026-06-15");
  });
});

describe("formatDateTime", () => {
  it("formats a date string", () => {
    const result = formatDateTime("2026-06-15T10:30:00Z", "en-US");
    expect(result).toContain("Jun");
    expect(result).toContain("2026");
  });

  it("formats a Date object", () => {
    const result = formatDateTime(new Date("2026-06-15T10:30:00Z"), "en-US");
    expect(result).toContain("Jun");
  });
});
