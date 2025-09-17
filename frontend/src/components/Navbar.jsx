import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [dateTime, setDateTime] = useState(new Date());
  const location = useLocation();

  // ⏱️ Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🗓️ Format time, date, and day in Indian Time
  const time = dateTime.toLocaleTimeString("en-IN", {
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
  const date = dateTime.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const day = dateTime.toLocaleDateString("en-IN", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  });

  const navItems = [
    { name: "Schedule", path: "/" },
    { name: "Simulation", path: "/simulation" },
    { name: "Reports", path: "/reports" },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg px-6 py-3 flex justify-between items-center">
      {/* 🚉 Junction Name */}
      <div className="font-bold text-2xl">🚉 Dum Dum Junction</div>

      {/* ⏱️ Live Clock */}
      <div className="text-right hidden sm:block">
        <div className="text-lg font-semibold">{time}</div>
        <div className="text-sm">{day}, {date}</div>
      </div>

      {/* 🔗 Navigation Links */}
      <div className="flex space-x-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-2 rounded-md font-medium transition 
              ${location.pathname === item.path
                ? "bg-white text-blue-600"
                : "hover:bg-blue-500 hover:shadow-lg"}`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
