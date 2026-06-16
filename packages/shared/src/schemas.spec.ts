import { describe, it, expect } from "vitest";

import {
  TransactionCreate,
  TransactionUpdate,
  TransactionResponse,
  ErrorResponse,
  MonthString,
  TransactionListQuery,
  TransactionListResponse
} from "./schemas";

describe("TransactionCreate", () => {
  it("accepts valid transaction data", () => {
    const result = TransactionCreate.safeParse({
      type: "expense",
      category: "Food",
      amount: 100,
      occurredOn: "2026-06-15",
      note: null
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid category", () => {
    const result = TransactionCreate.safeParse({
      type: "expense",
      category: "InvalidCat",
      amount: 100,
      occurredOn: "2026-06-15",
      note: null
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date", () => {
    const result = TransactionCreate.safeParse({
      type: "expense",
      category: "Food",
      amount: 100,
      occurredOn: "not-a-date",
      note: null
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive amount", () => {
    const result = TransactionCreate.safeParse({
      type: "expense",
      category: "Food",
      amount: 0,
      occurredOn: "2026-06-15",
      note: null
    });
    expect(result.success).toBe(false);
  });
});

describe("TransactionUpdate", () => {
  it("accepts partial update", () => {
    const result = TransactionUpdate.safeParse({ amount: 200 });
    expect(result.success).toBe(true);
  });

  it("accepts empty update", () => {
    const result = TransactionUpdate.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("TransactionResponse", () => {
  it("accepts valid response shape", () => {
    const result = TransactionResponse.safeParse({
      id: 1,
      userId: 1,
      type: "expense",
      category: "Food",
      amount: 100,
      occurredOn: "2026-06-15",
      note: null,
      createdAt: "2026-06-15T10:00:00.000Z"
    });
    expect(result.success).toBe(true);
  });
});

describe("ErrorResponse", () => {
  it("accepts message string", () => {
    expect(ErrorResponse.safeParse({ message: "Not Found" }).success).toBe(true);
  });
});

describe("MonthString", () => {
  it("accepts YYYY-MM format", () => {
    expect(MonthString.safeParse("2026-06").success).toBe(true);
  });

  it("rejects invalid format", () => {
    expect(MonthString.safeParse("2026/06").success).toBe(false);
  });
});

describe("TransactionListQuery", () => {
  it("accepts valid query", () => {
    const result = TransactionListQuery.safeParse({ month: "2026-06", limit: 10 });
    expect(result.success).toBe(true);
  });

  it("applies defaults", () => {
    const result = TransactionListQuery.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
      expect(result.data.offset).toBe(0);
    }
  });
});

describe("TransactionListResponse", () => {
  it("accepts valid list response", () => {
    const result = TransactionListResponse.safeParse({
      data: [],
      pagination: { total: 0, limit: 20, offset: 0 }
    });
    expect(result.success).toBe(true);
  });
});
