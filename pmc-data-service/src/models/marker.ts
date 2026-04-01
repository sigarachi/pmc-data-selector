import { MarkerType } from "@prisma/client";
import { FilteredRequest } from "./common";

export type CreateMarkerDto = {
  pmcId: string;
  name: string;
  type: MarkerType;
  dateTime: Date;
  polygons: string;
};

export type MarkerFilters = FilteredRequest<
  CreateMarkerDto,
  "dateTime" | "type"
>;
