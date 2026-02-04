import { network } from "../common";
import type { CreateParam, ListReponse, ParamFilters } from "../models/param";

export class ParamService {
  static async getList(
    pmcId: string,
    filters?: ParamFilters,
  ): Promise<ListReponse> {
    const { data } = await network.post<ListReponse>(
      `/pmc-api/params/${pmcId}`,
      filters,
    );

    return data;
  }

  static async create(args: CreateParam): Promise<void> {
    await network.post<ListReponse>(`/pmc-api/params/create/${args.pmcId}`, {
      name: args.name,
      value: args.value,
      type: args.type,
    });
  }
}
