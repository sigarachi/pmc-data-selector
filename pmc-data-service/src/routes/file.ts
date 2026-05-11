import { FileController } from "@controllers/file";
import { Router } from "express";

const router = Router();
export default router;

router.get("/list", FileController.getList);
router.get("/:id/download", FileController.getFile);

router.post("/generate", FileController.startGeneration);
