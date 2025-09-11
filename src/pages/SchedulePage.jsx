import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SchedulePage() {
  const trains = [
    { id: 1, name: "Sealdah Local", type: "Suburban", dir: "Up", time: "10:05", status: "On Time" },
    { id: 2, name: "Howrah Express", type: "Express", dir: "Down", time: "10:20", status: "Delayed" },
    { id: 3, name: "Dum Dum – Barrackpore Local", type: "Suburban", dir: "Up", time: "10:30", status: "On Time" },
    { id: 4, name: "Kolkata Mail", type: "Express", dir: "Down", time: "10:45", status: "On Time" },
    { id: 5, name: "Freight Goods-1", type: "Freight", dir: "Up", time: "11:00", status: "Delayed" },
    { id: 6, name: "Sealdah Shuttle", type: "Suburban", dir: "Down", time: "11:15", status: "On Time" },
    { id: 7, name: "Guwahati Express", type: "Express", dir: "Up", time: "11:30", status: "Delayed" },
    { id: 8, name: "Local Shuttle-2", type: "Suburban", dir: "Down", time: "11:45", status: "On Time" },
    { id: 9, name: "Kolkata Suburban", type: "Suburban", dir: "Up", time: "12:00", status: "On Time" },
    { id: 10, name: "Coal Freight-2", type: "Freight", dir: "Down", time: "12:20", status: "Delayed" },
    { id: 11, name: "Shantipur Local", type: "Suburban", dir: "Up", time: "12:40", status: "On Time" },
    { id: 12, name: "Patna Express", type: "Express", dir: "Down", time: "13:00", status: "On Time" },
    { id: 13, name: "Burdwan Local", type: "Suburban", dir: "Up", time: "13:20", status: "Delayed" },
    { id: 14, name: "North Bengal Express", type: "Express", dir: "Down", time: "13:40", status: "On Time" },
    { id: 15, name: "Maintenance Block", type: "Special", dir: "Up", time: "14:00", status: "Scheduled" }
  ];

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const trainsPerPage = 10; // ✅ Show 10 trains per page

  const filteredTrains = trains.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase()) ||
      t.status.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastTrain = currentPage * trainsPerPage;
  const indexOfFirstTrain = indexOfLastTrain - trainsPerPage;
  const currentTrains = filteredTrains.slice(indexOfFirstTrain, indexOfLastTrain);
  const totalPages = Math.ceil(filteredTrains.length / trainsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />
      <div className="p-6 flex-grow">
        <h2 className="text-2xl font-semibold text-center mb-6">
          📋 Train Schedule – Dum Dum Junction
        </h2>

        <div className="mb-4 flex justify-center">
          <input
            type="text"
            placeholder="Search train, type, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-sm w-1/2"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full shadow-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Train Name</th>
                <th className="border border-gray-300 px-4 py-2">Type</th>
                <th className="border border-gray-300 px-4 py-2">Direction</th>
                <th className="border border-gray-300 px-4 py-2">Time</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentTrains.map((train) => (
                <tr key={train.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{train.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{train.type}</td>
                  <td className="border border-gray-300 px-4 py-2">{train.dir}</td>
                  <td className="border border-gray-300 px-4 py-2">{train.time}</td>
                  <td
                    className={`border border-gray-300 px-4 py-2 font-semibold ${
                      train.status === "On Time"
                        ? "text-green-600"
                        : train.status === "Delayed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {train.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
