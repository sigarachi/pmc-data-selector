export enum Queues {
  GenerateFileTask = "generate-file-task",
}

export interface GeneraeteFileTaskProps {
  fileId: string;
}

export interface AMQPClientOptionsSpec {
  url: string;
  queues: Queues[];
}
