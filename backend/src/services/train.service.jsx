import Train from "../models/train.model.jsx";

export async function listTrains(query = {}) {
  return await Train.find(query);
}

export async function createTrain(data) {
  const train = new Train(data);
  return await train.save();
}
