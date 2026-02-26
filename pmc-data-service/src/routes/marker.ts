import { MarkerController } from "@controllers/marker";
import { Router } from "express";

const router = Router();

router.get("/list/:layerId", MarkerController.getList);
router.get("/:id", MarkerController.getById);

router.post("/", MarkerController.create);

router.patch("/:id", MarkerController.update);

router.delete("/:id", MarkerController.delete);

export default router;
