import { ParamsService } from "@services/params";
import { PmcService } from "@services/pmc";
import { NextFunction, Request, Response } from "express";
import { CreateParamDto, ParamFilters } from "../models/param";

export class ParamsController {
  static async getList(
    req: Request<never, never, ParamFilters>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { pmcId } = req.params;

      const { filters } = req.body;

      if (!pmcId) {
        throw new Error("No pmc found");
      }

      const candidate = await PmcService.getById(pmcId);

      if (!candidate) {
        throw new Error("No pmc found");
      }

      const data = await ParamsService.getList(pmcId, filters);

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
