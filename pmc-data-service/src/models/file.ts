import { FileExtension, FileStatus, FileType } from "@prisma/client";
import { FilteredRequest } from "./common";

export interface CreateFileDto {
  name: string;
  type: FileType;
  pmcId?: string;
  extension: FileExtension;
}

export interface UpdateFile {
  status?: FileStatus;
  path?: string;
  name?: string;
  type?: FileType;
  pmcId?: string;
  generationDate?: Date;
  extension?: FileExtension;
}

export type FileFilters = FilteredRequest<
  UpdateFile,
  "name" | "path" | "status" | "pmcId" | "type" | "extension"
>;
