import { create, getList } from "@db/params";
import { CreateParamDto, ParamFilters } from "../models/param";
import { DbFilter } from "../models/common";

export class ParamsService {
  static async getList(pmcId: string, filters?: ParamFilters["filters"]) {
    const preparedFilters: DbFilter<CreateParamDto> = {};

    if (filters) {
      filters.forEach((filter) => {
        preparedFilters[filter.field] = {
          [filter.condition]: filter.value,
        };
      });
    }

    return getList(pmcId, preparedFilters);
  }

  static async create(pmcId: string, values: CreateParamDto) {
    return create(pmcId, values);
  }
}
