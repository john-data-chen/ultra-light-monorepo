import { goto } from "$app/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSortedTable, headerLabel } from "./sorted-table.svelte";

const { mockState } = vi.hoisted(() => ({
  mockState: {
    page: {
      url: new URL("http://localhost/")
    }
  }
}));

vi.mock("$app/state", () => ({
  get page() {
    return mockState.page;
  }
}));

vi.mock("$app/navigation", () => ({
  goto: vi.fn()
}));

describe("sorted-table", () => {
  const columns = [
    {
      accessorKey: "id",
      header: "ID"
    },
    {
      accessorKey: "name",
      header: () => "Name"
    }
  ];

  const testData = [
    { id: 2, name: "Bob" },
    { id: 1, name: "Alice" }
  ];

  beforeEach(() => {
    mockState.page.url = new URL("http://localhost/");
    vi.mocked(goto).mockClear();
  });

  it("headerLabel handles function and string headers correctly", () => {
    const table = createSortedTable({
      data: () => testData,
      columns
    });

    const headerGroups = table.headerGroups;
    expect(headerGroups.length).toBe(1);

    const headers = headerGroups[0].headers;
    expect(headerLabel(headers[0])).toBe("ID");
    expect(headerLabel(headers[1])).toBe("Name");
  });

  it("initializes sorting empty when no sort in URL and no default", () => {
    const table = createSortedTable({
      data: () => testData,
      columns
    });

    expect(table.sorting).toEqual([]);
    expect(table.rows.map((r) => r.original.id)).toEqual([2, 1]); // order unchanged without sort
  });

  it("initializes sorting from defaultSort when no sort in URL", () => {
    const table = createSortedTable({
      data: () => testData,
      columns,
      defaultSort: [{ id: "id", desc: false }]
    });

    expect(table.sorting).toEqual([{ id: "id", desc: false }]);
  });

  it("initializes sorting from URL search parameters", () => {
    mockState.page.url = new URL("http://localhost/?sort=id&dir=desc");
    const table = createSortedTable({
      data: () => testData,
      columns
    });

    expect(table.sorting).toEqual([{ id: "id", desc: true }]);
  });

  it("updates URL and calls goto when sorting changes", () => {
    const table = createSortedTable({
      data: () => testData,
      columns
    });

    // Locate the first header and toggle sorting
    const headerGroups = table.headerGroups;
    const firstHeader = headerGroups[0].headers[0];

    // Simulate column header click/sorting toggle to ascending (false)
    firstHeader.column.toggleSorting(false);

    expect(goto).toHaveBeenCalled();
    const calledUrl = vi.mocked(goto).mock.calls[0][0] as URL;
    expect(calledUrl.searchParams.get("sort")).toBe("id");
    expect(calledUrl.searchParams.get("dir")).toBe("asc");
  });
});
