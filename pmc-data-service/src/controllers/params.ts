import { ParamsService } from "@services/params";
import { PmcService } from "@services/pmc";
import { NextFunction, Request, Response } from "express";
import { CreateParamDto } from "../models/param";

export class ParamsController {
  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { pmcId } = req.params;

      if (!pmcId) {
        throw new Error("No pmc found");
      }

      const candidate = await PmcService.getById(pmcId);

      if (!candidate) {
        throw new Error("No pmc found");
      }

      const data = await ParamsService.getList(pmcId);

      return res.status(200).json({ params: data });
    } catch (e) {
      next(e);
    }
  }

  static async createParam(
    req: Request<never, never, CreateParamDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const payload = req.body;
      const { pmcId } = req.params;

      if (!payload || !pmcId) {
        throw new Error("Error in request body");
      }

      const candidate = await PmcService.getById(pmcId);

      if (!candidate) {
        throw new Error("No pmc found");
      }

      await ParamsService.create(pmcId, payload);

      res.send(201);
    } catch (e) {
      next(e);
    }
  }
}
