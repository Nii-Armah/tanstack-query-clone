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

    expect(() => unsubscribe()).not.toThrow();
  });

  it("should notify all registered listeners", () => {
    const subscribable = new Subscribable();
    const listenerA = vi.fn();
    const listenerB = vi.fn();

    subscribable.subscribe(listenerA);
    subscribable.subscribe(listenerB);

    subscribable.notify();

    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
  });

  it("should safely handle a listener unsubscribing during a notification", () => {
    const subscribable = new Subscribable();

    const listenerB = vi.fn();
    const unsubscribeB = subscribable.subscribe(listenerB);

    const listenerC = vi.fn();

    const listenerA = vi.fn(() => {
      // Unsubscribe B during A's execution
      unsubscribeB();
      subscribable.subscribe(listenerC);
    });

    subscribable.subscribe(listenerA);

    expect(() => subscribable.notify()).not.toThrow();

    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
    expect(listenerC).toHaveBeenCalledTimes(0); // C was not in initial notification batch

    // A subsequent notification should skip B
    subscribable.notify();
    expect(listenerA).toHaveBeenCalledTimes(2);
    expect(listenerB).toHaveBeenCalledTimes(1); // B was removed from notification batch
    expect(listenerC).toHaveBeenCalledTimes(1); // C is now in notification batch
  });
});
