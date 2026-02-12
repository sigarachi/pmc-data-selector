export type FilterCondition = "equals" | "not" | "contains";

export type Filter<T, K extends keyof T> = {
  field: K;
  condition: FilterCondition;
  value: T[K];
};

export type FilteredRequest<T, K extends keyof T> = {
  filters: Array<Filter<T, K>>;
};

export type PaginatedResponse = {
  page: number;
  pageSize: number;
  isLastPage: boolean;
};
