import { type QueryState } from "./types";

interface QueryData {
  queryKey: any[];
  queryHash: string;
}

import { Subscribable } from "./subscribable";

export class Query<TData, TError> extends Subscribable {
  #promise: Promise<TData> | undefined;
  #queryKey: any[];
  #queryHash: string;
  #state: QueryState<TData, TError>;

  constructor(query: QueryData) {
    super();
    this.#queryKey = query.queryKey;
    this.#queryHash = query.queryHash;
    this.#promise = undefined;
    this.#state = {
      data: undefined,
      error: null,
      status: "pending",
      fetchStatus: "idle",
      dataUpdatedAt: 0,
    };
  }

  get queryKey(): any[] {
    return this.#queryKey;
  }

  get queryHash(): string {
    return this.#queryHash;
  }

  get state(): QueryState<TData, TError> {
    return this.#state;
  }

  setState(update: Partial<QueryState<TData, TError>>): void {
    this.#state = { ...this.#state, ...update };
    this.notify();
  }

  async fetch(fun: () => Promise<TData>): Promise<TData | undefined> {
    if (this.#promise) {
      return this.#promise;
    }

    this.setState({ fetchStatus: "fetching" });

    try {
      this.#promise = fun();
      const data = await this.#promise;

      this.setState({
        fetchStatus: "idle",
        data: data,
        status: "success",
        dataUpdatedAt: Date.now(),
      });

      return data;
    } catch (error: any) {
      this.setState({ fetchStatus: "idle", status: "error", error: error });
      throw error;
    } finally {
      this.#promise = undefined;
    }
  }
}
