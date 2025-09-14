import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Replace with your MongoDB Atlas URI
const MONGO_URI = "mongodb+srv://sayanghosh965_db_user:6zvZdBnE6c7TYlza@traindata.z6deka6.mongodb.net/";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🔹 Train Schema
const trainSchema = new mongoose.Schema({
  trainNo: Number,
  name: String,
  arrives: String,
  departs: String,
  duration: String,
  direction: String,
  status: String,
});

const Train = mongoose.model("Train", trainSchema);

// 🔹 Initial trains
const initialTrains = [
  { trainNo: 31451, name: "SEALDAH - NAIHATI Local", arrives: "23:28", departs: "23:29", duration: "1 min", direction: "Up", status: "On Time" },
  { trainNo: 33661, name: "SEALDAH - HABRA Local", arrives: "14:17", departs: "14:18", duration: "1 min", direction: "Up", status: "On Time" },
  { trainNo: 31341, name: "SEALDAH - KALYANI SIMANTA Local", arrives: "22:18", departs: "22:19", duration: "1 min", direction: "Up", status: "On Time" },
  { trainNo: 30326, name: "HASANABAD - SEALDAH Local", arrives: "10:31", departs: "10:32", duration: "1 min", direction: "Down", status: "On Time" },
  { trainNo: 33687, name: "SEALDAH - GOBARDANGA Local", arrives: "14:17", departs: "14:18", duration: "1 min", direction: "Up", status: "On Time" },
  { trainNo: 31241, name: "SEALDAH - BARRACKPORE Local", arrives: "08:25", departs: "08:26", duration: "1 min", direction: "Up", status: "On Time" },
  { trainNo: 33688, name: "GOBARDANGA - SEALDAH Local", arrives: "17:13", departs: "17:14", duration: "1 min", direction: "Down", status: "On Time" },
  { trainNo: 33666, name: "HABRA - SEALDAH Local", arrives: "21:04", departs: "21:05", duration: "1 min", direction: "Down", status: "On Time" },
  { trainNo: 31449, name: "SEALDAH - NAIHATI Local", arrives: "23:27", departs: "23:28", duration: "1 min", direction: "Up", status: "On Time" },
  { trainNo: 31239, name: "SEALDAH - BARRACKPORE Local", arrives: "18:41", departs: "18:42", duration: "1 min", direction: "Up", status: "On Time" },
  { trainNo: 32248, name: "DANKUNI - SEALDAH Local", arrives: "20:56", departs: "20:57", duration: "1 min", direction: "Down", status: "On Time" },
  { trainNo: 32246, name: "DANKUNI - SEALDAH Local", arrives: "19:38", departs: "19:39", duration: "1 min", direction: "Down", status: "On Time" },
  { trainNo: 32244, name: "DANKUNI - SEALDAH Local", arrives: "18:56", departs: "18:57", duration: "1 min", direction: "Down", status: "On Time" },
  { trainNo: 32242, name: "DANKUNI - SEALDAH Local", arrives: "18:32", departs: "18:33", duration: "1 min", direction: "Down", status: "On Time" },
];

// 🔹 Seed DB only if empty
async function seedDB() {
  const count = await Train.countDocuments();
  if (count === 0) {
    await Train.insertMany(initialTrains);
    console.log("📌 Inserted initial trains into MongoDB Atlas");
  }
}
seedDB();

// 🔹 Generate random delay
function addRandomDelay(train) {
  const delay = Math.floor(Math.random() * 16) - 2; // -2 to +13 mins
  let status = "On Time";
  if (delay > 0) status = `Delayed by ${delay} min`;
  else if (delay < 0) status = `Arriving ${Math.abs(delay)} min early`;

  return { ...train._doc, status };
}

// 🔹 API Endpoint
app.get("/api/schedule", async (req, res) => {
  try {
    const trains = await Train.find();
    const liveData = trains.map((t) => addRandomDelay(t));
    res.json({ data: { trains: liveData } });
  } catch (error) {
    console.error("Error fetching trains:", error);
    res.status(500).json({ message: "Error fetching trains" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚉 Train Server running at http://localhost:${PORT}`));
