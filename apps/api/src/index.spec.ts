import { createHmac } from "node:crypto";

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

vi.mock("@ultra-light/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn()
    },
    transaction: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    audit: {
      create: vi.fn(),
      findMany: vi.fn()
    }
  },
  listTransactionsPaged: vi.fn(),
  createTransaction: vi.fn(),
  getTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  recordAudit: vi.fn(),
  getMonthlyStats: vi.fn(),
  listUsersWithStats: vi.fn(),
  listRecentAudits: vi.fn()
}));

import {
  db,
  listTransactionsPaged,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  recordAudit,
  getMonthlyStats,
  listUsersWithStats,
  listRecentAudits
} from "@ultra-light/db";

import app from "./index.js";

const mockDb = vi.mocked(db) as any;

function makeSessionCookie(userId: number): string {
  const payload = String(userId);
  const signature = createHmac("sha256", "test-secret").update(payload).digest("base64url");
  return `session=${payload}.${signature}`;
}

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret";
});

afterAll(() => {
  delete process.env.SESSION_SECRET;
});

describe("GET /", () => {
  it("returns API info", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Ultra Light API");
  });
});

describe("GET /api/openapi.json", () => {
  it("returns OpenAPI spec", async () => {
    const res = await app.request("/api/openapi.json");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("Ultra Light API");
    expect(body.paths["/api/auth/me"]).toBeDefined();
  });
});

describe("Auth", () => {
  describe("GET /api/auth/me", () => {
    it("returns 401 without cookie", async () => {
      const res = await app.request("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("returns user with valid session", async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 1,
        name: "Test User",
        avatar: "👤",
        role: "member"
      });

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/auth/me", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(1);
      expect(body.name).toBe("Test User");
    });
  });

  describe("POST /api/login", () => {
    it("returns 400 without email", async () => {
      const res = await app.request("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      expect(res.status).toBe(400);
    });

    it("returns 401 for unknown email", async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const res = await app.request("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "unknown@test.com" })
      });
      expect(res.status).toBe(401);
    });

    it("sets session cookie on success", async () => {
      mockDb.user.findUnique.mockResolvedValue({ id: 1 });

      const res = await app.request("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@test.com" })
      });
      expect(res.status).toBe(200);
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain("session=");
    });
  });

  describe("POST /api/login/logout", () => {
    it("clears session cookie", async () => {
      const res = await app.request("/api/login/logout", {
        method: "POST"
      });
      expect(res.status).toBe(200);
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain("session=;");
    });
  });
});

describe("Transactions", () => {
  const mockTransaction = {
    id: 1,
    userId: 1,
    type: "expense",
    category: "Food",
    amount: 100,
    occurredOn: new Date("2025-01-15"),
    note: "Lunch",
    createdAt: new Date("2025-01-15T12:00:00Z")
  } as any;

  describe("GET /api/transactions", () => {
    it("lists transactions", async () => {
      vi.mocked(listTransactionsPaged).mockResolvedValue({
        rows: [mockTransaction],
        total: 1
      });

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions?month=2025-01", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.pagination.total).toBe(1);
    });

    it("lists all transactions without month filter", async () => {
      vi.mocked(listTransactionsPaged).mockResolvedValue({
        rows: [mockTransaction],
        total: 1
      });

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
    });
  });

  describe("POST /api/transactions", () => {
    it("creates a transaction", async () => {
      vi.mocked(createTransaction).mockResolvedValue(mockTransaction);
      vi.mocked(recordAudit).mockResolvedValue(undefined as never);

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie
        },
        body: JSON.stringify({
          type: "expense",
          category: "Food",
          amount: 100,
          occurredOn: "2025-01-15",
          note: "Lunch"
        })
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.id).toBe(1);
    });

    it("returns 400 with invalid data", async () => {
      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie
        },
        body: JSON.stringify({ type: "invalid" })
      });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/transactions/:id", () => {
    it("gets a transaction", async () => {
      vi.mocked(getTransaction).mockResolvedValue(mockTransaction);

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/1", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(1);
    });

    it("returns 404 for missing transaction", async () => {
      vi.mocked(getTransaction).mockResolvedValue(null);

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/999", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/transactions/:id", () => {
    it("deletes a transaction", async () => {
      vi.mocked(deleteTransaction).mockResolvedValue({ id: 1 } as any);
      vi.mocked(recordAudit).mockResolvedValue(undefined as never);

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/1", {
        method: "DELETE",
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(204);
    });
  });
});

