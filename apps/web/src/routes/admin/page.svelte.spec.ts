import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import AdminPage from "./+page.svelte";

vi.mock("$lib/paraglide/messages", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/paraglide/messages")>();
  return {
    ...actual,
    audit_deleted_legacy: ({ id }: { id: string | number }) => `Deleted transaction #${id}`,
    type_income: () => "Income",
    type_expense: () => "Expense",
    category_food: () => "Food",
    category_salary: () => "Salary",
    category_other_expense: () => "Other Expense"
  };
});

vi.mock("$lib/paraglide/runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/paraglide/runtime")>();
  return {
    ...actual,
    getLocale: () => "en"
  };
});

function makeAuditRow(
  id: number,
  summary: string | null,
  action: "create" | "update" | "delete" = "create"
) {
  return {
    id,
    createdAt: new Date("2026-06-07T12:00:00Z"),
    actor: {
      id: 1,
      name: "Test Actor",
      avatar: "🤖",
      email: "test@example.com",
      role: "admin" as const,
      createdAt: new Date()
    },
    action,
    entity: "transaction",
    entityId: id,
    summary
  };
}

describe("Admin Page Component", () => {
  it("renders legacy deleted-transaction summaries correctly", () => {
    render(AdminPage, {
      props: {
        data: {
          users: [],
          recentAudits: [makeAuditRow(1, "Deleted transaction 61", "delete")]
        } as any,
        params: {} as any,
        form: null as any
      }
    });
    expect(screen.getAllByText("Deleted transaction #61").length).toBeGreaterThan(0);
  });

  it("renders null summary as a dash", () => {
    render(AdminPage, {
      props: {
        data: { users: [], recentAudits: [makeAuditRow(2, null, "delete")] } as any,
        params: {} as any,
        form: null as any
      }
    });
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("renders new-format expense summary (en)", () => {
    render(AdminPage, {
      props: {
        data: { users: [], recentAudits: [makeAuditRow(3, "expense Food 999")] } as any,
        params: {} as any,
        form: null as any
      }
    });
    // en locale: "{catLabel} {tType} {sign} {fAmt}"
    expect(screen.getAllByText(/Food Expense - NT\$999/).length).toBeGreaterThan(0);
  });

  it("renders new-format income summary (en)", () => {
    render(AdminPage, {
      props: {
        data: { users: [], recentAudits: [makeAuditRow(4, "income Salary 5000")] } as any,
        params: {} as any,
        form: null as any
      }
    });
    expect(screen.getAllByText(/Salary Income \+ NT\$5,000/).length).toBeGreaterThan(0);
  });

  it("renders multi-word category correctly (en)", () => {
    render(AdminPage, {
      props: {
        data: {
          users: [],
          recentAudits: [makeAuditRow(5, "expense Other Expense 200")]
        } as any,
        params: {} as any,
        form: null as any
      }
    });
    expect(screen.getAllByText(/Other Expense Expense - NT\$200/).length).toBeGreaterThan(0);
  });

  it("renders legacy 'in ... for ...' format with translated labels (en)", () => {
    render(AdminPage, {
      props: {
        data: {
          users: [],
          recentAudits: [makeAuditRow(6, "expense in Food for 999")]
        } as any,
        params: {} as any,
        form: null as any
      }
    });
    // Legacy format is now parsed and translated, not shown raw
    expect(screen.getAllByText(/Food Expense - NT\$999/).length).toBeGreaterThan(0);
  });
});
