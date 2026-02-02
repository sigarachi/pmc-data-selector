import { PmcController } from "@controllers/pmc";
import { Router } from "express";

const router = Router();

router.get("/list", PmcController.getList);
router.get("/:id", PmcController.getById);

router.post("/", PmcController.create);

export default router;
