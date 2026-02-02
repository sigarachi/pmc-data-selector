import { Router } from "express";
import pmcRoutes from "./pmc";
import paramsRoutes from "./params";

const router = Router();

router.use("/pmc", pmcRoutes);
router.use("/params", paramsRoutes);

export default router;
