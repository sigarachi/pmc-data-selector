import { getById, getList, create, getByName, getCount } from "@db/pmc";
import { CreatePmcDto, PmcFilters } from "../models/pmc";
import { DbFilter } from "../models/common";

export class PmcService {
  static async getList(
    take: number,
    skip: number,
    filters?: PmcFilters["filters"],
  ) {
    const preparedFilters: DbFilter<CreatePmcDto> = {};

    if (filters) {
      filters.forEach((filter) => {
        preparedFilters[filter.field] = {
          [filter.condition]: filter.value,
        };
      });
    }

    return Promise.all([getList(take, skip, preparedFilters), getCount()]);
  }

  static async getById(id: string) {
    return getById(id);
  }

  static async getByName(name: string) {
    return getByName(name);
  }

  static async create(name: string) {
    return create(name);
  }
}
