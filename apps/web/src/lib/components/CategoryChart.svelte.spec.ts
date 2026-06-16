import { render, fireEvent, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import CategoryChart from "./CategoryChart.svelte";

vi.mock("$lib/paraglide/messages", () => ({
  no_expenses_this_month: () => "No expenses this month",
  action_sort_asc: () => "Sort Ascending",
  action_sort_desc: () => "Sort Descending",
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

describe("CategoryChart", () => {
  const sampleItems = [
    { category: "Food", total: 600 },
    { category: "Housing", total: 400 }
  ];
  const total = 1000;

  it("renders empty state message when no items", () => {
    render(CategoryChart, {
      props: {
        items: [],
        total: 0
      }
    });

    expect(screen.getByText("No expenses this month")).toBeTruthy();
  });

  it("renders chart and list items when data is provided", () => {
    const { container } = render(CategoryChart, {
      props: {
        items: sampleItems,
        total
      }
    });

    // Check category labels (e.g. food -> Food/Housing label resolution from categoryLabel)
    // food is resolved in categories as Food, housing is Housing
    expect(screen.getByText("Food")).toBeTruthy();
    expect(screen.getByText("Housing")).toBeTruthy();

    // Check formatted amounts and percentages
    expect(screen.getByText(/NT\$600 · 60%/)).toBeTruthy();
    expect(screen.getByText(/NT\$400 · 40%/)).toBeTruthy();

    // Check presence of conic-gradient in style
    const chartDiv = container.querySelector(".size-40.rounded-full");
    expect(chartDiv).toBeTruthy();
    const style = chartDiv?.getAttribute("style");
    expect(style).toContain("background");
    expect(style).toContain("conic-gradient");
  });

  it("toggles sorting when sort order button is clicked", async () => {
    render(CategoryChart, {
      props: {
        items: sampleItems,
        total
      }
    });

    // Default sorting is sortAscending = false, so it shows action_sort_desc option
    const sortBtn = screen.getByRole("button", { name: /Sort Descending/ });
    expect(sortBtn).toBeTruthy();

    await fireEvent.click(sortBtn);

    // Toggled state shows Sort Ascending label
    expect(screen.getByRole("button", { name: /Sort Ascending/ })).toBeTruthy();
  });
});
