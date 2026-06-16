import { z } from "zod";

import { isValidCategory } from "./categories";
import { isValidDate } from "./date";

const TransactionCreateBase = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string(),
  amount: z.number().int().positive(),
  occurredOn: z.string().refine(isValidDate, "Invalid date"),
  note: z.string().nullable()
});

export const TransactionCreate = TransactionCreateBase.superRefine((data, ctx) => {
  if (!isValidCategory(data.type, data.category)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid category", path: ["category"] });
  }
}).meta({ id: "TransactionCreate" });

export const TransactionUpdate = TransactionCreateBase.partial().meta({ id: "TransactionUpdate" });

export const TransactionResponse = z
  .object({
    id: z.number().int(),
    userId: z.number().int(),
    type: z.string(),
    category: z.string(),
    amount: z.number().int(),
    occurredOn: z.string(),
    note: z.string().nullable(),
    createdAt: z.string().datetime()
  })
  .meta({ id: "TransactionResponse" });

export const ErrorResponse = z
  .object({
    message: z.string()
  })
  .meta({ id: "ErrorResponse" });

export const MonthString = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM")
  .meta({ id: "MonthString" });

export const TransactionListQuery = z
  .object({
    category: z.string().optional(),
    month: MonthString.optional(),
    limit: z.coerce.number().int().nonnegative().default(20),
    offset: z.coerce.number().int().nonnegative().default(0)
  })
  .meta({ id: "TransactionListQuery" });

export const PaginationInfo = z
  .object({
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative()
  })
  .meta({ id: "PaginationInfo" });

export const TransactionListResponse = z
  .object({
    data: z.array(TransactionResponse),
    pagination: PaginationInfo
  })
  .meta({ id: "TransactionListResponse" });
