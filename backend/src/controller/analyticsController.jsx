import * as optimizationService from "../services/optimizationservice.jsx";
import * as trainService from "../services/trainservice.jsx";

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
