import { describe, it, expect, vi } from "vitest";
import { QueryCache } from "./queryCache";
import { QueryObserver } from "./queryObserver";
import { Query } from "./query";

describe("QueryObserver - Phase 4.1: Cache Connection", () => {
  it("should create a new query in the cache if it does not exist", () => {
    const cache = new QueryCache();
    const options = {
      queryKey: ["todos"],
      queryHash: '["todos"]',
      queryFn: vi.fn(),
    };
    const observer = new QueryObserver(cache, options);

    // The observer should have created the query and added it to the cache
    const query = cache.get(["todos"]);
    expect(query).toBeInstanceOf(Query);
    expect(query?.queryKey).toEqual(["todos"]);

    // getCurrentResult should proxy to the query's state
    expect(observer.getCurrentResult().status).toBe("pending");
  });

  it("should attach to an existing query if one already exists in the cache", () => {
    const cache = new QueryCache();

    // Pre-populate the cache
    const existingQuery = new Query({
      queryKey: ["todos"],
      queryHash: '["todos"]',
    });
    existingQuery.setState({ data: "cached data", status: "success" });
    cache.add(existingQuery);

    const options = {
      queryKey: ["todos"],
      queryHash: '["todos"]',
      queryFn: vi.fn(),
    };

    const observer = new QueryObserver(cache, options);

    // The observer should see the existing state
    const result = observer.getCurrentResult();
    expect(result.status).toBe("success");
    expect(result.data).toBe("cached data");

    // It should not have created a duplicate query
    expect(cache.getAll()).toHaveLength(1);
  });

  it("should trigger a fetch on the underlying query", async () => {
    const cache = new QueryCache();
    const mockFn = vi.fn().mockResolvedValue("test data");
    const options = {
      queryKey: ["todos"],
      queryHash: '["todos"]',
      queryFn: mockFn,
    };

    const observer = new QueryObserver(cache, options);

    // fetchStatus should be idle initially
    expect(observer.getCurrentResult().fetchStatus).toBe("idle");

    const promise = observer.fetch();

    // fetchStatus should immediately update
    expect(observer.getCurrentResult().fetchStatus).toBe("fetching");

    const data = await promise;
    expect(data).toBe("test data");
    expect(observer.getCurrentResult().status).toBe("success");
  });

  it("should forward notifications from the query to the observer subscribers", () => {
    const cache = new QueryCache();
    const options = {
      queryKey: ["todos"],
      queryHash: '["todos"]',
      queryFn: vi.fn(),
    };

    const observer = new QueryObserver(cache, options);
    const listener = vi.fn();

    // Subscribe to the observer
    const unsubscribe = observer.subscribe(listener);

    // // Manually force a state change on the underlying query to simulate an update
    // // (In a real app, query.fetch() handles this, but setState makes the test isolated)
    const query = cache.get(["todos"]);
    query!.setState({ status: "success" });

    // // The observer's listener should have been notified
    expect(listener).toHaveBeenCalledTimes(1);

    // // Ensure cleanup works
    unsubscribe();
    query!.setState({ status: "error" });

    // // The listener should NOT be called again after unsubscribing
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
