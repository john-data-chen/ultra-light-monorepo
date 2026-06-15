import * as audit from "$lib/server/db/audit";
import * as queries from "$lib/server/db/queries";
import type { Transaction } from "$lib/server/db/schema";
import { ErrorResponse, TransactionResponse } from "$lib/server/schemas";
import type { RequestEvent } from "@sveltejs/kit";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { GET, POST } from "./+server";
import { GET as GET_ID, PATCH, DELETE } from "./[id]/+server";

vi.mock("$lib/server/db/queries", () => ({
  listTransactionsPaged: vi.fn(),
  getTransaction: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn()
}));

vi.mock("$lib/server/db/audit", () => ({
  recordAudit: vi.fn()
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

import { resetRateLimitStore } from "$lib/server/rate-limit";

function createMockEvent(
  user: any = { id: 1, name: "Test", role: "member" },
  params = {},
  url = new URL("http://localhost"),
  body: any = null
): RequestEvent {
  return {
    locals: { user } as App.Locals,
    params,
    url,
    request: {
      json: vi.fn().mockResolvedValue(body)
    },
    getClientAddress: vi.fn(() => "127.0.0.1"),
    setHeaders: vi.fn()
  } as unknown as RequestEvent;
}

describe("API: /api/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
  });

  describe("GET /api/transactions", () => {
    it("throws 401 if unauthorized and matches ErrorResponse shape", async () => {
      const event = createMockEvent(null);
      // Because we mock SvelteKit's error() to throw, we assert the thrown payload
      await expect(GET(event)).rejects.toMatchObject({
        status: 401,
        message: { message: "Unauthorized" }
      });
    });

    it("returns 200 with enveloped list of transactions and defaults", async () => {
      const event = createMockEvent();
      const mockTx: Transaction = {
        id: 1,
        userId: 1,
        type: "expense",
        category: "Food",
        amount: 10,
        occurredOn: "2023-01-01",
        note: null,
        createdAt: new Date()
      };
      vi.mocked(queries.listTransactionsPaged).mockResolvedValue({ rows: [mockTx], total: 1 });

      const res = await GET(event);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(() => TransactionResponse.parse(body.data[0])).not.toThrow();
      expect(body.data).toEqual([{ ...mockTx, createdAt: mockTx.createdAt.toISOString() }]);
      expect(body.pagination).toEqual({ total: 1, limit: 20, offset: 0 });
      expect(queries.listTransactionsPaged).toHaveBeenCalledWith(1, {
        limit: 20,
        offset: 0
      });
    });

    it("parses query parameters and passes them", async () => {
      const url = new URL("http://localhost?category=Food&month=2023-01&limit=50&offset=10");
      const event = createMockEvent(undefined, {}, url);
      vi.mocked(queries.listTransactionsPaged).mockResolvedValue({ rows: [], total: 0 });

      const res = await GET(event);
      expect(res.status).toBe(200);
      expect(queries.listTransactionsPaged).toHaveBeenCalledWith(1, {
        category: "Food",
        month: "2023-01",
        limit: 50,
        offset: 10
      });
    });

    it("returns 400 for invalid query parameters and matches ErrorResponse shape", async () => {
      const url = new URL("http://localhost?month=invalid");
      const event = createMockEvent(undefined, {}, url);
      const res = await GET(event);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(() => ErrorResponse.parse(body)).not.toThrow();
      expect(body).toHaveProperty("message");
    });
  });

  describe("POST /api/transactions", () => {
    it("creates a transaction and records audit", async () => {
      const body = {
        type: "expense",
        category: "Food",
        amount: 10,
        occurredOn: "2023-01-01",
        note: "Lunch"
      };
      const event = createMockEvent(undefined, {}, undefined, body);

      const mockTx: Transaction = {
        id: 100,
        userId: 1,
        type: "expense",
        category: "Food",
        amount: 10,
        occurredOn: "2023-01-01",
        note: "Lunch",
        createdAt: new Date()
      };
      vi.mocked(queries.createTransaction).mockResolvedValue(mockTx);

      const res = await POST(event);
      expect(res.status).toBe(201);
      const responseBody = await res.json();
      expect(() => TransactionResponse.parse(responseBody)).not.toThrow();
      expect(responseBody).toEqual({ ...mockTx, createdAt: mockTx.createdAt.toISOString() });
      expect(queries.createTransaction).toHaveBeenCalledWith(1, body);
      expect(audit.recordAudit).toHaveBeenCalled();
    });

    it("returns 400 for invalid body and matches ErrorResponse shape", async () => {
      const event = createMockEvent(undefined, {}, undefined, { type: "invalid" });
      const res = await POST(event);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(() => ErrorResponse.parse(body)).not.toThrow();
      expect(body).toHaveProperty("message");
    });
  });

  describe("GET /api/transactions/[id]", () => {
    it("returns 404 if not found and matches ErrorResponse shape", async () => {
      const event = createMockEvent(undefined, { id: "999" });
      vi.mocked(queries.getTransaction).mockResolvedValue(null);
      const res = await GET_ID(event);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(() => ErrorResponse.parse(body)).not.toThrow();
      expect(body).toHaveProperty("message");
    });

    it("returns 200 with the transaction", async () => {
      const event = createMockEvent(undefined, { id: "1" });
      const mockTx: Transaction = {
        id: 1,
        userId: 1,
        type: "expense",
        category: "Food",
        amount: 10,
        occurredOn: "2023-01-01",
        note: null,
        createdAt: new Date()
      };
      vi.mocked(queries.getTransaction).mockResolvedValue(mockTx);
      const res = await GET_ID(event);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(() => TransactionResponse.parse(body)).not.toThrow();
      expect(body).toEqual({ ...mockTx, createdAt: mockTx.createdAt.toISOString() });
    });
  });

  describe("PATCH /api/transactions/[id]", () => {
    it("updates the transaction and records audit", async () => {
      const event = createMockEvent(undefined, { id: "1" }, undefined, { amount: 20 });
      const existing: Transaction = {
        id: 1,
        userId: 1,
        amount: 10,
        type: "expense",
        category: "Food",
        occurredOn: "2023-01-01",
        note: null,
        createdAt: new Date()
      };
      const updated: Transaction = { ...existing, amount: 20 };

      vi.mocked(queries.getTransaction).mockResolvedValue(existing);
      vi.mocked(queries.updateTransaction).mockResolvedValue(updated);

      const res = await PATCH(event);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(() => TransactionResponse.parse(body)).not.toThrow();
      expect(body).toEqual({ ...updated, createdAt: updated.createdAt.toISOString() });
      expect(queries.updateTransaction).toHaveBeenCalledWith(
        1,
        1,
        expect.objectContaining({ amount: 20 })
      );
      expect(audit.recordAudit).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/transactions/[id]", () => {
    it("deletes the transaction and records audit", async () => {
      const event = createMockEvent(undefined, { id: "1" });
      vi.mocked(queries.deleteTransaction).mockResolvedValue({
        id: 1,
        type: "expense",
        category: "Food",
        amount: 999
      });

      const res = await DELETE(event);
      expect(res.status).toBe(204);
      expect(queries.deleteTransaction).toHaveBeenCalledWith(1, 1);
      expect(audit.recordAudit).toHaveBeenCalled();
    });
  });
});
