import { LayerService } from "@services/layer";
import { PmcService } from "@services/pmc";
import { NextFunction, Request, Response } from "express";
import { CreateLayerDto } from "../models/layer";
import logger from "../libs/logger";

export class LayerController {
  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { pmcId } = req.params;

      logger.info(`[Layer] List pmcId=${pmcId}`);

      if (!pmcId) {
        throw new Error("No pmc found");
      }

      const candidate = await PmcService.getById(pmcId);

      if (!candidate) {
        throw new Error("No pmc found");
      }

      const data = await LayerService.getList(pmcId);

      return res.status(200).json({ layers: data });
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      logger.info(`[Layer] Find ${id}`);

      if (!id) {
        throw new Error("No layer found");
      }

      const data = await LayerService.getById(id);

      return res.status(200).json({ layer: data });
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }

  static async create(
    req: Request<never, never, CreateLayerDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { pmcId, name, date } = req.body;

      logger.info(`[Layer] Create pmcId=${pmcId}, name=${name}, date=${date}`);

      const candidate = await PmcService.getById(pmcId);

      if (!candidate) {
        throw new Error("No pmc found");
      }

      const data = await LayerService.create({ pmcId, name, date });

      return res.status(201).json({ layer: data });
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      logger.info(`[Layer] Delete ${id}`);

      if (!id) {
        throw new Error("No layer found");
      }

      const data = await LayerService.delete(id);

      return res.status(201).json({ layer: data });
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }
}
