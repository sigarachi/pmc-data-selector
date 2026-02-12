import { FilteredRequest } from "./common";

export type CreatePmcDto = {
  name: string;
};

export type PmcFilters = FilteredRequest<CreatePmcDto, "name">;
