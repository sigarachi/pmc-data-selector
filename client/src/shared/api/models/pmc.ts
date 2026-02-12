import type { FilteredRequest, PaginatedResponse } from "../common/interfaces";

export type PMC = {
  id: string;
  name: string;
  hasTracks: boolean;
};

export type PmcFilters = FilteredRequest<PMC, "name">;

export type PmcListReponse = PaginatedResponse & {
  list: Array<PMC>;
};

export type PmcById = {
  pmc: PMC;
};
