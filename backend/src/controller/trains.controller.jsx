import * as trainService from "../services/train.service.jsx";

export async function getTrains(req, res, next) {
  try {
    const trains = await trainService.listTrains(req.query);
    res.json({ success: true, data: trains });
  } catch (err) {
    next(err);
  }
}

export async function createTrain(req, res, next) {
  try {
    const created = await trainService.createTrain(req.body);
    res.status(201).json({ success: true, created });
  } catch (err) {
    next(err);
  }
}
