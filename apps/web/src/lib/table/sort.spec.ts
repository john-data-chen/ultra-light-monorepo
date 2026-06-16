import { describe, it, expect } from "vitest";

import { readSort, writeSort } from "./sort";

describe("sort helpers", () => {
  describe("readSort", () => {
    it("returns empty array when no sort is in URL", () => {
      const params = new URLSearchParams();
      expect(readSort(params)).toEqual([]);
    });

    it("reads ascending sort from URL", () => {
      const params = new URLSearchParams("sort=name");
      expect(readSort(params)).toEqual([{ id: "name", desc: false }]);
    });

    it("reads descending sort from URL", () => {
      const params = new URLSearchParams("sort=date&dir=desc");
      expect(readSort(params)).toEqual([{ id: "date", desc: true }]);
    });

    it("reads prefixed sort from URL", () => {
      const params = new URLSearchParams("u.sort=role&u.dir=desc&sort=other");
      expect(readSort(params, "u.")).toEqual([{ id: "role", desc: true }]);
    });
  });

  describe("writeSort", () => {
    it("removes sort params when sorting is empty", () => {
      const params = new URLSearchParams("sort=name&other=1");
      const newParams = writeSort(params, []);
      expect(newParams.toString()).toBe("other=1");
    });

    it("writes ascending sort to URL", () => {
      const params = new URLSearchParams("other=1");
      const newParams = writeSort(params, [{ id: "name", desc: false }]);
      expect(newParams.toString()).toBe("other=1&sort=name&dir=asc");
    });

    it("writes descending sort to URL", () => {
      const params = new URLSearchParams("other=1");
      const newParams = writeSort(params, [{ id: "date", desc: true }]);
      expect(newParams.toString()).toBe("other=1&sort=date&dir=desc");
    });

    it("writes prefixed sort to URL without affecting other params", () => {
      const params = new URLSearchParams("sort=other&other=1");
      const newParams = writeSort(params, [{ id: "role", desc: true }], "u.");
      expect(newParams.get("sort")).toBe("other");
      expect(newParams.get("u.sort")).toBe("role");
      expect(newParams.get("u.dir")).toBe("desc");
      expect(newParams.get("other")).toBe("1");
    });
  });
});
