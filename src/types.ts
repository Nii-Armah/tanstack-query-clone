export interface QueryState<TData, TError> {
  data: TData | undefined;
  error: TError | null;
  status: "pending" | "success" | "error";
  fetchStatus: "idle" | "fetching" | "paused";
  dataUpdatedAt: number;
}
