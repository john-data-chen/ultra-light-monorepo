import * as queries from "$lib/server/db/queries";
import { ErrorResponse } from "$lib/server/schemas";
import type { RequestEvent } from "@sveltejs/kit";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { GET } from "./+server";

vi.mock("$lib/server/db/queries", () => ({
  getMonthlyStats: vi.fn()
}));

vi.mock("@sveltejs/kit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@sveltejs/kit")>();
  return {
    ...actual,
    error: vi.fn((status, message) => {
      throw { status, message };
    })
  };
});

function createMockEvent(
  user: any = { id: 1 },
  url = new URL("http://localhost?month=2023-01")
): RequestEvent {
  return {
    locals: { user } as App.Locals,
    url
  } as unknown as RequestEvent;
}

describe("API: /api/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with stats for a valid month", async () => {
    const event = createMockEvent();
    const mockStats = { income: 100, expense: 50, balance: 50, expenseByCategory: [] };
    vi.mocked(queries.getMonthlyStats).mockResolvedValue(mockStats as any);

    const res = await GET(event);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockStats);
    expect(queries.getMonthlyStats).toHaveBeenCalledWith(1, "2023-01");
  });

  it("returns 400 for missing month and matches ErrorResponse shape", async () => {
    const event = createMockEvent(undefined, new URL("http://localhost"));
    const res = await GET(event);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(() => ErrorResponse.parse(body)).not.toThrow();
    expect(body).toHaveProperty("message");
  });

  it("returns 400 for invalid month format and matches ErrorResponse shape", async () => {
    const event = createMockEvent(undefined, new URL("http://localhost?month=invalid"));
    const res = await GET(event);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(() => ErrorResponse.parse(body)).not.toThrow();
    expect(body).toHaveProperty("message");
  });
});
