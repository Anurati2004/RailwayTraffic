import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SchedulePage from "./pages/SchedulePage";
import SimulationPage from "./pages/SimulationPage";
import ReportsPage from "./pages/ReportsPage";

import { trainList as initialTrains } from "./data/trainData";

export default function App() {
  const [trains, setTrains] = useState(initialTrains);

  const updateSchedule = (trainId, status) => {
    setTrains((prev) =>
      prev.map((t) => (t.id === Number(trainId) ? { ...t, status } : t))
    );
  };

  return (
    <>
      

      <Routes>
        <Route
          path="/"
          element={<SchedulePage trains={trains} updateSchedule={updateSchedule} />}
        />
        <Route
          path="/simulation"
          element={<SimulationPage trains={trains} updateSchedule={updateSchedule} />}
        />
        <Route
          path="/reports"
          element={<ReportsPage trains={trains} />}
        />
      </Routes>
      </>
    
  );
}
