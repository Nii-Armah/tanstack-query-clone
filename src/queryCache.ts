import { Subscribable } from "./subscribable";

type Query = any;

export class QueryCache extends Subscribable {
  #cache: Map<string, Query>;

  constructor() {
    super();
    this.#cache = new Map();
  }

  #hashQueryKey(queryKey: any[]): string {
    return JSON.stringify(queryKey);
  }

  getAll(): Query[] {
    return Array.from(this.#cache.values());
  }

  add(query: Query) {
    const hashedKey = this.#hashQueryKey(query.queryKey);
    this.#cache.set(hashedKey, query);
    this.notify();
  }

  get(queryKey: any[]): Query | undefined {
    const hashedKey = this.#hashQueryKey(queryKey);
    return this.#cache.get(hashedKey);
  }

  remove(query: Query): void {
    this.#cache.delete(query.queryHash);
    this.notify();
  }

  clear(): void {
    this.#cache.clear();
  }
}
