import { network } from "../common";
import type { CreateParam, ListReponse } from "../models/param";

export class ParamService {
  static async getList(pmcId: string): Promise<ListReponse> {
    const { data } = await network.get<ListReponse>(`/pmc-api/params/${pmcId}`);

    return data;
  }

  static async create(args: CreateParam): Promise<void> {
    await network.post<ListReponse>(`/pmc-api/params/${args.pmcId}`, {
      name: args.name,
      value: args.value,
    });
  }
}
