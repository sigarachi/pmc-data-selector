import { create, getList, update, getById, deleteMarker } from "@db/marker";
import { CreateMarkerDto } from "../models/marker";

export class MarkerService {
  static async getList(layerId: string) {
    return getList(layerId);
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
