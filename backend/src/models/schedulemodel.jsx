import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
  trainId: { type: mongoose.Schema.Types.ObjectId, ref: "Train", required: true },
  status: { type: String, enum: ["on-time", "delayed"], default: "on-time" },
  delayMinutes: { type: Number, default: 0 }
});

export default mongoose.model("Schedule", ScheduleSchema);
