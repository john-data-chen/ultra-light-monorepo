import type {
  AuditAction,
  AuditLog,
  Transaction as DbTransaction,
  User,
  UserRole
} from "./generated/client";

export type { AuditAction, AuditLog, User, UserRole };

/**
 * App-level transaction row. `occurred_on` is a date-only column; the query
 * layer exposes it as a "YYYY-MM-DD" string so date-only semantics survive
 * serialization without timezone drift.
 */
export type Transaction = Omit<DbTransaction, "occurredOn"> & { occurredOn: string };

export interface NewTransaction {
  userId: number;
  type: Transaction["type"];
  category: string;
  amount: number;
  occurredOn: string;
  note?: string | null;
}
