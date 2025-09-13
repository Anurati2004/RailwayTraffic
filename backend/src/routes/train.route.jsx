import { Router } from "express";
import { getTrains, createTrain } from "../controllers/trains.controller.jsx";

const router = Router();

router.get("/", getTrains);
router.post("/", createTrain);

export default router;
