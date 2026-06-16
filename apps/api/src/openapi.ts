export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Ultra Light API",
    version: "0.1.0",
    description: "Expense tracker API — Hono.js + Prisma 7 + PostgreSQL"
  },
  servers: [{ url: "http://localhost:3001", description: "Local development" }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "session",
        description: "Session cookie set by POST /api/login"
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: { message: { type: "string" } },
        required: ["message"]
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          avatar: { type: "string" },
          role: { type: "string", enum: ["admin", "member"] }
        },
        required: ["id", "name", "avatar", "role"]
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          type: { type: "string", enum: ["income", "expense"] },
          category: { type: "string" },
          amount: { type: "integer", description: "Amount in whole TWD" },
          occurredOn: { type: "string", format: "date", example: "2025-01-15" },
          note: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" }
        },
        required: ["id", "userId", "type", "category", "amount", "occurredOn", "note", "createdAt"]
      },
      TransactionCreate: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["income", "expense"] },
          category: { type: "string" },
          amount: { type: "integer", minimum: 1 },
          occurredOn: { type: "string", format: "date", description: "YYYY-MM-DD" },
          note: { type: "string", nullable: true }
        },
        required: ["type", "category", "amount", "occurredOn"]
      },
      TransactionUpdate: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["income", "expense"] },
          category: { type: "string" },
          amount: { type: "integer", minimum: 1 },
          occurredOn: { type: "string", format: "date" },
          note: { type: "string", nullable: true }
        }
      },
      PaginationInfo: {
        type: "object",
        properties: {
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" }
        },
        required: ["total", "limit", "offset"]
      },
      TransactionListResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Transaction" } },
          pagination: { $ref: "#/components/schemas/PaginationInfo" }
        },
        required: ["data", "pagination"]
      },
      MonthlyStats: {
        type: "object",
        properties: {
          income: { type: "integer" },
          expense: { type: "integer" },
          balance: { type: "integer" },
          expenseByCategory: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                amount: { type: "integer" }
              },
              required: ["category", "amount"]
            }
          }
        },
        required: ["income", "expense", "balance", "expenseByCategory"]
      },
      UserWithStats: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string" },
          avatar: { type: "string" },
          role: { type: "string", enum: ["admin", "member"] },
          transactionCount: { type: "integer" },
          totalIncome: { type: "integer" },
          totalExpense: { type: "integer" }
        },
        required: [
          "id",
          "name",
          "email",
          "avatar",
          "role",
          "transactionCount",
          "totalIncome",
          "totalExpense"
        ]
      },
      AuditEntry: {
        type: "object",
        properties: {
          id: { type: "integer" },
          action: { type: "string", enum: ["create", "update", "delete"] },
          entityType: { type: "string" },
          entityId: { type: "integer", nullable: true },
          summary: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          actor: { $ref: "#/components/schemas/User" }
        },
        required: ["id", "action", "entityType", "entityId", "summary", "createdAt", "actor"]
      }
    }
  },
  paths: {
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        description: "Returns the authenticated user from the session cookie.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Current user",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } }
          },
          "401": {
            description: "Not authenticated",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } }
            }
          }
        }
      }
    },
    "/api/login": {
      post: {
        tags: ["Auth"],
        summary: "Sign in",
        description: "Authenticate by email. Sets a session cookie on success.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { email: { type: "string", format: "email" } },
                required: ["email"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Logged in",
            content: {
              "application/json": {
                schema: { type: "object", properties: { message: { type: "string" } } }
              }
            }
          },
          "400": { description: "Email is required" },
          "401": { description: "User not found" }
        }
      }
    },
    "/api/login/logout": {
      post: {
        tags: ["Auth"],
        summary: "Sign out",
        description: "Clears the session cookie.",
        responses: {
          "200": {
            description: "Logged out",
            content: {
              "application/json": {
                schema: { type: "object", properties: { message: { type: "string" } } }
              }
            }
          }
        }
      }
    },
    "/api/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "List transactions",
        description: "List transactions for the authenticated user with pagination and filters.",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
            description: "Filter by category"
          },
          {
            name: "month",
            in: "query",
            schema: { type: "string", pattern: "^\\d{4}-\\d{2}$" },
            description: "Filter by month (YYYY-MM)"
          },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } }
        ],
        responses: {
          "200": {
            description: "Transaction list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TransactionListResponse" }
              }
            }
          },
          "400": { description: "Invalid query parameters" }
        }
      },
      post: {
        tags: ["Transactions"],
        summary: "Create transaction",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TransactionCreate" } }
          }
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Transaction" } }
            }
          },
          "400": { description: "Validation error" }
        }
      }
    },
    "/api/transactions/{id}": {
      get: {
        tags: ["Transactions"],
        summary: "Get transaction",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": {
            description: "Transaction",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Transaction" } }
            }
          },
          "404": { description: "Not found" }
        }
      },
      patch: {
        tags: ["Transactions"],
        summary: "Update transaction",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TransactionUpdate" } }
          }
        },
        responses: {
          "200": {
            description: "Updated",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Transaction" } }
            }
          },
          "404": { description: "Not found" }
        }
      },
      delete: {
        tags: ["Transactions"],
        summary: "Delete transaction",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "Deleted" },
          "404": { description: "Not found" }
        }
      }
    },
    "/api/stats": {
      get: {
        tags: ["Stats"],
        summary: "Monthly stats",
        description: "Get income/expense/balance summary for a given month.",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "month",
            in: "query",
            required: true,
            schema: { type: "string", pattern: "^\\d{4}-\\d{2}$" },
            description: "Month (YYYY-MM)"
          }
        ],
        responses: {
          "200": {
            description: "Monthly stats",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/MonthlyStats" } }
            }
          },
          "400": { description: "Missing or invalid month" }
        }
      }
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List users with stats",
        description: "Admin only. Returns all users with transaction counts and totals.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Users",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/UserWithStats" } }
              }
            }
          },
          "403": { description: "Forbidden" }
        }
      }
    },
    "/api/admin/audit": {
      get: {
        tags: ["Admin"],
        summary: "Recent audit log",
        description: "Admin only. Returns recent audit entries.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 50 } }],
        responses: {
          "200": {
            description: "Audit entries",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/AuditEntry" } }
              }
            }
          },
          "403": { description: "Forbidden" }
        }
      }
    }
  },
  tags: [
    { name: "Auth", description: "Authentication" },
    { name: "Transactions", description: "Transaction CRUD" },
    { name: "Stats", description: "Monthly statistics" },
    { name: "Admin", description: "Admin endpoints (requires admin role)" }
  ]
};