describe("Stats", () => {
  describe("GET /api/stats", () => {
    it("returns monthly stats", async () => {
      vi.mocked(getMonthlyStats).mockResolvedValue({
        income: 5000,
        expense: 3000,
        balance: 2000,
        expenseByCategory: []
      });

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/stats?month=2025-01", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.income).toBe(5000);
    });

    it("returns 400 without month", async () => {
      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/stats", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(400);
    });
  });
});

describe("Admin", () => {
  describe("GET /api/admin/users", () => {
    it("returns 401 without auth", async () => {
      const res = await app.request("/api/admin/users");
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-admin", async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 1,
        name: "User",
        avatar: "👤",
        role: "member"
      });

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/admin/users", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(403);
    });

    it("returns users for admin", async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 1,
        name: "Admin",
        avatar: "👤",
        role: "admin"
      });
      vi.mocked(listUsersWithStats).mockResolvedValue([]);

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/admin/users", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(200);
    });
  });
});

describe("404", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await app.request("/api/unknown");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.message).toBe("Not Found");
  });
});

describe("types.ts", () => {
  it("exports AppEnv interface", async () => {
    const types = await import("./types.js");
    expect(types).toBeDefined();
    expect(typeof (types as any).SessionUser).toBe("undefined");
    const typeModule: any = await import("./types.js");
    expect(typeModule).toBeDefined();
  });
});

describe("vercel.ts", () => {
  it("exports a function (getRequestListener result)", async () => {
    const vercel = await import("./vercel.js");
    expect(vercel.default).toBeDefined();
    expect(typeof vercel.default).toBe("function");
  });
});

describe("Transactions - additional coverage", () => {
  describe("GET /api/transactions/:id with invalid ID", () => {
    it("returns 400 for non-numeric ID", async () => {
      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/foo", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toBe("Invalid ID");
    });
  });

  describe("PATCH /api/transactions/:id", () => {
    const stringDateTransaction = {
      id: 1,
      userId: 1,
      type: "expense",
      category: "Food",
      amount: 100,
      occurredOn: "2025-01-15",
      note: "Lunch",
      createdAt: new Date("2025-01-15T12:00:00Z")
    } as any;

    it("updates a transaction", async () => {
      vi.mocked(getTransaction).mockResolvedValue(stringDateTransaction);
      vi.mocked(updateTransaction).mockResolvedValue(stringDateTransaction);
      vi.mocked(recordAudit).mockResolvedValue(undefined as never);

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie
        },
        body: JSON.stringify({ amount: 200 })
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(1);
    });

    it("returns 400 for invalid ID", async () => {
      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/foo", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie
        },
        body: JSON.stringify({ amount: 200 })
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid JSON body", async () => {
      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie
        },
        body: "not json"
      });
      expect(res.status).toBe(400);
    });

    it("returns 400 for validation error", async () => {
      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie
        },
        body: JSON.stringify({ type: "invalid" })
      });
      expect(res.status).toBe(400);
    });

    it("returns 404 when transaction not found", async () => {
      vi.mocked(getTransaction).mockResolvedValue(null);

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/999", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie
        },
        body: JSON.stringify({ amount: 200 })
      });
      expect(res.status).toBe(404);
    });

    it("returns 404 when updateTransaction returns null", async () => {
      vi.mocked(getTransaction).mockResolvedValue(stringDateTransaction);
      vi.mocked(updateTransaction).mockResolvedValue(null);

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie
        },
        body: JSON.stringify({ amount: 200 })
      });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/transactions/:id", () => {
    it("returns 400 for invalid ID", async () => {
      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/foo", {
        method: "DELETE",
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(400);
    });

    it("returns 404 when transaction not found", async () => {
      vi.mocked(deleteTransaction).mockResolvedValue(null as any);

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions/999", {
        method: "DELETE",
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/transactions - invalid JSON", () => {
    it("returns 400 for non-JSON body", async () => {
      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Cookie: cookie
        },
        body: "not json"
      });
      expect(res.status).toBe(400);
    });
  });
});

