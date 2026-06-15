import { describe, expect, it } from "vitest";

import { APP_NAME, DEMO_EMAIL, pageTitle } from "./constants";

describe("constants", () => {
  it("has correct APP_NAME", () => {
    expect(APP_NAME).toBe("Expense Tracker");
  });

  it("has correct DEMO_EMAIL", () => {
    expect(DEMO_EMAIL).toBe("john@example.com");
  });

  it("generates correct pageTitle", () => {
    expect(pageTitle("Dashboard")).toBe("Dashboard · Expense Tracker");
    expect(pageTitle("Transactions")).toBe("Transactions · Expense Tracker");
  });
});
