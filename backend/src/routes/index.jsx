import { Router } from "express";
import trainRoutes from "./trains.route.jsx";
import analyticsRoutes from "./analytics.route.jsx";

const router = Router();

router.use("/trains", trainRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
