import { Router } from "express";
import pmcRoutes from "./pmc";
import paramsRoutes from "./params";
import markerRoutes from "./marker";
import fileRoutes from "./file";

const router = Router();

router.use("/pmc", pmcRoutes);
router.use("/params", paramsRoutes);
router.use("/marker", markerRoutes);
router.use("/file", fileRoutes);

export default router;
