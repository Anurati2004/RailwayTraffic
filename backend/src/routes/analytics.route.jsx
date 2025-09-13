import { Router } from "express";
import { suggestOptimizations } from "../controllers/analytics.controller.jsx";

const router = Router();

router.get("/suggestions", suggestOptimizations);

export default router;

