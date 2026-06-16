import { describe, it, expect } from "vitest";

import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  ALL_CATEGORIES,
  categoriesFor,
  isValidCategory,
  isTransactionType
} from "./categories";

describe("categoriesFor", () => {
  it("returns income categories for income type", () => {
    expect(categoriesFor("income")).toEqual(INCOME_CATEGORIES);
  });

  it("returns expense categories for expense type", () => {
    expect(categoriesFor("expense")).toEqual(EXPENSE_CATEGORIES);
  });
});

describe("isValidCategory", () => {
  it("returns true for valid income category", () => {
    expect(isValidCategory("income", "Salary")).toBe(true);
  });

  it("returns true for valid expense category", () => {
    expect(isValidCategory("expense", "Food")).toBe(true);
  });

  it("returns false for invalid category", () => {
    expect(isValidCategory("income", "Food")).toBe(false);
    expect(isValidCategory("expense", "Salary")).toBe(false);
  });
});

describe("isTransactionType", () => {
  it("returns true for income", () => {
    expect(isTransactionType("income")).toBe(true);
  });

  it("returns true for expense", () => {
    expect(isTransactionType("expense")).toBe(true);
  });

  it("returns false for other strings", () => {
    expect(isTransactionType("transfer")).toBe(false);
    expect(isTransactionType("")).toBe(false);
  });
});

describe("ALL_CATEGORIES", () => {
  it("contains all income and expense categories", () => {
    expect(ALL_CATEGORIES).toHaveLength(INCOME_CATEGORIES.length + EXPENSE_CATEGORIES.length);
  });
});
