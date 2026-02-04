import { getById, getList, create } from "@db/pmc";
import { CreateParamDto, ParamFilters } from "../models/param";
import { DbFilter } from "../models/common";

export class PmcService {
  static async getList() {
    return getList();
  }

  static async getById(id: string) {
    return getById(id);
  }

  static async create(name: string) {
    return create(name);
  }
}
