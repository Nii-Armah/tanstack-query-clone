import { describe, it, expect, vi } from "vitest";
import { Subscribable } from "./subscribable";

describe("Subscribable", () => {
  it("should initialize with no listeners", () => {
    const subscribable = new Subscribable();
    expect(subscribable.hasListeners()).toBe(false);
  });

  it("should add a listener and update hasListeners", () => {
    const subscribable = new Subscribable();
    const listener = vi.fn();

    subscribable.subscribe(listener);
    expect(subscribable.hasListeners()).toBe(true);
  });

  it("should remove a listener when the unsubscribe function is called", () => {
    const subscribable = new Subscribable();
    const listener = vi.fn();

    const unsubscribe = subscribable.subscribe(listener);
    expect(subscribable.hasListeners()).toBe(true);

    unsubscribe();
    expect(subscribable.hasListeners()).toBe(false);
  });

  it("should handle multiple subscribers independently", () => {
    const subscribable = new Subscribable();
    const listenerA = vi.fn();
    const listenerB = vi.fn();

    const unsubscribeA = subscribable.subscribe(listenerA);
    const unsubscribeB = subscribable.subscribe(listenerB);

    unsubscribeA();
    expect(subscribable.hasListeners()).toBe(true); // B is still active

    unsubscribeB();
    expect(subscribable.hasListeners()).toBe(false); // Both removed
  });

  it("should be safe to call unsubscribe multiple times", () => {
    const subscribable = new Subscribable();
    const listener = vi.fn();

    const unsubscribe = subscribable.subscribe(listener);
    unsubscribe();

    // Calling it again shouldn't throw an error or affect future listeners
    expect(() => unsubscribe()).not.toThrow();
  });
});
