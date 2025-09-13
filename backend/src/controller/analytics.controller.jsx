import * as optimizationService from "../services/optimization.service.jsx";
import * as trainService from "../services/train.service.jsx";

export async function suggestOptimizations(req, res, next) {
  try {
    const trains = await trainService.listTrains();
    const suggestions = await optimizationService.suggestScheduleAdjustments({
      trains,
      constraints: {}
    });
    res.json({ success: true, suggestions });
  } catch (err) {
    next(err);
  }
}
