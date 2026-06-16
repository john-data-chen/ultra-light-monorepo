// Shared transaction-domain types (client + server). Server-only query types live
// under `$lib/server`.

/** Raw transaction form field values, as strings submitted by the browser. */
export interface TransactionFormValues {
  type: string;
  category: string;
  amount: string;
  occurredOn: string;
  note: string;
}
