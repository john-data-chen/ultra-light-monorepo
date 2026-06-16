import { describe, expect, it, vi } from "vitest";

vi.mock("$lib/paraglide/messages", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/paraglide/messages")>();
  return {
    ...actual,
    category_salary: () => "Salary (translated)",
    category_food: () => "Food (translated)"
  };
});

import {
  categoriesFor,
  categoryLabel,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  isTransactionType,
  isValidCategory
} from "./categories";

describe("categoriesFor", () => {
  it("returns the income list for income", () => {
    expect(categoriesFor("income")).toEqual(INCOME_CATEGORIES);
  });
  it("returns the expense list for expense", () => {
    expect(categoriesFor("expense")).toEqual(EXPENSE_CATEGORIES);
  });
});

describe("isValidCategory", () => {
  it("accepts a category that belongs to the type", () => {
    expect(isValidCategory("income", "Salary")).toBe(true);
    expect(isValidCategory("expense", "Food")).toBe(true);
  });
  it("rejects a category from the other type", () => {
    expect(isValidCategory("income", "Food")).toBe(false);
  });
  it("rejects an unknown category", () => {
    expect(isValidCategory("expense", "Crypto")).toBe(false);
  });
});

describe("isTransactionType", () => {
  it("accepts income and expense", () => {
    expect(isTransactionType("income")).toBe(true);
    expect(isTransactionType("expense")).toBe(true);
  });
  it("rejects anything else", () => {
    expect(isTransactionType("transfer")).toBe(false);
  });
});

describe("categoryLabel", () => {
  it("translates a valid category", () => {
    expect(categoryLabel("Salary")).toBe("Salary (translated)");
    expect(categoryLabel("Food")).toBe("Food (translated)");
  });

  it("falls back to the key for an invalid category", () => {
    expect(categoryLabel("NonExistent")).toBe("NonExistent");
  });
});
