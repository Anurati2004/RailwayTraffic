// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// ---------- MongoDB ----------
const MONGO_URI =
  "mongodb+srv://sayanghosh965_db_user:6zvZdBnE6c7TYlza@traindata.z6deka6.mongodb.net/trainDB?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------- Schema ----------
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

// ---------- New Initial Data ----------
const initialTrains = [
  {
    trainNo: 33533,
    name: "SEALDAH - HASNABAD Local",
    arrives: "10:26AM",
    departs: "10:27AM",
    duration: "1 min",
    direction: "Up",
    status: "On Time",
  },
  {
    trainNo: 33661,
    name: "BANGAON - SEALDAH Local",
    arrives: "10:25AM",
    departs: "10:26AM",
    duration: "1 min",
    direction: "Down",
    status: "On Time",
  },
  {
    trainNo: 31341,
    name: "SEALDAH - NAIHATI Local",
    arrives: "10:32AM",
    departs: "10:33AM",
    duration: "1 min",
    direction: "Up",
    status: "On Time",
  },
  {
    trainNo: 30326,
    name: "HASANABAD - SEALDAH Local",
    arrives: "10:31AM",
    departs: "10:32AM",
    duration: "1 min",
    direction: "Down",
    status: "On Time",
  },
  {
    trainNo: 33687,
    name: "NAIHATI - SEALDAH Local",
    arrives: "10:23AM",
    departs: "10:24AM",
    duration: "1 min",
    direction: "Down",
    status: "On Time",
  },
  {
    trainNo: 31241,
    name: "SEALDAH - BARRACKPORE Local",
    arrives: "10:40AM",
    departs: "10:41AM",
    duration: "1 min",
    direction: "Up",
    status: "On Time",
  },
  {
    trainNo: 33688,
    name: "GOBARDANGA - SEALDAH Local",
    arrives: "10:34AM",
    departs: "10:35AM",
    duration: "1 min",
    direction: "Down",
    status: "On Time",
  },
  {
    trainNo: 33666,
    name: "LALGOLA - KRISHNANAGAR CITY - SEALDAH Local",
    arrives: "10:33AM",
    departs: "10:35AM",
    duration: "2 min",
    direction: "Down",
    status: "On Time",
  },
  {
    trainNo: 31449,
    name: "FREIGHT TRAIN",
    arrives: "10:35AM",
    departs: "10:35AM",
    duration: "0 min",
    direction: "Up",
    status: "On Time",
  },
  {
    trainNo: 31239,
    name: "BARRACKPORE - SEALDAH Local",
    arrives: "10:56AM",
    departs: "10:57AM",
    duration: "1 min",
    direction: "Down",
    status: "On Time",
  },
  {
    trainNo: 32248,
    name: "AJMER SF Express",
    arrives: "10:50AM",
    departs: "10:50AM",
    duration: "0 min",
    direction: "Up",
    status: "On Time",
  },
  {
    trainNo: 32246,
    name: "DANKUNI - SEALDAH Local",
    arrives: "11:08AM",
    departs: "11:09AM",
    duration: "1 min",
    direction: "Down",
    status: "On Time",
  },
  {
    trainNo: 32244,
    name: "SEALDAH - BANGAON Local",
    arrives: "11:00AM",
    departs: "11:01AM",
    duration: "1 min",
    direction: "Up",
    status: "On Time",
  },
  {
    trainNo: 32242,
    name: "SEALDAH - DURONTO EXPRESS",
    arrives: "11:10AM",
    departs: "11:10AM",
    duration: "0 min",
    direction: "Down",
    status: "On Time",
  },
];

// ---------- Seed DB (Replace old with new) ----------
async function seedDB() {
  await Train.deleteMany({}); // clear old data
  await Train.insertMany(initialTrains);
  console.log("📌 Replaced train data with new dataset");
}
seedDB();

// ---------- Helpers ----------
function addRandomDelay(train) {
  const delay = Math.floor(Math.random() * 16) - 2; // -2 to +13 mins
  let status = "On Time";
  if (delay > 0) status = `Delayed by ${delay} min`;
  else if (delay < 0) status = `Arriving ${Math.abs(delay)} min early`;
  return { ...train, status };
}

// ---------- Routes ----------
app.get("/api/schedule", async (req, res) => {
  try {
    const trains = await Train.find().lean();
    const liveData = trains.map((t) => addRandomDelay(t));
    res.json({ data: { trains: liveData } });
  } catch (error) {
    console.error("Error fetching trains:", error);
    res.status(500).json({ message: "Error fetching trains" });
  }
});

// returns minimal train list for dropdowns
app.get("/api/trains", async (req, res) => {
  try {
    const trains = await Train.find({}, { _id: 0, trainNo: 1, name: 1 }).lean();
    res.json(trains);
  } catch (error) {
    console.error("Error fetching train list:", error);
    res.status(500).json({ message: "Error fetching trains" });
  }
});

// Forward to Python AI service
app.post("/api/ai/recommend", async (req, res) => {
  try {
    const { disruptionTrainId, cause } = req.body;
    const trains = await Train.find().lean();

    const payload = {
      disruptionTrainId,
      cause,
      trains: trains.map((t) => ({
        trainNo: t.trainNo,
        name: t.name,
        arrives: t.arrives,
        departs: t.departs,
        duration: t.duration,
        direction: t.direction,
        status: t.status || "On Time",
      })),
    };

    const aiUrl = "http://localhost:6000/ai/recommend";
    const aiRes = await axios.post(aiUrl, payload, { timeout: 10000 });

    res.json({ success: true, recommendations: aiRes.data });
  } catch (err) {
    console.error("AI endpoint error:", err.message || err);
    res.status(500).json({ success: false, error: "AI service error" });
  }
});

// fallback decision
app.post("/api/decision", async (req, res) => {
  try {
    const { trainNo, cause } = req.body;
    const train = await Train.findOne({ trainNo }).lean();
    if (!train) return res.status(404).json({ suggestion: "Train not found" });

    let suggestion = "No action required.";
    if (cause === "Climate")
      suggestion = `Delay train ${train.name} (${train.trainNo}) by 15 minutes due to weather.`;
    else if (cause === "Technical")
      suggestion = `Redirect ${train.name} (${train.trainNo}) to maintenance.`;
    else if (cause === "Accident")
      suggestion = `Hold ${train.name} (${train.trainNo}) at next station.`;

    res.json({ suggestion });
  } catch (err) {
    console.error("Error in /api/decision:", err);
    res.status(500).json({ suggestion: "Error generating decision" });
  }
});

// ---------- Start ----------
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚉 Train Server running at http://localhost:${PORT}`)
);
