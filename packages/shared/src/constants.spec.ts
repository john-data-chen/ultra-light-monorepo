import { describe, it, expect } from "vitest";

import { APP_NAME, DEMO_EMAIL, pageTitle } from "./constants";

describe("constants", () => {
  it("has correct app name", () => {
    expect(APP_NAME).toBe("Expense Tracker");
  });

  it("has correct demo email", () => {
    expect(DEMO_EMAIL).toBe("john@example.com");
  });
});

describe("pageTitle", () => {
  it("builds section + app name", () => {
    expect(pageTitle("Dashboard")).toBe("Dashboard · Expense Tracker");
  });

  it("handles empty section", () => {
    expect(pageTitle("")).toBe(" · Expense Tracker");
  });
});
