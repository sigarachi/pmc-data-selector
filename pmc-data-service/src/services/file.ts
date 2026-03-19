import { create, getById, updateInfo } from "@db/file";
import { UpdateFile } from "@models/file";

export class FileService {
  static async createFile(name: string) {
    return create(name);
  }

  static async getById(id: string) {
    return getById(id);
  }

  static async update(id: string, values: UpdateFile) {
    return updateInfo(id, values);
  }
}
