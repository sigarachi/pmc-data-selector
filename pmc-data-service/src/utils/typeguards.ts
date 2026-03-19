import { GeneraeteFileTaskProps } from "../libs/amqp/interfaces";

export const isFileRequest = (obj: object): obj is GeneraeteFileTaskProps => {
  return Boolean("fileId" in obj);
};
