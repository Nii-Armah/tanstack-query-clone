import { describe, it, expect, vi } from "vitest";
import { Query } from "./query";

describe("Query", () => {
  it("should initialize with the correct default state", () => {
    const query = new Query({
      queryKey: ["user", 1],
      queryHash: '["user",1]',
    });

    expect(query.queryKey).toEqual(["user", 1]);
    expect(query.queryHash).toBe('["user",1]');
    expect(query.state).toEqual({
      data: undefined,
      error: null,
      status: "pending",
      fetchStatus: "idle",
      dataUpdatedAt: 0,
    });
  });

  it("should update state partially and preserve existing state", () => {
    const query = new Query({
      queryKey: ["user", 1],
      queryHash: '["user",1]',
    });

    query.setState({ fetchStatus: "fetching" });

    expect(query.state.fetchStatus).toBe("fetching");
    expect(query.state.status).toBe("pending");
    expect(query.state.dataUpdatedAt).toBe(0);
  });

  it("should notify subscribers when state is updated", () => {
    const query = new Query({
      queryKey: ["user", 1],
      queryHash: '["user",1]',
    });

    const listener = vi.fn();
    query.subscribe(listener);

    query.setState({ status: "success", data: { name: "Stanley" } as any });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(query.state.status).toBe("success");
    expect(query.state.data).toEqual({ name: "Stanley" });
  });

  it("should successfully execute a fetch function and update state", async () => {
    const query = new Query({
      queryKey: ["todos"],
      queryHash: '["todos"]',
    });

    const mockFn = vi
      .fn()
      .mockResolvedValue([{ id: 1, text: "Learn TanStack Query" }]);

    const promise = query.fetch(mockFn);

    // Immediately after calling fetch, fetchStatus should be fetching
    expect(query.state.fetchStatus).toBe("fetching");

    const data = await promise;

    expect(data).toEqual([{ id: 1, text: "Learn TanStack Query" }]);
    expect(query.state.status).toBe("success");
    expect(query.state.fetchStatus).toBe("idle");
    expect(query.state.data).toEqual([{ id: 1, text: "Learn TanStack Query" }]);
    expect(query.state.dataUpdatedAt).toBeGreaterThan(0);
  });

  it("should handle fetch errors and update status to error", async () => {
    const query = new Query({
      queryKey: ["todos"],
      queryHash: '["todos"]',
    });

    const mockError = new Error("Network failure");
    const mockFn = vi.fn().mockRejectedValue(mockError);

    // The promise itself should reject
    await expect(query.fetch(mockFn)).rejects.toThrow("Network failure");

    expect(query.state.status).toBe("error");
    expect(query.state.fetchStatus).toBe("idle");
    expect(query.state.error).toEqual(mockError);
  });

  it("should deduplicate concurrent fetches", async () => {
    const query = new Query({
      queryKey: ["todos"],
      queryHash: '["todos"]',
    });

    let callCount = 0;
    const mockFn = vi.fn().mockImplementation(() => {
      callCount++;
      return new Promise((resolve) => setTimeout(() => resolve("data"), 10));
    });

    // Fire two fetches simultaneously (do not await the first before calling the second)
    const promise1 = query.fetch(mockFn);
    const promise2 = query.fetch(mockFn);

    // Both should resolve to the same data
    const [data1, data2] = await Promise.all([promise1, promise2]);

    expect(data1).toBe("data");
    expect(data2).toBe("data");

    // The actual fetch function should only have been executed ONCE
    expect(callCount).toBe(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
