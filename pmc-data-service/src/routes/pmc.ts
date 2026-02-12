import { PmcController } from "@controllers/pmc";
import { Router } from "express";

const router = Router();

router.post("/list", PmcController.getList);
router.get("/:id", PmcController.getById);

router.post("/", PmcController.create);
router.post("/upload-csv", PmcController.upload);

export default router;
