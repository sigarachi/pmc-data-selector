import { NextFunction, Request, Response } from "express";
import { PmcService } from "@services/pmc";

export class PmcController {
  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await PmcService.getList();

      return res.status(200).json({ list: data });
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

      return res.status(200).json({ list: data });
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
}
