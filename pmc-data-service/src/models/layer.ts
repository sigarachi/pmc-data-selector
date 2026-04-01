import { FilteredRequest } from "./common";

export type CreateLayerDto = {
  pmcId: string;
  name: string;
  date: Date;
};

export type LayerFilters = FilteredRequest<CreateLayerDto, "date">;
