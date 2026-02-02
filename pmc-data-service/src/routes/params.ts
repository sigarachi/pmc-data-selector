import { ParamsController } from "@controllers/params";
import { Router } from "express";

const router = Router();

router.get("/:pmcId", ParamsController.getList);

router.post("/:pmcId", ParamsController.createParam);

export default router;
