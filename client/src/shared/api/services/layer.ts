import { network } from "../common";
import type {
  CreateLayer,
  LayerListResponse,
  LayerReponse,
} from "../models/layer";

export class LayerService {
  static async getList(pmcId: string): Promise<LayerListResponse> {
    const { data } = await network.get<LayerListResponse>(
      `/pmc-api/layer/list/${pmcId}`,
    );

    return data;
  }

  static async getById(id: string): Promise<LayerReponse> {
    const { data } = await network.get<LayerReponse>(`/pmc-api/layer/${id}`);

    return data;
  }

  static async create(args: CreateLayer): Promise<void> {
    await network.post(`/pmc-api/layer`, args);
  }

  static async delete(id: string): Promise<void> {
    await network.delete(`/pmc-api/layer/${id}`);
  }
}
