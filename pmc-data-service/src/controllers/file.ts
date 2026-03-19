import { NextFunction, Request, Response } from "express";
import { amqp } from "@libs/amqp";
import { Queues } from "@libs/amqp/interfaces";
import { FileService } from "@services/file";

export class FileController {
  static async startGeneration(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const file = await FileService.createFile("");

      if (!file) {
        throw new Error("Error on creating file");
      }

      amqp.send(Queues.GenerateFileTask, { fileId: file.id });
      res.send(200);
    } catch (e) {
      next(e);
    }
  }
}
