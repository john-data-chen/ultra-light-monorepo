import * as m from "$lib/paraglide/messages";

export type TransactionType = "income" | "expense";

export const INCOME_CATEGORIES = ["Salary", "Bonus", "Investment", "Other Income"] as const;

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Shopping",
  "Medical",
  "Other Expense"
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type Category = IncomeCategory | ExpenseCategory;

/** Every category across both types (income first) — for "all categories" filters. */
export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as const;

/** Fixed category list for a given transaction type. */
export function categoriesFor(type: TransactionType): readonly string[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

/** True when `category` belongs to the fixed list for `type`. */
export function isValidCategory(type: TransactionType, category: string): boolean {
  return categoriesFor(type).includes(category);
}

/** True when the string is one of the two supported transaction types. */
export function isTransactionType(value: string): value is TransactionType {
  return value === "income" || value === "expense";
}

// Display-only localized labels. The English category string remains the canonical stored
// value (DB + `isValidCategory`); only the rendered text is localized.
const CATEGORY_LABELS: Record<Category, () => string> = {
  Salary: m.category_salary,
  Bonus: m.category_bonus,
  Investment: m.category_investment,
  "Other Income": m.category_other_income,
  Food: m.category_food,
  Transport: m.category_transport,
  Housing: m.category_housing,
  Entertainment: m.category_entertainment,
  Shopping: m.category_shopping,
  Medical: m.category_medical,
  "Other Expense": m.category_other_expense
};

/** Localized display label for a stored category key; falls back to the key itself. */
export function categoryLabel(category: string): string {
  const label = CATEGORY_LABELS[category as Category];
  return label ? label() : category;
}
