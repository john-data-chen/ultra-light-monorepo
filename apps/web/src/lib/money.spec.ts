import { describe, expect, it } from "vitest";

import { formatAmount, formatTWD, parseAmount } from "./money";

describe("formatAmount", () => {
  it("adds thousands separators", () => {
    expect(formatAmount(12345)).toBe("12,345");
  });
  it("formats zero", () => {
    expect(formatAmount(0)).toBe("0");
  });
  it("truncates fractional input", () => {
    expect(formatAmount(1234.9)).toBe("1,234");
  });
});

describe("formatTWD", () => {
  it("prefixes NT$", () => {
    expect(formatTWD(68000)).toBe("NT$68,000");
  });
  it("handles negative balances", () => {
    expect(formatTWD(-500)).toBe("-NT$500");
  });
});

describe("parseAmount", () => {
  it("parses plain digits", () => {
    expect(parseAmount("5000")).toBe(5000);
  });
  it("ignores commas and spaces", () => {
    expect(parseAmount("1,234")).toBe(1234);
    expect(parseAmount(" 12 000 ")).toBe(12000);
  });
  it("rejects decimals, negatives and non-numeric input", () => {
    expect(parseAmount("12.5")).toBeNull();
    expect(parseAmount("-5")).toBeNull();
    expect(parseAmount("abc")).toBeNull();
    expect(parseAmount("")).toBeNull();
    // Test unsafe integers to cover the false branch of Number.isSafeInteger(value)
    expect(parseAmount("999999999999999999999999999999")).toBeNull();
  });
});
