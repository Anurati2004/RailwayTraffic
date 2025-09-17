import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion"; // ✅ animation library

const ReportsPage = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch train data from backend
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/schedule");
        const data = await response.json();
        setTrains(data.data.trains || []);
      } catch (error) {
        console.error("Error fetching train data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading Reports...</p>
      </div>
    );
  }

  // 🔹 Calculate KPIs
  const totalTrains = trains.length;
  const delayedTrains = trains.filter((t) => t.status.includes("Delayed"));
  const avgDelay =
    delayedTrains.reduce((sum, t) => {
      const delayMatch = t.status.match(/(\d+)/);
      return sum + (delayMatch ? parseInt(delayMatch[1]) : 0);
    }, 0) / (delayedTrains.length || 1);

  const onTimePercent =
    (trains.filter((t) => t.status === "On Time").length / totalTrains) * 100;

  const throughput = totalTrains;

  // 🔹 KPI display cards
  const currentKPI = [
    { metric: "Average Delay (min)", value: avgDelay.toFixed(1) },
    { metric: "Throughput (# trains)", value: throughput },
    { metric: "On-Time %", value: onTimePercent.toFixed(1) },
  ];

  // 🔹 Historical example data (you can later fetch real historical from backend)
  const historicalKPI = [
    { day: "Mon", avgDelay: 5, throughput: 10, onTimePercent: 90 },
    { day: "Tue", avgDelay: 7, throughput: 11, onTimePercent: 85 },
    { day: "Wed", avgDelay: 6, throughput: 12, onTimePercent: 88 },
    { day: "Thu", avgDelay: 8, throughput: 9, onTimePercent: 80 },
    { day: "Fri", avgDelay: 4, throughput: 14, onTimePercent: 92 },
  ];

  // 🔹 Merge current data with historical
  const combinedData = [
    ...historicalKPI,
    { day: "Current", avgDelay, throughput, onTimePercent },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      {/* Animate entire page content */}
      <motion.div
        className="flex-grow p-6"
        initial={{ opacity: 0, y: 30 }}   // start hidden + slightly down
        animate={{ opacity: 1, y: 0 }}    // fade in + slide up
        exit={{ opacity: 0, y: -30 }}     // optional fade out
        transition={{ duration: 0.6, ease: "easeOut" }} // smoothness
      >
        <h1 className="text-2xl font-bold mb-6">Train Analytics / KPIs</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {currentKPI.map((kpi) => (
            <motion.div
              key={kpi.metric}
              className="bg-white p-4 rounded shadow text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="font-semibold text-gray-600">{kpi.metric}</h3>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Average Delay Chart */}
        <motion.div
          className="bg-white p-4 rounded shadow mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">Average Delay (min)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgDelay" name="Avg Delay" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* On-Time % Line Chart */}
        <motion.div
          className="bg-white p-4 rounded shadow mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl font-semibold mb-4">On-Time % Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="onTimePercent"
                name="On-Time %"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Throughput Chart */}
        <motion.div
          className="bg-white p-4 rounded shadow mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-xl font-semibold mb-4">Throughput</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="throughput" name="Throughput" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default ReportsPage;
