import { MarkerController } from "@controllers/marker";
import { Router } from "express";

const router = Router();

router.get("/:id", MarkerController.getById);

router.post("/list/:pmcId", MarkerController.getList);
router.post("/", MarkerController.create);

router.patch("/:id", MarkerController.update);

router.delete("/:id", MarkerController.delete);

export default router;
