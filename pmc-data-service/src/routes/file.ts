import { FileController } from "@controllers/file";
import { Router } from "express";

const router = Router();
export default router;

router.get("/generate", FileController.startGeneration);
