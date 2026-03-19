import { FileStatus } from "@prisma/client";

export interface UpdateFile {
  status?: FileStatus;
  path?: string;
}
