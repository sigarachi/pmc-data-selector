import { create, getList } from "@db/params";
import { CreateParamDto } from "../models/param";

export class ParamsService {
  static async getList(pmcId: string) {
    return getList(pmcId);
  }

  static async create(pmcId: string, values: CreateParamDto) {
    return create(pmcId, values);
  }
}
