export type FilterCondition = "equals" | "not";

export type Filter<T, K extends keyof T> = {
  field: K;
  condition: FilterCondition;
  value: T[K];
};

export type FilteredRequest<T, K extends keyof T> = {
  filters: Array<Filter<T, K>>;
};

export type DbFilter<T> = {
  [K in keyof T]?:
    | {
        [J in FilterCondition]?: T[K];
      }
    | T[K];
};
