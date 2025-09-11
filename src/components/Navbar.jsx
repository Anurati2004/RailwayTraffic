import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [dateTime, setDateTime] = useState(new Date());

  // ⏱️ Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🗓️ Format time, date, and day in Indian Time
  const time = dateTime.toLocaleTimeString("en-IN", { hour12: false, timeZone: "Asia/Kolkata" });
  const date = dateTime.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
  const day = dateTime.toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" });

  return (
    <nav className="bg-blue-600 text-white shadow-lg p-4 flex justify-between items-center">
      {/* 🚉 Junction Name */}
      <div className="font-bold text-xl">🚉 Dum Dum Junction</div>

      {/* ⏱️ Live Clock */}
      <div className="text-sm text-gray-200 hidden sm:block">
        <div>{time}</div>
        <div>{day}, {date}</div>
      </div>

      {/* 🔗 Navigation Links */}
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Schedule</Link>
        <Link to="/simulation" className="hover:underline">Simulation</Link>
        <Link to="/reports" className="hover:underline">Reports</Link>
      </div>
    </nav>
  );
}
