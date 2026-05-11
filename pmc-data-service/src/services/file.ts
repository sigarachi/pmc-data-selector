import { create, getById, updateInfo, getList, getCount } from "@db/file";
import { UpdateFile } from "@models/file";

export class FileService {
  static async createFile(name: string) {
    return create(name);
  }

  static async getById(id: string) {
    return getById(id);
  }

  static async getList(take: number, skip: number) {
    return Promise.all([getList(take, skip), getCount()]);
  }

  static async update(id: string, values: UpdateFile) {
    return updateInfo(id, values);
  }
}
