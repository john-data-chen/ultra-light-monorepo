import * as m from "$lib/paraglide/messages";
export type {
  TransactionType,
  IncomeCategory,
  ExpenseCategory,
  Category
} from "@ultra-light/shared";
export {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  ALL_CATEGORIES,
  categoriesFor,
  isValidCategory,
  isTransactionType
} from "@ultra-light/shared";

import type { Category } from "@ultra-light/shared";

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

export function categoryLabel(category: string): string {
  const label = CATEGORY_LABELS[category as Category];
  return label ? label() : category;
}
