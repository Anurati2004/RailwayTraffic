import React from "react";
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

const ReportsPage = ({ trains }) => {
  // Calculate KPIs from live train data
  const totalTrains = trains.length;
  const delayedTrains = trains.filter((t) => t.status !== "On Time");
  const avgDelay =
    delayedTrains.reduce((sum, t) => sum + (t.delay || 0), 0) /
    (delayedTrains.length || 1);
  const onTimePercent =
    (trains.filter((t) => t.status === "On Time").length / totalTrains) * 100;
  const throughput = totalTrains;

  // Current KPIs for display cards
  const currentKPI = [
    { metric: "Average Delay (min)", value: avgDelay.toFixed(1) },
    { metric: "Throughput (# trains)", value: throughput },
    { metric: "On-Time %", value: onTimePercent.toFixed(1) },
  ];

  // Historical example data (for comparison)
  const historicalKPI = [
    { day: "Mon", avgDelay: 5, throughput: 10, onTimePercent: 90 },
    { day: "Tue", avgDelay: 7, throughput: 11, onTimePercent: 85 },
    { day: "Wed", avgDelay: 6, throughput: 12, onTimePercent: 88 },
    { day: "Thu", avgDelay: 8, throughput: 9, onTimePercent: 80 },
    { day: "Fri", avgDelay: 4, throughput: 14, onTimePercent: 92 },
  ];

  // Combine historical data with current KPIs
  const combinedData = [
    ...historicalKPI,
    { day: "Current", avgDelay, throughput, onTimePercent },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-6">Train Analytics / KPIs</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {currentKPI.map((kpi) => (
            <div
              key={kpi.metric}
              className="bg-white p-4 rounded shadow text-center"
            >
              <h3 className="font-semibold text-gray-600">{kpi.metric}</h3>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Average Delay Chart */}
        <div className="bg-white p-4 rounded shadow mb-6">
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
        </div>

        {/* On-Time % Line Chart */}
        <div className="bg-white p-4 rounded shadow mb-6">
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
        </div>

        {/* Throughput Chart */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Throughput</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="throughput" name="Throughput" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReportsPage;
