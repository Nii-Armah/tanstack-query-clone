type Query = any;

export class QueryCache {
  #cache: Map<string, Query>;

  constructor() {
    this.#cache = new Map();
  }

  getAll(): Query[] {
    return Array.from(this.#cache.values());
  }

  add(query: Query) {
    this.#cache.set(query.queryHash, query);
  }

  get(key: string): Query | undefined {
    return this.#cache.get(key);
  }

  remove(query: Query): void {
    this.#cache.delete(query.queryHash);
  }

  clear(): void {
    this.#cache.clear();
  }
}