describe("Auth - additional coverage", () => {
  describe("GET /api/auth/me", () => {
    it("returns 401 for invalid session cookie (tampered signature)", async () => {
      const cookie = makeSessionCookie(1);
      const tampered = cookie.replace(/([a-zA-Z0-9_-]+)$/, "tampered");
      const res = await app.request("/api/auth/me", {
        headers: { Cookie: tampered }
      });
      expect(res.status).toBe(401);
    });

    it("returns 401 when user not found after valid session", async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/auth/me", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(401);
    });
  });
});

describe("Auth middleware - missing user", () => {
  it("returns 401 when user not found via authMiddleware", async () => {
    mockDb.user.findUnique.mockResolvedValue(null);

    const cookie = makeSessionCookie(1);
    const res = await app.request("/api/transactions", {
      headers: { Cookie: cookie }
    });
    expect(res.status).toBe(401);
  });
});

describe("Admin - additional coverage", () => {
  describe("GET /api/admin/audit", () => {
    it("returns audit logs for admin", async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 1,
        name: "Admin",
        avatar: "👤",
        role: "admin"
      });
      vi.mocked(listRecentAudits).mockResolvedValue([
        { id: 1, userId: 1, action: "create", entity: "transaction", entityId: 1, detail: "test" }
      ] as any);

      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/admin/audit", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(1);
    });
  });
});

describe("Stats - additional coverage", () => {
  describe("GET /api/stats", () => {
    it("returns 400 for invalid month format", async () => {
      const cookie = makeSessionCookie(1);
      const res = await app.request("/api/stats?month=invalid", {
        headers: { Cookie: cookie }
      });
      expect(res.status).toBe(400);
    });
  });
});

describe("Error handler", () => {
  it("returns 500 when createTransaction throws", async () => {
    vi.mocked(createTransaction).mockRejectedValue(new Error("db error"));

    const cookie = makeSessionCookie(1);
    const res = await app.request("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie
      },
      body: JSON.stringify({
        type: "expense",
        category: "Food",
        amount: 100,
        occurredOn: "2025-01-15",
        note: "Lunch"
      })
    });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe("Internal Server Error");
  });
});

describe("Rate limit", () => {
  it("returns 429 after exceeding rate limit", async () => {
    const { resetRateLimitStore } = await import("./middleware/rate-limit.js");
    resetRateLimitStore();

    vi.mocked(createTransaction).mockResolvedValue({
      id: 1,
      userId: 1,
      type: "expense",
      category: "Food",
      amount: 100,
      occurredOn: new Date("2025-01-15"),
      note: null,
      createdAt: new Date("2025-01-15T12:00:00Z")
    } as any);
    vi.mocked(recordAudit).mockResolvedValue(undefined as never);

    const cookie = makeSessionCookie(1);
    const validBody = JSON.stringify({
      type: "expense",
      category: "Food",
      amount: 100,
      occurredOn: "2025-01-15",
      note: null
    });

    for (let i = 0; i < 101; i++) {
      await app.request("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: validBody
      });
    }

    const res = await app.request("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: validBody
    });
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.message).toBe("Too many requests");
  });
});
