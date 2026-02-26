import { Router } from "express";
import pmcRoutes from "./pmc";
import paramsRoutes from "./params";
import layersRoutes from "./layer";
import markerRoutes from "./marker";

const router = Router();

router.use("/pmc", pmcRoutes);
router.use("/params", paramsRoutes);
router.use("/layer", layersRoutes);
router.use("/marker", markerRoutes);

export default router;
