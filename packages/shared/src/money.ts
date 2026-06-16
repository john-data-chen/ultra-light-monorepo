// TWD only, stored and handled as integers (no decimals).

/** Format an integer amount with thousands separators, e.g. 12345 → "12,345". */
export function formatAmount(amount: number): string {
  return Math.trunc(amount).toLocaleString("en-US");
}

/** Format an integer amount as TWD, e.g. 12345 → "NT$12,345". */
export function formatTWD(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}NT$${formatAmount(Math.abs(amount))}`;
}

/**
 * Parse user input (may contain commas/spaces) into a non-negative integer.
 * Returns null when the input is not a plain non-negative integer.
 */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[,\s]/g, "");
  if (!/^\d+$/.test(cleaned)) {
    return null;
  }
  const value = Number(cleaned);
  return Number.isSafeInteger(value) ? value : null;
}
