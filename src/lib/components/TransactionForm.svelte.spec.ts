import { render, fireEvent, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import TransactionForm from "./TransactionForm.svelte";

vi.mock("$app/forms", () => ({
  enhance: vi.fn()
}));

vi.mock("$app/paths", () => ({
  resolve: vi.fn((href) => href)
}));

vi.mock("$lib/paraglide/messages", () => ({
  field_type: () => "Type",
  type_expense: () => "Expense",
  type_income: () => "Income",
  field_category: () => "Category",
  field_amount: () => "Amount",
  field_date: () => "Date",
  field_note: () => "Note",
  action_cancel: () => "Cancel",
  category_salary: () => "Salary",
  category_bonus: () => "Bonus",
  category_investment: () => "Investment",
  category_other_income: () => "Other Income",
  category_food: () => "Food",
  category_transport: () => "Transport",
  category_housing: () => "Housing",
  category_entertainment: () => "Entertainment",
  category_shopping: () => "Shopping",
  category_medical: () => "Medical",
  category_other_expense: () => "Other Expense"
}));

describe("TransactionForm", () => {
  const defaultValues = {
    type: "expense" as const,
    category: "Food",
    amount: "100",
    occurredOn: "2026-06-07",
    note: "Lunch"
  };

  it("renders the form with initial values correctly", () => {
    render(TransactionForm, {
      props: {
        values: { ...defaultValues },
        submitLabel: "Save"
      }
    });

    // Verify type inputs
    const expenseRadio = screen.getByLabelText("Expense") as HTMLInputElement;
    const incomeRadio = screen.getByLabelText("Income") as HTMLInputElement;
    expect(expenseRadio.checked).toBe(true);
    expect(incomeRadio.checked).toBe(false);

    // Verify category select
    const categorySelect = screen.getByLabelText("Category") as HTMLSelectElement;
    expect(categorySelect.value).toBe("Food");

    // Verify amount, date, and note fields
    const amountInput = screen.getByLabelText("Amount") as HTMLInputElement;
    expect(amountInput.value).toBe("100");

    const dateInput = screen.getByLabelText("Date") as HTMLInputElement;
    expect(dateInput.value).toBe("2026-06-07");

    const noteInput = screen.getByLabelText("Note") as HTMLInputElement;
    expect(noteInput.value).toBe("Lunch");

    // Verify submit button
    const submitBtn = screen.getByRole("button", { name: "Save" });
    expect(submitBtn).toBeTruthy();

    // Verify cancel link
    const cancelLink = screen.getByRole("link", { name: "Cancel" });
    expect(cancelLink).toBeTruthy();
    expect(cancelLink.getAttribute("href")).toBe("/transactions");
  });

  it("displays error message when error prop is provided", () => {
    render(TransactionForm, {
      props: {
        values: { ...defaultValues },
        submitLabel: "Save",
        error: "Failed to save transaction"
      }
    });

    const errorMsg = screen.getByText("Failed to save transaction");
    expect(errorMsg).toBeTruthy();
  });

  it("updates categories when type changes", async () => {
    render(TransactionForm, {
      props: {
        values: { ...defaultValues },
        submitLabel: "Save"
      }
    });

    const incomeRadio = screen.getByLabelText("Income");
    await fireEvent.click(incomeRadio);

    // After switching to income, categories should switch to income categories
    const categorySelect = screen.getByLabelText("Category") as HTMLSelectElement;

    // Income category option for 'salary' should exist
    const salaryOption = categorySelect.querySelector("option[value='salary']");
    expect(salaryOption).toBeTruthy();
  });
});
