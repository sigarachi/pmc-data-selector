import { getList, getById, create, deleteLayer, getAll } from "@db/layers";
import { CreateLayerDto } from "../models/layer";

export class LayerService {
  static async getList(pmcId: string) {
    return getList(pmcId);
  }

  static async getAll() {
    return getAll();
  }

  static async getById(id: string) {
    return getById(id);
  }

  static async create(args: CreateLayerDto) {
    return create(args);
  }

  static async delete(id: string) {
    return deleteLayer(id);
  }
}
