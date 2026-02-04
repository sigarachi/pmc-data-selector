import type { FilteredRequest } from "../common/interfaces";

export type ParamType = "coords" | "number" | "date" | "string";

export type Param = {
  id: string;
  name: string;
  value: string;
  type: ParamType;
  pmcId: string;
};

export type ParamFilters = FilteredRequest<Param, "name" | "value" | "type">;

export type CreateParam = Omit<Param, "id">;

export type ListReponse = {
  params: Array<Param>;
};
