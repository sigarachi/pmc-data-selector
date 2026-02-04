import { ParamsController } from "@controllers/params";
import { Router } from "express";

const router = Router();

router.post("/:pmcId", ParamsController.getList);

router.post("/create/:pmcId", ParamsController.createParam);

export default router;
