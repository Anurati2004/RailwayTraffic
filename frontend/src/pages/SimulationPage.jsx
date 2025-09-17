// frontend/src/pages/SimulationPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// small dot marker
const trainIcon = (isDelayed) =>
  new L.DivIcon({
    className: "train-dot",
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${isDelayed ? "red" : "green"};"></div>`
  });

// Robust time parser: accepts "HH:MM", "HH:MMAM", "HH:MM AM", 24h "23:28" etc.
const toMinutes = (time) => {
  if (!time) return 0;
  const s = String(time).trim();

  // match hh:mm optionally followed by AM/PM (case-insensitive)
  const m = s.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
  if (!m) {
    // If it doesn't match, try to extract digits gracefully
    const parts = s.split(":");
    if (parts.length >= 2) {
      const hh = Number(parts[0]) || 0;
      const minStr = parts[1].replace(/\D/g, "");
      const mm = Number(minStr) || 0;
      return hh * 60 + mm;
    }
    return 0;
  }
  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ampm = m[3];

  if (ampm) {
    const ap = ampm.toLowerCase();
    if (ap === "pm" && hh !== 12) hh += 12;
    if (ap === "am" && hh === 12) hh = 0;
  }
  return hh * 60 + mm;
};

export default function SimulationPage() {
  const [trains, setTrains] = useState([]);
  const [simTime, setSimTime] = useState(600); // 10:00 as minutes
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [disruptionTrain, setDisruptionTrain] = useState(null); // numeric trainNo or null
  const [disruptionCause, setDisruptionCause] = useState("Climate");
  const [isFullScreen, setIsFullScreen] = useState(false);

  // --- fetch trains from backend every 10s ---
  useEffect(() => {
    let mounted = true;
    const fetchTrains = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/schedule");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = (json && json.data && json.data.trains) ? json.data.trains : [];
        if (!mounted) return;
        setTrains(list);

        // initialize disruptionTrain only once when list first loads
        setDisruptionTrain((prev) => (prev == null && list.length > 0 ? list[0].trainNo : prev));
      } catch (err) {
        console.error("Error fetching trains:", err);
      }
    };

    fetchTrains();
    const iv = setInterval(fetchTrains, 10000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  // simulation clock
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSimTime((s) => (s + speed) % 1440), 1000);
    return () => clearInterval(id);
  }, [running, speed]);

  const formatTime = (m) => {
    const hh = Math.floor(m / 60) % 24;
    const mm = m % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  // call backend AI route
  const applyDisruption = async () => {
    if (!disruptionTrain) return;

    try {
      const body = { disruptionTrainId: Number(disruptionTrain), cause: disruptionCause };
      const res = await fetch("http://localhost:5000/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("AI request failed:", res.status);
        return;
      }

      const json = await res.json();

      // server returns { success: true, recommendations: [...] }
      const recArray = Array.isArray(json.recommendations)
        ? json.recommendations
        : Array.isArray(json) // fallback if API responded with raw array
        ? json
        : [];

      const recs = recArray.map((r, i) => ({
        id: Date.now() + i,
        trainId: r.trainNo,
        actionType: r.action || r.actionType || "Suggest",
        text: r.text || r.message || "",
        kpis: r.kpis || {},
      }));

      setRecommendations((prev) => [...recs, ...prev]);
    } catch (err) {
      console.error("Error calling AI:", err);
    }
  };

  const acceptRecommendation = (rec) => {
    setTrains((prev) => prev.map((t) => (t.trainNo === rec.trainId ? { ...t, status: rec.actionType } : t)));
    setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
  };

  const overrideRecommendation = (rec) => {
    setTrains((prev) => prev.map((t) => (t.trainNo === rec.trainId ? { ...t, status: "On Time" } : t)));
    setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
  };

  // compute marker position more defensively
  const getTrainLatLng = (train, i) => {
    const baseLat = 22.57;
    const baseLng = 88.36;
    const journeyDuration = 30;
    const arrivesMin = toMinutes(train.arrives);
    let diff = (simTime - arrivesMin + 1440) % 1440;
    if (!Number.isFinite(diff) || Number.isNaN(diff)) diff = 0;
    let offset = (diff / journeyDuration) * 0.02;
    if (train.direction && String(train.direction).toLowerCase() === "down") offset = -offset;
    if (!Number.isFinite(offset) || Number.isNaN(offset)) offset = 0;
    const lat = baseLat + i * 0.001;
    const lng = baseLng + offset;
    return [lat, lng];
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex flex-grow p-6 space-x-4">
        {/* Left */}
        <div className="w-1/4 bg-white p-4 rounded shadow-lg">
          <h2 className="font-semibold text-lg mb-4 border-b pb-2">Disruption Input</h2>

          <label className="block mb-3">
            Train:
            <select
              value={disruptionTrain ?? ""}
              onChange={(e) => setDisruptionTrain(Number(e.target.value))}
              className="ml-2 px-2 py-1 border rounded w-full"
            >
              <option value="" disabled>
                -- select train --
              </option>
              {trains.map((t) => (
                <option key={t.trainNo} value={t.trainNo}>
                  {t.name} ({t.trainNo})
                </option>
              ))}
            </select>
          </label>

          <label className="block mb-3">
            Cause:
            <select
              value={disruptionCause}
              onChange={(e) => setDisruptionCause(e.target.value)}
              className="ml-2 px-2 py-1 border rounded w-full"
            >
              <option value="Climate">Climate</option>
              <option value="Traffic">Traffic</option>
              <option value="Technical">Technical</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </label>

          <button onClick={applyDisruption} className="w-full px-3 py-2 bg-blue-500 text-white rounded mb-4">
            Suggest Action
          </button>

          <div>
            <h3 className="font-medium mb-2">Simulation Controls</h3>
            <div className="flex items-center space-x-2 mb-2">
              <button onClick={() => setRunning(!running)} className="px-3 py-1 bg-green-500 text-white rounded">
                {running ? "Pause" : "Start"}
              </button>
              <button onClick={() => setSpeed(speed === 8 ? 1 : speed * 2)} className="px-3 py-1 bg-gray-500 text-white rounded">
                Speed: {speed}x
              </button>
            </div>
            <div className="text-sm text-gray-600">Sim Time: {formatTime(simTime)}</div>
          </div>
        </div>

        {/* Center map */}
        <div className="flex-1 bg-white p-4 rounded shadow-lg">
          <h2 className="font-semibold mb-2 border-b pb-2">Live Map (Click to Expand)</h2>
          <MapContainer center={[22.57, 88.36]} zoom={13} scrollWheelZoom={false} className="w-full h-96">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {trains.map((train, i) => {
              const pos = getTrainLatLng(train, i);
              // guard: if non-finite coordinates, skip marker
              if (!pos || !Number.isFinite(pos[0]) || !Number.isFinite(pos[1])) return null;
              const isDelayed = (train.status || "").toLowerCase().includes("delayed");
              return (
                <Marker key={train.trainNo} position={pos} icon={trainIcon(isDelayed)}>
                  <Popup>
                    <div>
                      <strong>{train.name} ({train.trainNo})</strong>
                      <br />Arrives: {train.arrives}
                      <br />Departs: {train.departs}
                      <br />Status: {train.status}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Right */}
        <div className="w-1/4 bg-white p-4 rounded shadow-lg max-h-[70vh] overflow-y-auto">
          <h2 className="font-semibold text-lg mb-4 border-b pb-2">Decision Support</h2>

          <div className="flex flex-col space-y-3">
            {recommendations.length === 0 && <div className="text-gray-500">No recommendations yet.</div>}

            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 border rounded bg-gray-50 shadow-sm hover:bg-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{rec.actionType}</div>
                    <div className="text-sm text-gray-600">{rec.text}</div>
                  </div>
                </div>

                {rec.kpis && (
                  <ul className="mt-2 text-xs text-gray-600">
                    <li>🚆 Punctuality: {rec.kpis.punctualityImpact}</li>
                    <li>📊 Throughput: {rec.kpis.throughputImpact}</li>
                    <li>⏱ Avg Delay: {rec.kpis.avgDelay}</li>
                  </ul>
                )}

                <div className="flex justify-end space-x-2 mt-3">
                  <button onClick={() => acceptRecommendation(rec)} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Accept</button>
                  <button onClick={() => overrideRecommendation(rec)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Override</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
