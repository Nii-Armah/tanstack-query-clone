import { describe, it, expect, vi } from "vitest";
import { QueryCache } from "./queryCache";

// Mock Query class representation for now
class MockQuery {
  queryKey: readonly unknown[];
  queryHash: string;
  constructor(key: readonly unknown[], hash: string) {
    this.queryKey = key;
    this.queryHash = hash;
  }
}

describe("QueryCache", () => {
  it("should initialize empty", () => {
    const cache = new QueryCache();
    expect(cache.getAll()).toHaveLength(0);
  });

  it("should add and retrieve a query", () => {
    const cache = new QueryCache();
    const query = new MockQuery(["todos"], JSON.stringify(["todos"])) as any;

    cache.add(query);
    expect(cache.get(query.queryHash)).toBe(query);
    expect(cache.getAll()).toHaveLength(1);
  });

  it("should remove a query from the cache", () => {
    const cache = new QueryCache();
    const query = new MockQuery(["todos"], JSON.stringify(["todos"])) as any;

    cache.add(query);
    expect(cache.getAll()).toHaveLength(1);

    cache.remove(query);
    expect(cache.get(query.queryHash)).toBeUndefined();
    expect(cache.getAll()).toHaveLength(0);
  });

  it("should clear all queries", () => {
    const cache = new QueryCache();

    const query1 = new MockQuery(
      ["todos", 1],
      JSON.stringify(["todos", 1]),
    ) as any;

    const query2 = new MockQuery(
      ["todos", 2],
      JSON.stringify(["todos", 2]),
    ) as any;

    cache.add(query1);
    cache.add(query2);
    expect(cache.getAll()).toHaveLength(2);

    cache.clear();
    expect(cache.getAll()).toHaveLength(0);
  });
});
