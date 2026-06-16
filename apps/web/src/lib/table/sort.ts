import type { SortingState } from "@tanstack/table-core";

export function readSort(searchParams: URLSearchParams, prefix = ""): SortingState {
  const sort = searchParams.get(`${prefix}sort`);
  const dir = searchParams.get(`${prefix}dir`);

  if (!sort) {
    return [];
  }

  return [
    {
      id: sort,
      desc: dir === "desc"
    }
  ];
}

export function writeSort(
  searchParams: URLSearchParams,
  sorting: SortingState,
  prefix = ""
): URLSearchParams {
  const newParams = new URLSearchParams(searchParams);

  if (sorting.length === 0) {
    newParams.delete(`${prefix}sort`);
    newParams.delete(`${prefix}dir`);
  } else {
    newParams.set(`${prefix}sort`, sorting[0].id);
    if (sorting[0].desc) {
      newParams.set(`${prefix}dir`, "desc");
    } else {
      newParams.set(`${prefix}dir`, "asc");
    }
  }

  return newParams;
}
