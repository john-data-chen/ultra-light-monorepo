import { describe, it, expect } from "vitest";

import { formatAmount, formatTWD, parseAmount } from "./money";

describe("formatAmount", () => {
  it("formats with thousands separators", () => {
    expect(formatAmount(12345)).toBe("12,345");
  });

  it("truncates decimals", () => {
    expect(formatAmount(12345.67)).toBe("12,345");
  });

  it("handles zero", () => {
    expect(formatAmount(0)).toBe("0");
  });
});

describe("formatTWD", () => {
  it("formats positive amount with NT$ prefix", () => {
    expect(formatTWD(12345)).toBe("NT$12,345");
  });

  it("formats negative amount with minus sign", () => {
    expect(formatTWD(-12345)).toBe("-NT$12,345");
  });

  it("handles zero", () => {
    expect(formatTWD(0)).toBe("NT$0");
  });
});

describe("parseAmount", () => {
  it("parses plain integer", () => {
    expect(parseAmount("12345")).toBe(12345);
  });

  it("parses with commas", () => {
    expect(parseAmount("12,345")).toBe(12345);
  });

  it("parses with spaces", () => {
    expect(parseAmount("12 345")).toBe(12345);
  });

  it("returns null for non-numeric input", () => {
    expect(parseAmount("abc")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseAmount("")).toBeNull();
  });

  it("returns null for negative numbers", () => {
    expect(parseAmount("-123")).toBeNull();
  });

  it("returns null for decimals", () => {
    expect(parseAmount("12.34")).toBeNull();
  });
});
