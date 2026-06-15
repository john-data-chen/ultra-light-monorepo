import { describe, expect, it } from "vitest";

import { parseLoginEmail, parseTransactionForm } from "./validation";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("parseTransactionForm", () => {
  it("parses a valid expense and coerces the amount to an integer", () => {
    const result = parseTransactionForm(
      form({
        type: "expense",
        category: "Food",
        amount: "320",
        occurredOn: "2026-06-02",
        note: "lunch"
      })
    );
    expect(result).toEqual({
      ok: true,
      data: {
        type: "expense",
        category: "Food",
        amount: 320,
        occurredOn: "2026-06-02",
        note: "lunch"
      }
    });
  });

  it("normalises a blank note to null", () => {
    const result = parseTransactionForm(
      form({
        type: "income",
        category: "Salary",
        amount: "60000",
        occurredOn: "2026-06-01",
        note: "   "
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.note).toBeNull();
    }
  });

  it("rejects a category that does not belong to the type", () => {
    const result = parseTransactionForm(
      form({ type: "income", category: "Food", amount: "100", occurredOn: "2026-06-01", note: "" })
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a non-positive amount", () => {
    const result = parseTransactionForm(
      form({ type: "expense", category: "Food", amount: "0", occurredOn: "2026-06-01", note: "" })
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a malformed date", () => {
    const result = parseTransactionForm(
      form({ type: "expense", category: "Food", amount: "100", occurredOn: "June 1", note: "" })
    );
    expect(result.ok).toBe(false);
  });

  it("rejects an unknown transaction type", () => {
    const result = parseTransactionForm(
      form({
        type: "transfer",
        category: "Food",
        amount: "100",
        occurredOn: "2026-06-01",
        note: ""
      })
    );
    expect(result.ok).toBe(false);
  });

  it("uses default blank strings when fields are missing from the form", () => {
    const result = parseTransactionForm(new FormData());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.values).toEqual({
        type: "",
        category: "",
        amount: "",
        occurredOn: "",
        note: ""
      });
    }
  });
});

describe("parseLoginEmail", () => {
  it("accepts a valid email and normalises case and surrounding whitespace", () => {
    const result = parseLoginEmail(form({ email: "  John@Example.COM  " }));
    expect(result).toEqual({ ok: true, email: "john@example.com" });
  });

  it("rejects a missing or whitespace-only email", () => {
    expect(parseLoginEmail(new FormData()).ok).toBe(false);
    expect(parseLoginEmail(form({ email: "   " })).ok).toBe(false);
  });

  it("rejects a malformed email and echoes back the normalised value", () => {
    const result = parseLoginEmail(form({ email: "Not-An-Email" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.email).toBe("not-an-email");
    }
  });
});
