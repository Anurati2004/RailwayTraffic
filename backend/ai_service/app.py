# ai_service/app.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn

app = FastAPI(title="Rail AI Service (demo)")

# ---------- Models ----------
class TrainModel(BaseModel):
    trainNo: int
    name: str
    arrives: str
    departs: str
    duration: str
    direction: str
    status: str

class AIRequest(BaseModel):
    disruptionTrainId: int
    cause: str
    trains: List[TrainModel]

# ---------- Helpers ----------
def hhmm_to_minutes(t: str) -> int:
    try:
        h, m = map(int, t.split(":"))
        return h * 60 + m
    except Exception:
        return 0

# ---------- AI endpoint ----------
@app.post("/ai/recommend")
def recommend(req: AIRequest) -> List[Dict[str, Any]]:
    trains = req.trains
    disruption_id = req.disruptionTrainId
    cause = req.cause or "Unknown"

    disruption = next((t for t in trains if t.trainNo == disruption_id), None)
    if not disruption:
        return [{
            "trainNo": disruption_id,
            "trainName": str(disruption_id),
            "action": "None",
            "text": "Disruption train not found in provided trains.",
            "kpis": {"punctualityImpact": "N/A", "throughputImpact": "N/A", "avgDelay": "N/A"}
        }]

    d_arr = hhmm_to_minutes(disruption.arrives)

    # --- Action for disruption train ---
    if cause.lower() == "traffic":
        action_main = "Hold"
        text_main = f"AI suggests holding {disruption.name} ({disruption.trainNo}) due to traffic congestion."
        kpis_main = {"punctualityImpact": "Medium", "throughputImpact": "Medium", "avgDelay": "5-12 min"}
    elif cause.lower() == "maintenance":
        action_main = "Rerouted"
        text_main = f"AI suggests rerouting {disruption.name} ({disruption.trainNo}) to avoid maintenance block."
        kpis_main = {"punctualityImpact": "High", "throughputImpact": "Low", "avgDelay": "10-25 min"}
    elif cause.lower() == "technical":
        action_main = "Delayed"
        text_main = f"AI suggests delaying {disruption.name} ({disruption.trainNo}) due to technical issue."
        kpis_main = {"punctualityImpact": "High", "throughputImpact": "Medium", "avgDelay": "8-20 min"}
    else:
        action_main = "Delayed"
        text_main = f"AI suggests delaying {disruption.name} ({disruption.trainNo}) due to {cause}."
        kpis_main = {"punctualityImpact": "High", "throughputImpact": "Medium", "avgDelay": "5-15 min"}

    recs = [{
        "trainNo": disruption.trainNo,
        "trainName": disruption.name,
        "action": action_main,
        "text": text_main,
        "kpis": kpis_main
    }]

    # --- Find nearest trains by arrival time ---
    neighbors = [(t, hhmm_to_minutes(t.arrives)) for t in trains if t.trainNo != disruption.trainNo]
    sorted_neighbors = sorted(neighbors, key=lambda x: abs(x[1] - d_arr))

    # Pick 2 nearest → Prioritize
    for t, arr in sorted_neighbors[:2]:
        recs.append({
            "trainNo": t.trainNo,
            "trainName": t.name,
            "action": "Prioritize",
            "text": f"AI recommends prioritizing {t.name} ({t.trainNo}) arriving at {t.arrives}.",
            "kpis": {"punctualityImpact": "Improved", "throughputImpact": "Improved", "avgDelay": "Reduced"}
        })

    # Pick next 2 → Proceed
    for t, arr in sorted_neighbors[2:4]:
        recs.append({
            "trainNo": t.trainNo,
            "trainName": t.name,
            "action": "Proceed",
            "text": f"AI suggests allowing {t.name} ({t.trainNo}) to proceed as scheduled.",
            "kpis": {"punctualityImpact": "Low", "throughputImpact": "Neutral", "avgDelay": "0-5 min"}
        })

    # Ignore the rest (do not overload with too many outputs)

    return recs

# ---------- Run ----------
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=6000, reload=True)
