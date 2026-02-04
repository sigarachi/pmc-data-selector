import { ParamType } from "@prisma/client";
import { FilteredRequest } from "./common";

export type CreateParamDto = {
  name: string;
  value: string;
  type: ParamType;
};

export type ParamFilters = FilteredRequest<
  CreateParamDto,
  "name" | "type" | "value"
>;
