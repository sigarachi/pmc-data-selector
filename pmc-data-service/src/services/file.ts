import {
  create,
  getById,
  updateInfo,
  getList,
  getCount,
  getByFilters,
} from "@db/file";
import { DbFilter } from "@models/common";
import { CreateFileDto, FileFilters, UpdateFile } from "@models/file";

export class FileService {
  static async createFile(values: CreateFileDto) {
    return create(values);
  }

  static async getById(id: string) {
    return getById(id);
  }

  static async getList(
    take: number,
    skip: number,
    filters: FileFilters["filters"],
  ) {
    const preparedFilters: DbFilter<UpdateFile> = {};

    if (filters) {
      filters.forEach((filter) => {
        preparedFilters[filter.field] = {
          [filter.condition]: filter.value,
        };
      });
    }

    return Promise.all([getList(take, skip, preparedFilters), getCount()]);
  }

  static async getOneByFilters(filters: FileFilters["filters"]) {
    const preparedFilters: DbFilter<UpdateFile> = {};

    if (filters) {
      filters.forEach((filter) => {
        preparedFilters[filter.field] = {
          [filter.condition]: filter.value,
        };
      });
    }

    return getByFilters(preparedFilters);
  }

  static async update(id: string, values: UpdateFile) {
    return updateInfo(id, values);
  }
}
