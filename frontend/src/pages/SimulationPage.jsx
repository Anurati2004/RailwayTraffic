import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Simple dot marker
const trainIcon = (isDelayed) =>
  new L.DivIcon({
    className: "train-dot animate-pulse",
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${
      isDelayed ? "red" : "green"
    };"></div>`,
  });

const toMinutes = (time) => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export default function SimulationPage() {
  const [trains, setTrains] = useState([]);
  const [simTime, setSimTime] = useState(600); // 10:00 start
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [disruptionTrain, setDisruptionTrain] = useState("");
  const [disruptionCause, setDisruptionCause] = useState("Climate");
  const [isFullScreen, setIsFullScreen] = useState(false);

  // 🔹 Fetch train data from backend
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/schedule");
        const data = await res.json();
        setTrains(data.data.trains);
        if (data.data.trains.length > 0) {
          setDisruptionTrain(data.data.trains[0].trainNo); // default first train
        }
      } catch (err) {
        console.error("Error fetching trains:", err);
      }
    };

    fetchTrains();
    const interval = setInterval(fetchTrains, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Clock update
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSimTime((prev) => (prev + speed) % 1440);
    }, 1000);
    return () => clearInterval(interval);
  }, [running, speed]);

  // Disruption logic
  const suggestAction = (cause) => {
    if (cause === "Traffic") return "Hold";
    if (cause === "Maintenance") return "Rerouted";
    return "Delayed";
  };

  const applyDisruption = () => {
    const action = suggestAction(disruptionCause);
    const rec = {
      id: Date.now(),
      trainId: disruptionTrain,
      actionType: action,
      text: `Suggested to ${action} Train ${disruptionTrain} due to ${disruptionCause}`,
    };
    setRecommendations((prev) => [rec, ...prev]);
    updateSchedule(disruptionTrain, action);
  };

  const updateSchedule = (trainId, action) => {
    setTrains((prev) =>
      prev.map((t) =>
        t.trainNo === trainId ? { ...t, status: action } : t
      )
    );
  };

  const acceptRecommendation = (rec) => {
    updateSchedule(rec.trainId, rec.actionType);
    setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
  };

  const overrideRecommendation = (rec) => {
    updateSchedule(rec.trainId, "On Time");
    setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
  };

  const formatTime = (m) => {
    const hh = Math.floor(m / 60) % 24;
    const mm = m % 60;
    return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
  };

  // Fake positions for demo
  const getTrainLatLng = (train, index) => {
    const baseLat = 22.57;
    const baseLng = 88.36;
    const journeyDuration = 30;
    const diff = (simTime - toMinutes(train.arrives) + 1440) % 1440;
    let offset = (diff / journeyDuration) * 0.02;
    if (train.direction === "Down") offset = -offset;
    return [baseLat + index * 0.001, baseLng + offset];
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex flex-grow p-6 space-x-4">
        {/* Left Panel */}
        <div className="w-1/4 bg-white p-4 rounded shadow-lg">
          <h2 className="font-semibold text-lg mb-4 border-b pb-2">Disruption Input</h2>
          <label className="block mb-2">
            Train:
            <select
              value={disruptionTrain}
              onChange={(e) => setDisruptionTrain(Number(e.target.value))}
              className="ml-2 px-2 py-1 border rounded w-full"
            >
              {trains.map((t) => (
                <option key={t.trainNo} value={t.trainNo}>
                  {t.name} ({t.trainNo})
                </option>
              ))}
            </select>
          </label>
          <label className="block mb-2">
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
          <button
            onClick={applyDisruption}
            className="px-3 py-2 bg-blue-500 text-white rounded mt-2 w-full hover:bg-blue-600 transition"
          >
            Suggest Action
          </button>

          <div className="mt-6">
            <h2 className="font-semibold mb-2">Simulation Controls</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setRunning(!running)}
                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => setSpeed(speed === 8 ? 1 : speed * 2)}
                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Speed: {speed}x
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">Sim Time: {formatTime(simTime)}</p>
          </div>
        </div>

        {/* Center Panel - Map */}
        <div
          className="flex-1 bg-white p-4 rounded shadow-lg cursor-pointer"
          onClick={() => setIsFullScreen(true)}
        >
          <h2 className="font-semibold mb-2 border-b pb-2">Live Map (Click to Expand)</h2>
          <MapContainer center={[22.57, 88.36]} zoom={13} scrollWheelZoom={false} className="w-full h-96">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {trains.map((train, i) => {
              const pos = getTrainLatLng(train, i);
              const isDelayed = train.status.includes("Delayed") || train.status === "Hold";
              return (
                <Marker key={train.trainNo} position={pos} icon={trainIcon(isDelayed)}>
                  <Popup>
                    <div>
                      <strong>{train.name} ({train.trainNo})</strong>
                      <br />
                      Direction: {train.direction}
                      <br />
                      Arrives: {train.arrives}
                      <br />
                      Departs: {train.departs}
                      <br />
                      Status: {train.status}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Right Panel - Decision Support */}
        <div className="w-1/4 bg-white p-4 rounded shadow-lg max-h-[70vh] overflow-y-auto">
          <h2 className="font-semibold text-lg mb-4 border-b pb-2">Decision Support</h2>
          <div className="flex flex-col space-y-3">
            {recommendations.map((rec) => {
              let badgeColor = "bg-green-200 text-green-800";
              if (rec.actionType === "Delayed") badgeColor = "bg-red-200 text-red-800";
              if (rec.actionType === "Hold") badgeColor = "bg-yellow-200 text-yellow-800";
              if (rec.actionType === "Rerouted") badgeColor = "bg-purple-200 text-purple-800";

              const train = trains.find((t) => t.trainNo === rec.trainId);

              return (
                <div
                  key={rec.id}
                  className="p-3 border rounded bg-gray-50 shadow-sm hover:bg-gray-100 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 text-sm font-medium rounded ${badgeColor}`}>
                      {rec.actionType}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600 text-sm">
                    {train?.name} ({train?.trainNo}) → {rec.text}
                  </p>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition"
                      onClick={() => acceptRecommendation(rec)}
                    >
                      Accept
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                      onClick={() => overrideRecommendation(rec)}
                    >
                      Override
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col">
          <button
            onClick={() => setIsFullScreen(false)}
            className="text-white p-2 m-2 bg-red-600 rounded"
          >
            Close
          </button>
          <div className="flex-grow">
            <MapContainer center={[22.57, 88.36]} zoom={13} scrollWheelZoom={true} className="w-full h-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {trains.map((train, i) => {
                const pos = getTrainLatLng(train, i);
                const isDelayed = train.status.includes("Delayed") || train.status === "Hold";
                return (
                  <Marker key={train.trainNo} position={pos} icon={trainIcon(isDelayed)}>
                    <Popup>
                      <div>
                        <strong>{train.name} ({train.trainNo})</strong>
                        <br />
                        Direction: {train.direction}
                        <br />
                        Arrives: {train.arrives}
                        <br />
                        Departs: {train.departs}
                        <br />
                        Status: {train.status}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
