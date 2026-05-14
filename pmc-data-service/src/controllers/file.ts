import { NextFunction, Request, Response } from "express";
import { amqp } from "@libs/amqp";
import { GenerateFileType, Queues } from "@libs/amqp/interfaces";
import { FileService } from "@services/file";
import logger from "@libs/logger";
import path from "path";
import { PaginatedRequest } from "@models/common";

export class FileController {
  static async getList(
    req: Request<never, never, never, PaginatedRequest>,
    res: Response,
    next: NextFunction,
  ) {
    const reqId = req.headers["request-id"];
    try {
      const { page, pageSize } = req.query;

      logger.info(`[File] Get list page=${page}, pageSize=${pageSize}`, {
        reqId,
      });

      const offset = Number(page) || 1;
      const limit = Number(pageSize) || 10;

      const skip = (offset - 1) * limit;

      const [files, count] = await FileService.getList(limit, skip);

      const totalPages = Math.ceil(count / limit);

      return res.send({
        files,
        page,
        pageSize,
        isLastPage: offset === totalPages,
      });
    } catch (e) {
      logger.error((e as Error).message, { reqId });
      next(e);
    }
  }

  static async getFile(req: Request, res: Response, next: NextFunction) {
    const reqId = req.headers["request-id"];
    try {
      const { id } = req.params;

      logger.info(`[File] attempting to download the file with id=${id}`, {
        reqId,
      });

      const file = await FileService.getById(id);

      if (!file) {
        throw new Error("[File]: no such file");
      }

      if (file.status !== "done") {
        throw new Error("[File]: file is generating");
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.name}"`,
      );

      return res.sendFile(path.resolve(file.path));
    } catch (e) {
      logger.error((e as Error).message, { reqId });
      next(e);
    }
  }

  static async startGeneration(
    req: Request<never, never, { id?: string; type: GenerateFileType }>,
    res: Response,
    next: NextFunction,
  ) {
    const reqId = req.headers["request-id"];
    try {
      const { id, type } = req.body;

      const file = await FileService.createFile("");

      if (!file) {
        throw new Error("Error on creating file");
      }

      amqp.send(Queues.GenerateFileTask, { fileId: file.id, type, pmcId: id });
      res.sendStatus(200);
    } catch (e) {
      logger.error((e as Error).message, { reqId });
      next(e);
    }
  }
}
