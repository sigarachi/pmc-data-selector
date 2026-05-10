import { NextFunction, Request, Response } from "express";
import { amqp } from "@libs/amqp";
import { Queues } from "@libs/amqp/interfaces";
import { FileService } from "@services/file";
import logger from "@libs/logger";
import path from "path";

export class FileController {
  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const files = await FileService.getList();

      return res.send({ files });
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }

  static async getFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      logger.info(`[File] attempting to download the file with id=${id}`);

      const file = await FileService.getById(id);

      if (!file) {
        throw new Error("[File]: no such file");
      }

      if (file.status !== "done") {
        throw new Error("[File]: file is generating");
      }

      return res.sendFile(path.resolve(file.path));
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }

  static async startGeneration(
    req: Request<never, never, { id?: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.body;

      if (!id) {
      }

      const file = await FileService.createFile("");

      if (!file) {
        throw new Error("Error on creating file");
      }

      amqp.send(Queues.GenerateFileTask, { fileId: file.id });
      res.sendStatus(200);
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }
}
