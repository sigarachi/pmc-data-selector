import { FilteredRequest } from "./common";

export type CreatePmcDto = {
  name: string;
};

export type PmcFilters = FilteredRequest<CreatePmcDto, "name">;

export type UpdatePmcDto = {
  name?: string;
  hasTracks?: boolean;
};
