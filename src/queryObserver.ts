import { QueryCache } from "./queryCache";
import { Query } from "./query";
import { Subscribable } from "./subscribable";
import { type Listener, type QueryState, type VoidFunction } from "./types";

interface QueryObserverOptions<TData> {
  queryKey: any[];
  queryHash: string;
  queryFn: () => Promise<TData>;
}

export class QueryObserver<TData, TError> extends Subscribable {
  #cache: QueryCache;
  #options: QueryObserverOptions<TData>;
  #query: Query<TData, TError>;

  constructor(cache: QueryCache, options: QueryObserverOptions<TData>) {
    super();

    let query = cache.get(options.queryKey);
    if (!query) {
      query = new Query<any, any>({
        queryKey: options.queryKey,
        queryHash: options.queryHash,
      });
      cache.add(query);
    }

    this.#cache = cache;
    this.#options = options;
    this.#query = query;
  }

  getCurrentResult(): QueryState<TData, TError> {
    return this.#query.state;
  }

  async fetch(): Promise<TData | undefined> {
    return await this.#query.fetch(this.#options.queryFn);
  }

  override subscribe(listener: Listener): VoidFunction {
    const unsubscribe_from_observer = super.subscribe(listener);
    const unsubscribe_from_query = this.#query.subscribe(() => this.notify());

    return () => {
      unsubscribe_from_query();
      unsubscribe_from_observer();
    };
  }
}
