export async function suggestScheduleAdjustments({ trains }) {
  return trains.map(train => ({
    id: train._id,
    suggestion: "Delay by 5 min to reduce congestion",
    score: Math.random().toFixed(2)
  }));
}
