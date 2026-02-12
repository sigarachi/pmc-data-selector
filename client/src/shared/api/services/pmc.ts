import { network } from "../common";
import type { PmcListReponse, PmcById, PmcFilters } from "../models/pmc";

export class PmcService {
  static async getList(
    page: number,
    pageSize: number,
    filters: PmcFilters,
  ): Promise<PmcListReponse> {
    const { data } = await network.post<PmcListReponse>(
      `/pmc-api/pmc/list?page=${page}&pageSize=${pageSize}`,
      filters,
    );

    return data;
  }

  static async getById(id: string): Promise<PmcById> {
    const { data } = await network.get<PmcById>(`/pmc-api/pmc/${id}`);

    return data;
  }

  static async create(name: string): Promise<void> {
    await network.post(`/pmc-api/pmc`, { name });
  }
}
