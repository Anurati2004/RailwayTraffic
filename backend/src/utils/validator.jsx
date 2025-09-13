export function validateTrainInput(data) {
  if (!data.name || !data.route) {
    throw new Error("Train must have a name and route");
  }
  return true;
}
