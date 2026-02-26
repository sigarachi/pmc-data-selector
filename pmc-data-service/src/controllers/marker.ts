import { Request, Response, NextFunction } from "express";
import { CreateMarkerDto } from "../models/marker";
import { LayerService } from "@services/layer";
import { MarkerService } from "@services/marker";

export class MarkerController {
  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { layerId } = req.params;

      if (!layerId) {
        throw new Error("No layer found");
      }

      const candidate = await LayerService.getById(layerId);

      if (!candidate) {
        throw new Error("No layer found");
      }

      const data = await MarkerService.getList(layerId);

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

      const data = await MarkerService.getById(id);

      return res.status(200).json({ marker: data });
    } catch (e) {
      next(e);
    }
  }

  static async create(
    req: Request<never, never, CreateMarkerDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { layerId, name, polygons, type } = req.body;

      if (!layerId) {
        throw new Error("No layer found");
      }

      const candidate = await LayerService.getById(layerId);

      if (!candidate) {
        throw new Error("No layer found");
      }

      const data = await MarkerService.create({
        layerId,
        name,
        polygons,
        type,
      });

      return res.status(201).json({ marker: data });
    } catch (e) {
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

      const candidate = await MarkerService.getById(id);

      if (!candidate) {
        throw new Error("No marker found");
      }

      const data = await MarkerService.update(id, rest);

      return res.status(201).json({ marker: data });
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const data = await MarkerService.delete(id);

      return res.status(203);
    } catch (e) {
      next(e);
    }
  }
}
