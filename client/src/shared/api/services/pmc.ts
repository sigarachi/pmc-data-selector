import { network } from "../common";
import type { ListReponse } from "../models/pmc";

export class PmcService {
  static async getList(): Promise<ListReponse> {
    const { data } = await network.get<ListReponse>(`/pmc-api/pmc/list`);

    return data;
  }

  static async create(name: string): Promise<void> {
    await network.post(`/pmc-api/pmc`, { name });
  }
}
