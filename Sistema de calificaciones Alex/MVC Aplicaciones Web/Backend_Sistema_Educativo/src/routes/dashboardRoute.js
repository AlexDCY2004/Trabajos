import { Router } from "express";
import { obtenerResumenDashboard } from "../controllers/dashboardController.js";

const router = Router();

router.get("/resumen", obtenerResumenDashboard);

export default router;