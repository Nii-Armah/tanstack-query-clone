import { type Listener } from "./types";

export class Subscribable {
  #listeners: Set<Listener>;

  constructor() {
    this.#listeners = new Set();
  }

  hasListeners(): boolean {
    return this.#listeners.size > 0;
  }

  subscribe(listener: Listener): VoidFunction {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  notify(): void {
    const listeners = new Set(this.#listeners);
    listeners.forEach((listener) => listener());
  }
}
