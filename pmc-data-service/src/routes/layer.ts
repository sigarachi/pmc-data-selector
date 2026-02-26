import { LayerController } from "@controllers/layer";
import { Router } from "express";

const router = Router();

router.get("/list/:pmcId", LayerController.getList);
router.get("/:id", LayerController.getById);

router.post("/", LayerController.create);

router.delete("/:id", LayerController.delete);

export default router;
