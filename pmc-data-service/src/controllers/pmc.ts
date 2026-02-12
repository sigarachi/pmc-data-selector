import { NextFunction, Request, Response } from "express";
import { PmcService } from "@services/pmc";
import { UploadedFile } from "express-fileupload";
import { convertCsvToJson } from "../utils/csv-to-json";
import { CsvParamName, CsvParamNameMap } from "../models/param";
import { ParamsService } from "@services/params";
import { PmcFilters } from "../models/pmc";
import { PaginatedRequest } from "../models/common";

export class PmcController {
  static async getList(
    req: Request<never, never, PmcFilters, PaginatedRequest>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { filters } = req.body;
      const { page, pageSize } = req.query;

      const offset = Number(page) || 1;
      const limit = Number(pageSize) || 10;

      const skip = (offset - 1) * limit;

      const [data, count] = await PmcService.getList(limit, skip, filters);

      const totalPages = Math.ceil(count / limit);

      return res
        .status(200)
        .json({
          list: data,
          page,
          pageSize,
          isLastPage: offset === totalPages,
        });
    } catch (e) {
      next(e);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("No id provided");
      }

      const data = await PmcService.getById(id);

      return res.status(200).json({ pmc: data });
    } catch (e) {
      next(e);
    }
  }

  static async create(
    req: Request<never, never, { name: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const payload = req.body;

      if (!payload) {
        throw new Error("error in request body");
      }

      const data = await PmcService.create(payload.name);

      return res.status(200).json(data);
    } catch (e) {
      next(e);
    }
  }

  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files;

      if (!files) {
        throw new Error("No file provided");
      }

      if (files) {
        const file: UploadedFile = files.file as UploadedFile;

        const promises: Array<Promise<unknown>> = [];

        const candidates: Array<Record<CsvParamName, string>> =
          convertCsvToJson(file.data.toString());

        candidates.forEach(async (item) => {
          const name = `ПМЦ ${item.datetime_formation}`;

          let pmc = await PmcService.getByName(name);

          if (!pmc) {
            pmc = await PmcService.create(name);
          }

          Object.keys(item).forEach((value: string) => {
            const field = value as CsvParamName;

            promises.push(
              ParamsService.create(pmc.id, {
                name: CsvParamNameMap[field],
                type: field.includes("coords") ? "coords" : "string",
                value: item[field],
              }),
            );
          });
        });
        await Promise.all(promises);
      }

      return res.status(200);
    } catch (e) {
      next(e);
    }
  }
}
