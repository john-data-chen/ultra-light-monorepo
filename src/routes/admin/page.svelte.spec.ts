import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import AdminPage from "./+page.svelte";

vi.mock("$lib/paraglide/messages", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/paraglide/messages")>();
  return {
    ...actual,
    audit_deleted_legacy: ({ id }: { id: string | number }) => `Deleted transaction #${id}`
  };
});

vi.mock("$lib/paraglide/runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/paraglide/runtime")>();
  return {
    ...actual,
    getLocale: () => "en"
  };
});

describe("Admin Page Component", () => {
  it("renders legacy delete summaries correctly", () => {
    const mockData = {
      users: [],
      recentAudits: [
        {
          id: 1,
          createdAt: new Date("2026-06-07T12:00:00Z"),
          actor: {
            id: 1,
            name: "Test Actor",
            avatar: "🤖",
            email: "test@example.com",
            role: "admin" as const,
            createdAt: new Date()
          },
          action: "delete" as const,
          entity: "transaction",
          entityId: 61,
          summary: "Deleted transaction 61"
        }
      ]
    };

    render(AdminPage, {
      props: {
        data: mockData as any,
        params: {} as any,
        form: null as any
      }
    });

    expect(screen.getAllByText("Deleted transaction #61").length).toBeGreaterThan(0);
  });

  it("renders structured delete summaries correctly", () => {
    const mockData = {
      users: [],
      recentAudits: [
        {
          id: 2,
          createdAt: new Date("2026-06-07T12:00:00Z"),
          actor: {
            id: 1,
            name: "Test Actor",
            avatar: "🤖",
            email: "test@example.com",
            role: "admin" as const,
            createdAt: new Date()
          },
          action: "delete" as const,
          entity: "transaction",
          entityId: 62,
          summary: "expense Food 999"
        }
      ]
    };

    render(AdminPage, {
      props: {
        data: mockData as any,
        params: {} as any,
        form: null as any
      }
    });

    expect(screen.getAllByText(/Food/).length).toBeGreaterThan(0);
  });
});
