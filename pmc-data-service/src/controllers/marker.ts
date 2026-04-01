import { Request, Response, NextFunction } from "express";
import { CreateMarkerDto, MarkerFilters } from "../models/marker";
import { MarkerService } from "@services/marker";
import logger from "../libs/logger";
import { PmcService } from "@services/pmc";

export class MarkerController {
  static async getList(
    req: Request<never, never, MarkerFilters>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { pmcId } = req.params;
      const { filters } = req.body;

      logger.info(
        `[Marker] Get list pmcId=${pmcId}, filters=${JSON.stringify(filters)}`,
      );

      if (!pmcId) {
        throw new Error("No pmc found");
      }

      const candidate = await PmcService.getById(pmcId);

      if (!candidate) {
        throw new Error("No pmc found");
      }

      const data = await MarkerService.getList(pmcId, filters);

      return res
        .status(200)
        .json({ markers: data.map((item) => ({ ...item })) });
    } catch (e) {
      next(e);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      logger.info(`[Marker] Get id=${id}`);

      const data = await MarkerService.getById(id);

      return res.status(200).json({ marker: data });
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }

  static async create(
    req: Request<never, never, CreateMarkerDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { pmcId, name, polygons, type, dateTime } = req.body;

      logger.info(
        `[Marker] Create layerId=${pmcId}, ${JSON.stringify(req.body)}`,
      );

      if (!pmcId) {
        throw new Error("No pmc found");
      }

      const candidate = await PmcService.getById(pmcId);

      if (!candidate) {
        throw new Error("No pmc found");
      }

      const markerCandidate = await MarkerService.getList(pmcId, [
        { field: "type", value: type, condition: "equals" },
      ]);

      if (markerCandidate.length) {
        throw new Error("Marker already created");
      }

      const data = await MarkerService.create({
        pmcId,
        name,
        polygons,
        dateTime,
        type,
      });

      return res.status(201).json({ marker: data });
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }

  static async update(
    req: Request<never, never, Partial<CreateMarkerDto>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const { ...rest } = req.body;

      logger.info(`[Marker] Update id=${id}, ${JSON.stringify(rest)}`);

      const candidate = await MarkerService.getById(id);

      if (!candidate) {
        throw new Error("No marker found");
      }

      const data = await MarkerService.update(id, rest);

      return res.status(201).json({ marker: data });
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      logger.info(`[Marker] Delete id=${id}`);

      await MarkerService.delete(id);

      return res.status(203);
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }
}
