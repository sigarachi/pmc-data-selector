export enum Queues {
  GenerateFileTask = "generate-file-task",
  GenerateFileXLSX = "generate-file-xlsx",
  GeneratePmcParamsTask = "generate-pmc-params",
}

export type GenerateFileType = "csv" | "xlsx";

export type AMQPMode = "DEV" | "PROD";

export interface GeneraeteFileTaskProps {
  fileId: string;
  type: GenerateFileType;
  pmcId?: string;
}

export interface AMQPClientOptionsSpec {
  url: string;
  queues: Queues[];
  mode: AMQPMode;
}
