import mongoose from "mongoose";

const TrainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  route: { type: String, required: true },
  departure: { type: Date, required: true },
  arrival: { type: Date, required: true }
});

export default mongoose.model("Train", TrainSchema);
