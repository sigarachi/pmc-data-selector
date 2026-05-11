export enum Queues {
  GenerateFileTask = "generate-file-task",
  GenerateFileXLSX = "generate-file-xlsx",
}

export type GenerateFileType = "csv" | "xlsx";

export interface GeneraeteFileTaskProps {
  fileId: string;
  type: GenerateFileType;
  pmcId?: string;
}

export interface AMQPClientOptionsSpec {
  url: string;
  queues: Queues[];
}
