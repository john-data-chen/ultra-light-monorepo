import { goto } from "$app/navigation";
import { page } from "$app/state";
import {
  type ColumnDef,
  type Header,
  type HeaderGroup,
  type Row,
  type RowData,
  type SortingState,
  type Updater,
  createTable,
  getCoreRowModel,
  getSortedRowModel
} from "@tanstack/table-core";

import { readSort, writeSort } from "./sort";

export interface SortedTable<T> {
  readonly headerGroups: HeaderGroup<T>[];
  readonly rows: Row<T>[];
  readonly sorting: SortingState;
}

interface SortedTableConfig<T extends RowData> {
  /** Reactive getter for the row data (e.g. `() => data.transactions`). */
  data: () => T[];
  columns: ColumnDef<T, unknown>[];
  /** URL param namespace, so multiple tables on one page never collide (e.g. "u."). */
  prefix?: string;
  /** Sort applied when the URL carries no sort for this table. */
  defaultSort?: SortingState;
}

/**
 * Client-side sortable table backed by `@tanstack/table-core`, with the active
 * sort mirrored to the URL (shareable, survives refresh).
 *
 * One persistent table instance is reused — its options are synced reactively
 * rather than the instance being re-created on every render.
 */
export function createSortedTable<T extends RowData>(config: SortedTableConfig<T>): SortedTable<T> {
  const prefix = config.prefix ?? "";
  const fromUrl = readSort(page.url.searchParams, prefix);
  let sorting = $state<SortingState>(fromUrl.length > 0 ? fromUrl : (config.defaultSort ?? []));

  function setSorting(updater: Updater<SortingState>) {
    sorting = typeof updater === "function" ? updater(sorting) : updater;
    const url = new URL(page.url);
    url.search = writeSort(page.url.searchParams, sorting, prefix).toString();
    goto(url, { replaceState: true, keepFocus: true, noScroll: true });
  }

  const table = createTable<T>({
    data: config.data(),
    columns: config.columns,
    state: {},
    onSortingChange: setSorting,
    onStateChange: () => {},
    renderFallbackValue: null,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  const view = $derived.by(() => {
    // Merge the full default state (columnPinning, columnOrder, …) so table-core
    // internals stay defined; only `sorting` is controlled by us.
    table.setOptions((prev) => ({
      ...prev,
      data: config.data(),
      state: { ...table.initialState, sorting }
    }));
    return {
      headerGroups: table.getHeaderGroups(),
      rows: table.getRowModel().rows
    };
  });

  return {
    get headerGroups() {
      return view.headerGroups;
    },
    get rows() {
      return view.rows;
    },
    get sorting() {
      return sorting;
    }
  };
}

/** Localized text for a column header (our headers are `() => string`). */
export function headerLabel<T>(header: Header<T, unknown>): string {
  const def = header.column.columnDef.header;
  if (typeof def === "function") {
    return String(def(header.getContext()));
  }
  return def ?? "";
}
