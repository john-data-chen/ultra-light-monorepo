import * as schemas from "./schemas";

let memoizedSpec: any = null;

export function getOpenApiSpec() {
  if (memoizedSpec) {
    return memoizedSpec;
  }

  memoizedSpec = {
    openapi: "3.1.0",
    info: {
      title: "Expense Tracker API",
      version: "1.0.0"
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "session"
        }
      },
      schemas: {
        TransactionCreate: schemas.TransactionCreate.toJSONSchema(),
        TransactionUpdate: schemas.TransactionUpdate.toJSONSchema(),
        TransactionResponse: schemas.TransactionResponse.toJSONSchema(),
        ErrorResponse: schemas.ErrorResponse.toJSONSchema(),
        TransactionListQuery: schemas.TransactionListQuery.toJSONSchema(),
        PaginationInfo: schemas.PaginationInfo.toJSONSchema(),
        TransactionListResponse: schemas.TransactionListResponse.toJSONSchema()
      },
      responses: {
        Unauthorized: {
          description: "Unauthorized",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } }
          }
        },
        NotFound: {
          description: "Not Found",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } }
          }
        },
        BadRequest: {
          description: "Bad Request",
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } }
          }
        }
      }
    },
    security: [{ cookieAuth: [] }],
    paths: {
      "/api/transactions": {
        get: {
          summary: "List transactions",
          parameters: [
            {
              name: "category",
              in: "query",
              schema: { type: "string" },
              required: false
            },
            {
              name: "month",
              in: "query",
              schema: { type: "string" },
              required: false,
              description: "Format: YYYY-MM"
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20 },
              required: false,
              description: "Max number of results to return (max 100)"
            },
            {
              name: "offset",
              in: "query",
              schema: { type: "integer", default: 0 },
              required: false,
              description: "Number of results to skip"
            }
          ],
          responses: {
            "200": {
              description: "A paginated list of transactions inside an envelope",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TransactionListResponse" }
                }
              }
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "400": { $ref: "#/components/responses/BadRequest" }
          }
        },
        post: {
          summary: "Create a new transaction",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TransactionCreate" }
              }
            }
          },
          responses: {
            "201": {
              description: "The created transaction",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TransactionResponse" }
                }
              }
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "400": { $ref: "#/components/responses/BadRequest" }
          }
        }
      },
      "/api/transactions/{id}": {
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        get: {
          summary: "Get a single transaction",
          responses: {
            "200": {
              description: "The transaction",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TransactionResponse" }
                }
              }
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "404": { $ref: "#/components/responses/NotFound" },
            "400": { $ref: "#/components/responses/BadRequest" }
          }
        },
        patch: {
          summary: "Update a transaction",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TransactionUpdate" }
              }
            }
          },
          responses: {
            "200": {
              description: "The updated transaction",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TransactionResponse" }
                }
              }
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "404": { $ref: "#/components/responses/NotFound" },
            "400": { $ref: "#/components/responses/BadRequest" }
          }
        },
        delete: {
          summary: "Delete a transaction",
          responses: {
            "204": { description: "Transaction deleted" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "404": { $ref: "#/components/responses/NotFound" },
            "400": { $ref: "#/components/responses/BadRequest" }
          }
        }
      },
      "/api/stats": {
        get: {
          summary: "Get monthly stats",
          parameters: [
            {
              name: "month",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Format: YYYY-MM"
            }
          ],
          responses: {
            "200": {
              description: "Monthly statistics",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      income: { type: "number" },
                      expense: { type: "number" },
                      balance: { type: "number" },
                      expenseByCategory: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            category: { type: "string" },
                            total: { type: "number" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "400": { $ref: "#/components/responses/BadRequest" }
          }
        }
      }
    }
  };

  return memoizedSpec;
}
