import { create, getList, update, getById, deleteMarker } from "@db/marker";
import { CreateMarkerDto, MarkerFilters } from "../models/marker";
import { DbFilter } from "@models/common";

export class MarkerService {
  static async getList(pmcId: string, filters?: MarkerFilters["filters"]) {
    const preparedFilters: DbFilter<CreateMarkerDto> = {};

    if (filters) {
      filters.forEach((filter) => {
        preparedFilters[filter.field] = {
          [filter.condition]: filter.value,
        };
      });
    }

    return getList(pmcId, preparedFilters);
  }

  static async getById(id: string) {
    return getById(id);
  }

  static async create(values: CreateMarkerDto) {
    return create({ ...values });
  }

  static async update(id: string, values: Partial<CreateMarkerDto>) {
    return update(id, { ...values });
  }

  static async delete(id: string) {
    return deleteMarker(id);
  }
}
